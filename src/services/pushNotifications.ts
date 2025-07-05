
import { supabase } from '@/integrations/supabase/client';

export class PushNotificationService {
  private static instance: PushNotificationService;
  
  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('هذا المتصفح لا يدعم الإشعارات');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async subscribeToPushNotifications(userId: string): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push messaging is not supported');
        return false;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Use a valid VAPID public key or generate one
      const vapidPublicKey = 'BEl62iUYgUivyIkv69yViA3O6tJHm5MQJ4x9HmQSL5p0QiG8JJ3_9BCZS-OM_w7-GHrg-Y3n9IwzD7bECo5lnxc';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      // Save subscription to database - the table exists now
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          subscription: JSON.stringify(subscription),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving push subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async showLocalNotification(title: string, body: string): Promise<void> {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 's3m-notification'
      });
    }
  }
}
