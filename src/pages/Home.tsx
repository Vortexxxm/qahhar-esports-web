
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Target, Calendar, Zap, GamepadIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SmartGreeting from "@/components/SmartGreeting";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        
        <div className="container mx-auto px-4 relative z-10">
          {user && <SmartGreeting />}
          
          <div className="text-center max-w-4xl mx-auto">
            <img
              src="/lovable-uploads/876694d5-ec41-469d-9b93-b1c067364893.png"
              alt="S3M E-Sports"
              className="h-24 w-auto mx-auto mb-8 drop-shadow-2xl"
            />
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-s3m-red via-red-500 to-orange-500 bg-clip-text text-transparent">
              S3M E-Sports
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              انضم إلى أقوى فريق للألعاب الإلكترونية في المنطقة
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/join-us">
                <Button size="lg" className="gaming-button text-lg px-8 py-4">
                  <Users className="ml-2 h-6 w-6" />
                  انضم إلى الفريق
                </Button>
              </Link>
              
              <Link to="/tournaments">
                <Button variant="outline" size="lg" className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white text-lg px-8 py-4">
                  <Trophy className="ml-2 h-6 w-6" />
                  البطولات
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-s3m-red">50+</div>
                <div className="text-sm text-white/70">لاعب محترف</div>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-500">25+</div>
                <div className="text-sm text-white/70">بطولة</div>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-green-500">15+</div>
                <div className="text-sm text-white/70">كأس</div>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-500">5+</div>
                <div className="text-sm text-white/70">سنوات خبرة</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
              لماذا S3M؟
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              نحن لسنا مجرد فريق، نحن عائلة من المحترفين المتحدين بشغف واحد
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="gaming-card group hover:scale-105 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-s3m-red to-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">تدريب احترافي</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  برامج تدريبية متقدمة مع مدربين محترفين لتطوير مهاراتك
                </p>
              </CardContent>
            </Card>

            <Card className="gaming-card group hover:scale-105 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">مجتمع قوي</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  انضم إلى مجتمع من اللاعبين المتحمسين والمحترفين
                </p>
              </CardContent>
            </Card>

            <Card className="gaming-card group hover:scale-105 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">أهداف واضحة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  خطط واضحة للوصول إلى المستوى العالمي في الألعاب
                </p>
              </CardContent>
            </Card>

            <Card className="gaming-card group hover:scale-105 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <GamepadIcon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">ألعاب متنوعة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  نشارك في مختلف الألعاب الشعبية والبطولات الكبرى
                </p>
              </CardContent>
            </Card>

            <Card className="gaming-card group hover:scale-105 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">فعاليات منتظمة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  بطولات وفعاليات داخلية لتحسين الأداء والمنافسة
                </p>
              </CardContent>
            </Card>

            <Card className="gaming-card group hover:scale-105 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">تطوير مستمر</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  نحن في تطوير مستمر لمواكبة أحدث استراتيجيات اللعب
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-s3m-red/10 to-red-600/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            هل أنت مستعد للانضمام؟
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            ابدأ رحلتك مع S3M E-Sports اليوم وكن جزءاً من الأسطورة
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/join-us">
              <Button size="lg" className="gaming-button text-lg px-8 py-4">
                <Users className="ml-2 h-6 w-6" />
                ابدأ الآن
              </Button>
            </Link>
            
            <Link to="/about">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-4">
                تعرف علينا أكثر
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
