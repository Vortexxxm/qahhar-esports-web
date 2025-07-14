
-- تحديث جدول site_settings لإضافة خيار الفيديو الترويجي
INSERT INTO site_settings (key, value, description)
VALUES 
  ('homepage_trailer', NULL, 'Video URL or file path for homepage trailer'),
  ('homepage_video_file', NULL, 'Uploaded video file for homepage trailer')
ON CONFLICT (key) DO NOTHING;

-- إضافة دعم لرفع الفيديوهات في storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-videos', 'admin-videos', true)
ON CONFLICT (id) DO NOTHING;

-- إنشاء سياسة للسماح للمشرفين برفع الفيديوهات
CREATE POLICY "Admins can upload videos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'admin-videos' AND 
  (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
);

-- إنشاء سياسة للسماح للجميع بعرض الفيديوهات
CREATE POLICY "Everyone can view admin videos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'admin-videos');

-- حذف جميع الجداول المتعلقة بفرع البنات
DROP TABLE IF EXISTS girls_weekly_ratings CASCADE;
DROP TABLE IF EXISTS girls_training_schedule CASCADE; 
DROP TABLE IF EXISTS girls_suggestions CASCADE;
DROP TABLE IF EXISTS girls_profiles CASCADE;
DROP TABLE IF EXISTS girls_join_requests CASCADE;
DROP TABLE IF EXISTS girls_highlights CASCADE;
DROP TABLE IF EXISTS girls_gallery CASCADE;
DROP TABLE IF EXISTS girls_blog CASCADE;
DROP TABLE IF EXISTS girls_awards CASCADE;
DROP TABLE IF EXISTS girls_announcements CASCADE;
