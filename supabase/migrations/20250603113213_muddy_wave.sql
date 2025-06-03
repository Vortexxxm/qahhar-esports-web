/*
  # Create notifications table and triggers

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `message` (text)
      - `type` (text)
      - `read` (boolean)
      - `created_at` (timestamp)
      - `data` (jsonb)

  2. Security
    - Enable RLS on notifications table
    - Add policies for users to read their own notifications
    - Add policies for admins to manage all notifications

  3. Functions
    - Create function to send notifications
    - Create triggers for join requests and tournament registrations
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  data jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT valid_type CHECK (type IN ('join_request', 'tournament_registration', 'admin_action', 'system'))
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Function to send notifications
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_data jsonb DEFAULT '{}'::jsonb
) RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, data)
  VALUES (p_user_id, p_title, p_message, p_type, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for join requests
CREATE OR REPLACE FUNCTION notify_on_join_request() RETURNS trigger AS $$
DECLARE
  v_admin_ids uuid[];
BEGIN
  -- Get all admin user IDs
  SELECT array_agg(user_id) INTO v_admin_ids
  FROM user_roles WHERE role = 'admin';
  
  -- If it's a new request, notify admins
  IF (TG_OP = 'INSERT') THEN
    -- Notify each admin
    FOR i IN 1..array_length(v_admin_ids, 1) LOOP
      PERFORM send_notification(
        v_admin_ids[i],
        'طلب انضمام جديد',
        'لديك طلب انضمام جديد من ' || NEW.full_name || ' - راجعه من لوحة التحكم',
        'join_request',
        jsonb_build_object('request_id', NEW.id)
      );
    END LOOP;
  
  -- If the status changed, notify the user
  ELSIF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    IF NEW.status = 'approved' THEN
      PERFORM send_notification(
        NEW.user_id,
        'تم قبول طلبك!',
        'تم قبول طلب انضمامك للفريق بنجاح 🎉',
        'admin_action',
        jsonb_build_object('request_id', NEW.id)
      );
    ELSIF NEW.status = 'rejected' THEN
      PERFORM send_notification(
        NEW.user_id,
        'تم رفض طلبك',
        'عذراً، تم رفض طلب انضمامك للفريق ❌',
        'admin_action',
        jsonb_build_object('request_id', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_join_request_change
  AFTER INSERT OR UPDATE ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_join_request();

-- Trigger for tournament registrations
CREATE OR REPLACE FUNCTION notify_on_tournament_registration() RETURNS trigger AS $$
DECLARE
  v_admin_ids uuid[];
BEGIN
  -- Get all admin user IDs
  SELECT array_agg(user_id) INTO v_admin_ids
  FROM user_roles WHERE role = 'admin';
  
  -- If it's a new registration, notify admins
  IF (TG_OP = 'INSERT') THEN
    -- Notify each admin
    FOR i IN 1..array_length(v_admin_ids, 1) LOOP
      PERFORM send_notification(
        v_admin_ids[i],
        'تسجيل جديد في بطولة',
        'لديك طلب تسجيل جديد في البطولة من فريق ' || NEW.team_name || ' - راجعه من لوحة التحكم',
        'tournament_registration',
        jsonb_build_object('registration_id', NEW.id)
      );
    END LOOP;
  
  -- If the status changed, notify the team leader
  ELSIF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    IF NEW.status = 'approved' THEN
      PERFORM send_notification(
        NEW.leader_id,
        'تم قبول تسجيلك في البطولة!',
        'تم قبول تسجيل فريقك في البطولة بنجاح 🎉',
        'admin_action',
        jsonb_build_object('registration_id', NEW.id)
      );
    ELSIF NEW.status = 'rejected' THEN
      PERFORM send_notification(
        NEW.leader_id,
        'تم رفض التسجيل',
        'عذراً، تم رفض طلب تسجيل فريقك في البطولة ❌',
        'admin_action',
        jsonb_build_object('registration_id', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_tournament_registration_change
  AFTER INSERT OR UPDATE ON tournament_registrations
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_tournament_registration();