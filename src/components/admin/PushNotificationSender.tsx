
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { Send, Bell, Users } from 'lucide-react';

const PushNotificationSender = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const sendNotificationMutation = useMutation({
    mutationFn: async ({ title, message }: { title: string; message: string }) => {
      const response = await supabase.functions.invoke('send-push-notifications', {
        body: { title, message }
      });

      if (response.error) {
        throw new Error(response.error.message || 'فشل في إرسال الإشعارات');
      }

      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "تم الإرسال بنجاح",
        description: `تم إرسال الإشعار إلى ${data.sent_count} مستخدم`,
      });
      setTitle('');
      setMessage('');
    },
    onError: (error: any) => {
      console.error('Error sending notifications:', error);
      toast({
        title: "خطأ في الإرسال",
        description: error.message || "حدث خطأ أثناء إرسال الإشعارات",
        variant: "destructive",
      });
    },
  });

  const handleSendNotification = () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء العنوان والرسالة",
        variant: "destructive",
      });
      return;
    }

    sendNotificationMutation.mutate({ title: title.trim(), message: message.trim() });
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="text-s3m-red flex items-center gap-2">
          <Send className="w-5 h-5" />
          إرسال الإشعارات للمستخدمين
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Bell className="w-4 h-4" />
            <span className="font-medium">معلومات هامة</span>
          </div>
          <p className="text-sm text-blue-300">
            سيتم إرسال الإشعار لجميع المستخدمين الذين فعلوا الإشعارات في أجهزتهم.
            الإشعار سيظهر على الهواتف والحواسيب حتى لو كانوا خارج الموقع.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="notification-title" className="text-white">عنوان الإشعار</Label>
            <Input
              id="notification-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: إعلان مهم من فريق قهار"
              className="mt-1"
              maxLength={50}
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/50 حرف</p>
          </div>

          <div>
            <Label htmlFor="notification-message" className="text-white">نص الإشعار</Label>
            <Textarea
              id="notification-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب نص الإشعار هنا..."
              className="mt-1 min-h-[100px]"
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1">{message.length}/200 حرف</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleSendNotification}
            disabled={sendNotificationMutation.isPending || !title.trim() || !message.trim()}
            className="bg-s3m-red hover:bg-red-600 flex-1"
          >
            <Users className="w-4 h-4 ml-2" />
            {sendNotificationMutation.isPending ? 'جاري الإرسال...' : 'إرسال لجميع المستخدمين'}
          </Button>
        </div>

        {/* معاينة الإشعار */}
        {(title.trim() || message.trim()) && (
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-800/50">
            <h4 className="text-white font-medium mb-2">معاينة الإشعار:</h4>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-s3m-red rounded-full"></div>
                <span className="text-white font-medium text-sm">
                  {title || 'عنوان الإشعار'}
                </span>
              </div>
              <p className="text-gray-300 text-sm">
                {message || 'نص الإشعار'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationSender;
