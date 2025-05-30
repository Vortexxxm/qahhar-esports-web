
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Trophy, Users, Target, Zap } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-s3m-red/20 via-transparent to-red-900/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-s3m-red via-red-500 to-red-600 bg-clip-text text-transparent animate-float">
              S3M E-Sports
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
              فريق الألعاب الإلكترونية المحترف المتخصص في لعبة Free Fire
            </p>
            <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
              انضم إلى نخبة اللاعبين وكن جزءاً من رحلتنا نحو القمة في عالم الألعاب الإلكترونية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/join-us">
                <Button size="lg" className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red text-lg px-8 py-3 animate-glow">
                  انضم إلى الفريق
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white text-lg px-8 py-3">
                  تعرف علينا أكثر
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "أعضاء الفريق", value: "25+" },
              { icon: Trophy, label: "بطولات", value: "12" },
              { icon: Target, label: "معدل الفوز", value: "85%" },
              { icon: Zap, label: "نقاط القوة", value: "9500+" },
            ].map((stat, index) => (
              <Card key={index} className="gaming-card border-s3m-red/20 hover:border-s3m-red/40 transition-colors">
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-4 text-s3m-red" />
                  <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
              لماذا S3M E-Sports؟
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              نحن أكثر من مجرد فريق ألعاب، نحن عائلة من المحترفين المتفانين
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "تدريب احترافي",
                description: "برامج تدريبية متخصصة لتطوير مهاراتك في Free Fire",
                icon: Target,
              },
              {
                title: "فريق متميز",
                description: "انضم إلى نخبة من أفضل اللاعبين في المنطقة",
                icon: Users,
              },
              {
                title: "بطولات مستمرة",
                description: "مشاركة في أقوى البطولات المحلية والدولية",
                icon: Trophy,
              },
            ].map((feature, index) => (
              <Card key={index} className="gaming-card hover:shadow-lg hover:shadow-s3m-red/20 transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-s3m-red to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-s3m-red/10 to-red-900/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            جاهز للانضمام إلى النخبة؟
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            ابدأ رحلتك معنا اليوم وكن جزءاً من قصة نجاح S3M E-Sports
          </p>
          <Link to="/join-us">
            <Button size="lg" className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red text-lg px-12 py-4">
              ابدأ الآن
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
