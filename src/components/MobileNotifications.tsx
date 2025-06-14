
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

const MobileNotifications = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'مرحباً بك في S3M',
      message: 'أهلاً وسهلاً بك في فريق S3M E-Sports!',
      type: 'success',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      title: 'بطولة جديدة',
      message: 'تم إضافة بطولة جديدة - سجل الآن!',
      type: 'info',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'error': return 'border-red-500 bg-red-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  if (!isMobile) return null;

  return (
    <>
      {/* Notification Bell Icon */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-black/50 backdrop-blur-sm border border-s3m-red/30 hover:bg-s3m-red/20"
        >
          <Bell className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-s3m-red"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <Card className="fixed top-16 left-4 right-4 max-h-96 overflow-y-auto bg-black/90 border-s3m-red/30" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-s3m-red/30 flex items-center justify-between">
              <h3 className="text-white font-bold">الإشعارات</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-s3m-red hover:bg-s3m-red/20 text-xs"
                  >
                    قراءة الكل
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white hover:bg-s3m-red/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  لا توجد إشعارات
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        getNotificationColor(notification.type)
                      } ${!notification.read ? 'border-opacity-100' : 'border-opacity-50 opacity-70'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-gray-300 text-xs mb-2">
                            {notification.message}
                          </p>
                          <span className="text-gray-500 text-xs">
                            {notification.timestamp.toLocaleTimeString('ar-SA', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-s3m-red rounded-full ml-2 mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default MobileNotifications;
