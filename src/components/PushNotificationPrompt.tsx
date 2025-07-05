
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { PushNotificationService } from '@/services/pushNotifications';

const PushNotificationPrompt = () => {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // عرض الطلب بعد 3 ثوان من تحميل الصفحة للمستخدمين المسجلين
    if (user && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleAllowNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const service = PushNotificationService.getInstance();
    
    const permissionGranted = await service.requestPermission();
    if (permissionGranted) {
      const subscribed = await service.subscribeToPushNotifications(user.id);
      if (subscribed) {
        await service.showLocalNotification(
          'مرحباً بك في فريق قهار!',
          'تم تفعيل الإشعارات بنجاح. ستصلك الإشعارات المهمة من الموقع.'
        );
      }
    }
    
    setIsLoading(false);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="bg-black/90 border-s3m-red/30 max-w-md w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-s3m-red/20 rounded-full">
                <Bell className="w-6 h-6 text-s3m-red" />
              </div>
              <h3 className="text-white font-bold text-lg">تفعيل الإشعارات</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="text-white hover:bg-s3m-red/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-gray-300 mb-6 text-sm leading-relaxed">
            احصل على آخر الأخبار والإشعارات المهمة من فريق قهار مباشرة على جهازك. 
            لن نرسل لك إشعارات مزعجة، فقط المحتوى المهم.
          </p>
          
          <div className="flex gap-3">
            <Button
              onClick={handleAllowNotifications}
              disabled={isLoading}
              className="flex-1 bg-s3m-red hover:bg-red-600"
            >
              {isLoading ? 'جاري التفعيل...' : 'تفعيل الإشعارات'}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1 border-gray-600 text-white hover:bg-gray-800"
            >
              ليس الآن
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PushNotificationPrompt;
