
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Target, Gamepad2, Star, Award, Crown, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/30 to-transparent" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-s3m-red via-red-500 to-orange-500 bg-clip-text text-transparent animate-glow">
              S3M
            </h1>
            <p className="text-xl md:text-2xl text-white mb-4 font-semibold">
              أقوى فريق في Free Fire
            </p>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              انضم إلى النخبة. كن جزءاً من الأسطورة. اصنع التاريخ معنا.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/join-us">
                <Button size="lg" className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red text-white px-8 py-4 text-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-2xl">
                  <Users className="mr-2 h-6 w-6" />
                  انضم إلينا الآن
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-bold transform hover:scale-105 transition-all duration-300">
                  <Trophy className="mr-2 h-6 w-6" />
                  تعرف علينا
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-s3m-red mb-2">50+</div>
                <div className="text-white/70">لاعب محترف</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-s3m-red mb-2">100+</div>
                <div className="text-white/70">بطولة فائزة</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-s3m-red mb-2">5</div>
                <div className="text-white/70">سنوات خبرة</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-s3m-red mb-2">#1</div>
                <div className="text-white/70">في المنطقة</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="py-20 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1920&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-s3m-red/10 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">لماذا S3M؟</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              نحن لسنا مجرد فريق، نحن عائلة من المحاربين المتحدين للوصول إلى القمة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="gaming-card hover:scale-105 transition-all duration-300">
              <CardHeader className="text-center">
                <Crown className="h-12 w-12 text-s3m-red mx-auto mb-4" />
                <CardTitle className="text-white">النخبة المطلقة</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70 text-center">
                  لاعبون محترفون مدربون على أعلى مستوى لتحقيق الانتصارات
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="gaming-card hover:scale-105 transition-all duration-300">
              <CardHeader className="text-center">
                <Target className="h-12 w-12 text-s3m-red mx-auto mb-4" />
                <CardTitle className="text-white">دقة لا تضاهى</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70 text-center">
                  تدريب مكثف على الدقة والسرعة لضمان الفوز في كل معركة
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="gaming-card hover:scale-105 transition-all duration-300">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-s3m-red mx-auto mb-4" />
                <CardTitle className="text-white">تكتيكات متقدمة</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70 text-center">
                  استراتيجيات مبتكرة وتكتيكات متطورة تضمن التفوق
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="gaming-card hover:scale-105 transition-all duration-300">
              <CardHeader className="text-center">
                <Award className="h-12 w-12 text-s3m-red mx-auto mb-4" />
                <CardTitle className="text-white">إنجازات عريقة</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70 text-center">
                  سجل حافل بالانتصارات والبطولات على المستوى الإقليمي
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gaming Section */}
      <section 
        className="py-20 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/20 to-purple-900/20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                مستقبل الألعاب التنافسية
              </h2>
              <p className="text-xl text-white/80 mb-8">
                في S3M، نؤمن بأن الألعاب ليست مجرد تسلية، بل رياضة حقيقية تتطلب 
                المهارة والإستراتيجية والعمل الجماعي. نحن نصنع أبطال المستقبل.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Star className="h-6 w-6 text-s3m-red" />
                  <span className="text-white">تدريب يومي مكثف</span>
                </div>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Star className="h-6 w-6 text-s3m-red" />
                  <span className="text-white">مدربين معتمدين</span>
                </div>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Star className="h-6 w-6 text-s3m-red" />
                  <span className="text-white">بطولات منتظمة</span>
                </div>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Star className="h-6 w-6 text-s3m-red" />
                  <span className="text-white">جوائز قيمة</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-s3m-red/20 to-purple-600/20 rounded-lg p-8 backdrop-blur-sm border border-s3m-red/30">
                <Gamepad2 className="h-20 w-20 text-s3m-red mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white text-center mb-4">
                  انضم للأسطورة
                </h3>
                <p className="text-white/70 text-center mb-6">
                  ابدأ رحلتك نحو القمة اليوم. كن جزءاً من الفريق الأقوى.
                </p>
                <div className="text-center">
                  <Link to="/join-us">
                    <Button className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red text-white px-8 py-3 text-lg font-bold">
                      ابدأ الآن
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section 
        className="py-20 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1920&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-s3m-red/30 to-transparent" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">
            هل أنت مستعد لتصبح أسطورة؟
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            انضم إلى S3M اليوم واكتشف إمكانياتك الحقيقية في عالم Free Fire
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/join-us">
              <Button size="lg" className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red text-white px-8 py-4 text-lg font-bold transform hover:scale-105 transition-all duration-300">
                انضم الآن
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-bold transform hover:scale-105 transition-all duration-300">
                المتصدرين
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
