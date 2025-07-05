
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, message } = await req.json();

    if (!title || !message) {
      throw new Error('العنوان والرسالة مطلوبان');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // الحصول على جميع اشتراكات الإشعارات النشطة
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('subscription');

    if (fetchError) {
      throw new Error('فشل في جلب الاشتراكات: ' + fetchError.message);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'لا توجد اشتراكات نشطة', sent_count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    const pushPromises = [];

    // إرسال الإشعارات لكل اشتراك
    for (const sub of subscriptions) {
      try {
        const subscription = JSON.parse(sub.subscription);
        
        const pushPromise = fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'key=YOUR_FCM_SERVER_KEY' // يحتاج تكوين FCM
          },
          body: JSON.stringify({
            to: subscription.endpoint,
            notification: {
              title: title,
              body: message,
              icon: '/favicon.ico'
            }
          })
        }).then(response => {
          if (response.ok) {
            sentCount++;
          }
          return response;
        }).catch(error => {
          console.error('خطأ في إرسال الإشعار:', error);
        });

        pushPromises.push(pushPromise);
      } catch (error) {
        console.error('خطأ في معالجة الاشتراك:', error);
      }
    }

    // انتظار جميع الإشعارات
    await Promise.allSettled(pushPromises);

    // حفظ الإشعار في قاعدة البيانات للسجلات
    await supabase
      .from('notifications')
      .insert({
        title: title,
        message: message,
        type: 'broadcast',
        user_id: null // إشعار عام
      });

    return new Response(
      JSON.stringify({ 
        message: 'تم إرسال الإشعارات بنجاح',
        sent_count: sentCount,
        total_subscriptions: subscriptions.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('خطأ في إرسال الإشعارات:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'حدث خطأ في إرسال الإشعارات',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
