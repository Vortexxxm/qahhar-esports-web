
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="gaming-card">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-s3m-red mb-4">سياسة الخصوصية</CardTitle>
              <p className="text-white/70">كيف نحمي ونستخدم معلوماتك الشخصية</p>
            </CardHeader>
            <CardContent className="space-y-6 text-white/90 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">1. المعلومات التي نجمعها</h2>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li><strong>معلومات الحساب:</strong> الاسم، البريد الإلكتروني، معرف اللعبة</li>
                  <li><strong>معلومات الاستخدام:</strong> سجل النشاط، الإحصائيات، النقاط</li>
                  <li><strong>معلومات تقنية:</strong> عنوان IP، نوع المتصفح، الجهاز المستخدم</li>
                  <li><strong>ملفات تعريف الارتباط:</strong> لتحسين تجربة الاستخدام</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">2. كيف نستخدم معلوماتك</h2>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>إدارة حسابك وتقديم الخدمات</li>
                  <li>تنظيم البطولات وحساب النقاط</li>
                  <li>التواصل معك بخصوص الأنشطة والأحداث</li>
                  <li>تحسين موقعنا وخدماتنا</li>
                  <li>ضمان الأمان ومنع الاحتيال</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">3. مشاركة المعلومات</h2>
                <p className="mb-3">نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك المعلومات في الحالات التالية:</p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>مع موافقتك الصريحة</li>
                  <li>لتنفيذ الخدمات التي طلبتها</li>
                  <li>للامتثال للقوانين أو الأوامر القضائية</li>
                  <li>لحماية حقوقنا أو سلامة المستخدمين</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">4. أمان البيانات</h2>
                <p>
                  نستخدم تدابير أمان متقدمة لحماية معلوماتك، بما في ذلك التشفير وحماية الخوادم 
                  والمراقبة المستمرة. ومع ذلك، لا يمكن ضمان الأمان بنسبة 100% عبر الإنترنت.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">5. حقوقك</h2>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li><strong>الوصول:</strong> يمكنك طلب نسخة من بياناتك الشخصية</li>
                  <li><strong>التصحيح:</strong> تحديث أو تصحيح معلوماتك</li>
                  <li><strong>الحذف:</strong> طلب حذف حسابك وبياناتك</li>
                  <li><strong>النقل:</strong> الحصول على بياناتك بصيغة قابلة للنقل</li>
                  <li><strong>الاعتراض:</strong> الاعتراض على معالجة بياناتك لأغراض معينة</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">6. ملفات تعريف الارتباط</h2>
                <p>
                  نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتذكر تفضيلاتك. 
                  يمكنك إدارة هذه الملفات من خلال إعدادات المتصفح الخاص بك.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">7. خدمات الطرف الثالث</h2>
                <p>
                  موقعنا قد يحتوي على روابط لمواقع أطراف ثالثة. نحن غير مسؤولين 
                  عن ممارسات الخصوصية لهذه المواقع.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">8. الأطفال تحت 13 عامًا</h2>
                <p>
                  خدماتنا غير مخصصة للأطفال تحت 13 عامًا. إذا علمنا أن طفلاً 
                  أقل من 13 عامًا قد قدم معلومات شخصية، سنحذفها فورًا.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">9. تغييرات على السياسة</h2>
                <p>
                  قد نحدث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات مهمة 
                  عبر الموقع أو البريد الإلكتروني.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">10. التواصل معنا</h2>
                <p>
                  إذا كان لديك أي أسئلة حول سياسة الخصوصية أو تريد ممارسة حقوقك، 
                  يرجى التواصل معنا عبر البريد الإلكتروني أو من خلال صفحة الاتصال.
                </p>
              </section>

              <div className="mt-8 p-4 bg-s3m-red/10 rounded-lg border border-s3m-red/30">
                <p className="text-center text-sm">
                  تاريخ آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
