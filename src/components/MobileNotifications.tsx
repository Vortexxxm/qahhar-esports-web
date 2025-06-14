
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const MobileNotifications = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .then(() => {
        // Refresh notifications
      });
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds)
        .then(() => {
          // Refresh notifications
        });
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'error': return 'border-red-500 bg-red-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  if (!isMobile || !user) return null;

  return (
    <>
      {/* Notification Bell Icon - positioned next to profile */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-white hover:bg-gray-700"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-s3m-red"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
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
                            {new Date(notification.created_at).toLocaleTimeString('ar-SA', {
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
