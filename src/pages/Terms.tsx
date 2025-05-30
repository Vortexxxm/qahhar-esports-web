
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="gaming-card">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-s3m-red mb-4">الشروط والأحكام</CardTitle>
              <p className="text-white/70">شروط وأحكام استخدام موقع S3M E-Sports</p>
            </CardHeader>
            <CardContent className="space-y-6 text-white/90 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">1. القبول بالشروط</h2>
                <p>
                  باستخدامك لموقع S3M E-Sports، فإنك توافق على الالتزام بهذه الشروط والأحكام. 
                  إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">2. العضوية والحساب</h2>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>يجب أن تكون 13 عامًا أو أكثر لإنشاء حساب</li>
                  <li>يجب تقديم معلومات صحيحة ودقيقة عند التسجيل</li>
                  <li>أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك</li>
                  <li>يحق لنا إنهاء أو تعليق حسابك في حالة انتهاك الشروط</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">3. قواعد السلوك</h2>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>يُمنع التنمر أو التحرش أو السلوك غير المناسب</li>
                  <li>يُمنع استخدام لغة مسيئة أو غير لائقة</li>
                  <li>يُمنع الغش أو استخدام برامج غير قانونية في الألعاب</li>
                  <li>احترام جميع أعضاء المجتمع والفريق</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">4. المحتوى والملكية الفكرية</h2>
                <p>
                  جميع المحتويات على هذا الموقع، بما في ذلك النصوص والصور والشعارات، 
                  هي ملكية خاصة لفريق S3M E-Sports ومحمية بموجب قوانين حقوق النشر.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">5. البطولات والمنافسات</h2>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>يجب اتباع جميع قوانين البطولات المحددة</li>
                  <li>القرارات النهائية للحكام والإدارة نهائية</li>
                  <li>يحق للإدارة تعديل قوانين البطولات</li>
                  <li>المشاركة في البطولات تعني الموافقة على هذه الشروط</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">6. إخلاء المسؤولية</h2>
                <p>
                  فريق S3M E-Sports غير مسؤول عن أي أضرار مباشرة أو غير مباشرة قد تنتج 
                  عن استخدام الموقع أو المشاركة في الأنشطة.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">7. تعديل الشروط</h2>
                <p>
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين 
                  بأي تغييرات مهمة عبر الموقع أو البريد الإلكتروني.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-s3m-red mb-3">8. القانون الحاكم</h2>
                <p>
                  تخضع هذه الشروط لقوانين المملكة العربية السعودية، 
                  وأي نزاع سيتم حله وفقًا لهذه القوانين.
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

export default Terms;
