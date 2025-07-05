
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      throw new Error('لم يتم توفير صورة');
    }

    // إرسال الصورة لـ OpenAI للتحليل
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `أنت مساعد ذكي متخصص في استخراج بيانات المتصدرين من الصور. 
            مهمتك هي تحليل صورة تحتوي على ترتيب اللاعبين واستخراج:
            1. ترتيب اللاعب (الرقم)
            2. اسم اللاعب
            3. نقاط اللاعب
            
            أرجع النتيجة في صيغة JSON فقط بهذا الشكل:
            {
              "leaderboard": [
                {"rank": 1, "name": "اسم اللاعب", "points": 1500},
                {"rank": 2, "name": "اسم اللاعب", "points": 1400}
              ]
            }
            
            تأكد من:
            - استخراج جميع الأسماء والنقاط الظاهرة في الصورة
            - ترتيب النتائج حسب الترتيب الظاهر في الصورة
            - استخدام الأسماء العربية كما تظهر في الصورة
            - تحويل النقاط إلى أرقام صحيحة`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'حلل هذه الصورة واستخرج بيانات المتصدرين'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // محاولة استخراج JSON من الاستجابة
    let leaderboardData;
    try {
      // البحث عن JSON في الاستجابة
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        leaderboardData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('لم يتم العثور على بيانات JSON في الاستجابة');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('فشل في تحليل استجابة الذكاء الاصطناعي');
    }

    // التحقق من صحة البيانات
    if (!leaderboardData.leaderboard || !Array.isArray(leaderboardData.leaderboard)) {
      throw new Error('بيانات غير صحيحة من الذكاء الاصطناعي');
    }

    // تنظيف وتحسين البيانات
    const cleanedLeaderboard = leaderboardData.leaderboard
      .filter((entry: any) => entry.name && entry.points !== undefined)
      .map((entry: any, index: number) => ({
        rank: entry.rank || index + 1,
        name: entry.name.trim(),
        points: parseInt(entry.points) || 0
      }))
      .sort((a: any, b: any) => a.rank - b.rank);

    return new Response(
      JSON.stringify({ 
        leaderboard: cleanedLeaderboard,
        total: cleanedLeaderboard.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in extract-leaderboard function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'حدث خطأ في معالجة الصورة',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
