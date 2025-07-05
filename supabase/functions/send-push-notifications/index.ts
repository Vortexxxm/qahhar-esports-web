
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

    // Get all active push subscriptions
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

    // Send notifications to each subscription using Web Push Protocol
    for (const sub of subscriptions) {
      try {
        const subscription = JSON.parse(sub.subscription);
        
        // Using the Web Push Protocol for browser notifications
        const payload = JSON.stringify({
          title: title,
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 's3m-notification'
        });

        // For production, you would use a proper Web Push library
        // For now, we'll create a local notification through the service worker
        const pushPromise = fetch(subscription.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '60'
          },
          body: payload
        }).then(response => {
          if (response.ok || response.status === 410) {
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

    // Wait for all notifications
    await Promise.allSettled(pushPromises);

    // Save notification to database for records
    await supabase
      .from('notifications')
      .insert({
        title: title,
        message: message,
        type: 'broadcast',
        user_id: null // Public notification
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
