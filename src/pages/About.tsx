
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Users, Zap, Award, Star } from "lucide-react";

const About = () => {
  const achievements = [
    { title: "بطل الدوري المحلي 2023", date: "ديسمبر 2023" },
    { title: "المركز الثاني في البطولة الآسيوية", date: "نوفمبر 2023" },
    { title: "أفضل فريق في المنطقة", date: "أكتوبر 2023" },
    { title: "بطولة الخليج للألعاب الإلكترونية", date: "سبتمبر 2023" },
  ];

  const teamValues = [
    {
      icon: Trophy,
      title: "التميز",
      description: "نسعى دائماً لتحقيق أعلى المستويات في كل ما نقوم به"
    },
    {
      icon: Users,
      title: "روح الفريق",
      description: "نؤمن بقوة العمل الجماعي والتعاون لتحقيق النجاح"
    },
    {
      icon: Target,
      title: "الاحترافية",
      description: "نتعامل مع الألعاب الإلكترونية كرياضة حقيقية تتطلب التفاني"
    },
    {
      icon: Zap,
      title: "الابتكار",
      description: "نطور استراتيجيات جديدة ونتبنى أحدث التقنيات"
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent">
            عن فريق S3M E-Sports
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            فريق احترافي متخصص في ألعاب Free Fire، تأسس بهدف الوصول لقمة الألعاب الإلكترونية في المنطقة العربية
          </p>
        </div>

        {/* Story Section */}
        <section className="mb-20">
          <Card className="gaming-card">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6 text-gaming-primary">قصتنا</h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-white/80 leading-relaxed mb-6">
                    بدأت رحلة S3M E-Sports في عام 2021 كمجموعة من الأصدقاء المتحمسين للألعاب الإلكترونية. 
                    ما بدأ كهواية تحول إلى شغف حقيقي، ومن ثم إلى فريق احترافي يضم نخبة من أفضل اللاعبين.
                  </p>
                  <p className="text-white/80 leading-relaxed mb-6">
                    اليوم، نحن فخورون بكوننا واحداً من أقوى الفرق في المنطقة، مع سجل حافل بالإنجازات 
                    والبطولات التي حققناها على المستويين المحلي والإقليمي.
                  </p>
                  <p className="text-white/80 leading-relaxed">
                    رؤيتنا هي أن نصبح الفريق الأول في العالم العربي، وأن نلهم جيلاً جديداً من اللاعبين 
                    للوصول إلى أحلامهم في عالم الألعاب الإلكترونية.
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    { year: "2021", event: "تأسيس الفريق" },
                    { year: "2022", event: "أول بطولة محلية" },
                    { year: "2023", event: "وصول للبطولات الدولية" },
                    { year: "2024", event: "توسع الفريق" },
                  ].map((milestone, index) => (
                    <div key={index} className="flex items-center space-x-4 bg-black/20 p-4 rounded-lg">
                      <Badge className="gaming-gradient text-white px-3 py-1">
                        {milestone.year}
                      </Badge>
                      <span className="text-white/80">{milestone.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">قيمنا ومبادئنا</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              القيم التي تحركنا وتوجه كل قراراتنا وأفعالنا كفريق واحد
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamValues.map((value, index) => (
              <Card key={index} className="gaming-card hover:gaming-glow transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">إنجازاتنا</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              سجل حافل بالنجاحات والبطولات التي تعكس مستوى الفريق العالي
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className="gaming-card hover:border-gaming-primary/40 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{achievement.title}</h3>
                      <p className="text-gaming-primary text-sm">{achievement.date}</p>
                    </div>
                    <Star className="h-5 w-5 text-gaming-accent" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mission Section */}
        <section>
          <Card className="gaming-card border-gaming-primary/30">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-6 text-gaming-primary">مهمتنا</h2>
              <p className="text-xl text-white/80 leading-relaxed max-w-4xl mx-auto">
                نهدف إلى إعادة تعريف مفهوم الألعاب الإلكترونية في العالم العربي، من خلال الاحترافية العالية، 
                والتدريب المستمر، وبناء مجتمع قوي من اللاعبين المتفانين. نسعى لأن نكون مصدر إلهام للشباب العربي 
                لتحقيق أحلامهم في عالم الرياضة الإلكترونية.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;
