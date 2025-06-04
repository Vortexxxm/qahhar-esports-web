
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Github, Twitter, Linkedin, Instagram, Globe, Crown, Star, Code, Shield } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  role: 'developer' | 'clan_leader' | 'clan_member';
  title: string;
  description: string;
  image_url: string;
  social_links: Record<string, string>;
  order_position: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

const Team = () => {
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return <Github className="h-5 w-5" />;
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5" />;
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'developer':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'clan_leader':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'clan_member':
        return 'bg-gradient-to-r from-s3m-red to-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  const clanLeaders = teamMembers?.filter(member => member.role === 'clan_leader') || [];
  const clanMembers = teamMembers?.filter(member => member.role === 'clan_member') || [];
  const developers = teamMembers?.filter(member => member.role === 'developer') || [];

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-s3m-red via-red-500 to-orange-500 bg-clip-text text-transparent animate-fade-in">
              فريق S3M E-Sports
            </h1>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-6xl opacity-10">
              ⚔️
            </div>
          </div>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            تعرف على القادة الأسطوريين والمطورين المبدعين الذين يقودون مجتمع S3M للرياضات الإلكترونية نحو المجد
          </p>
        </div>

        {/* Clan Leader Section - Main Focus */}
        {clanLeaders.length > 0 && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="relative inline-block">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 relative z-10">
                  <Crown className="h-12 w-12 text-yellow-400 inline-block mr-4 animate-pulse" />
                  قائد الكلان الأعظم
                  <Crown className="h-12 w-12 text-yellow-400 inline-block ml-4 animate-pulse" />
                </h2>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 blur-xl"></div>
              </div>
              <p className="text-white/70 text-lg">الأسطورة التي تقود المحاربين نحو النصر</p>
            </div>
            
            <div className="flex justify-center">
              {clanLeaders.map((leader) => (
                <Card key={leader.id} className="relative max-w-md mx-auto gaming-card border-4 border-yellow-400/50 shadow-2xl shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all duration-500 hover:scale-105 bg-gradient-to-br from-gray-900/90 to-black/90">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 shadow-lg">
                      <Crown className="h-8 w-8 text-black" />
                    </div>
                  </div>
                  <CardContent className="p-8 pt-12 text-center">
                    <div className="relative mb-8">
                      <div className="w-40 h-40 mx-auto relative">
                        <img
                          src={leader.image_url}
                          alt={leader.name}
                          className="w-40 h-40 rounded-full border-6 border-gradient-to-r from-yellow-400 to-orange-500 shadow-2xl object-cover"
                          style={{
                            borderImage: 'linear-gradient(45deg, #fbbf24, #f97316) 1'
                          }}
                        />
                        <div className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-2">
                          <Star className="h-6 w-6 text-black fill-current" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-yellow-400/20 to-transparent"></div>
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      {leader.name}
                    </h3>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black mb-6 text-lg px-6 py-2 font-bold">
                      {leader.title}
                    </Badge>
                    
                    <p className="text-white/90 text-lg leading-relaxed mb-8 font-medium">
                      {leader.description}
                    </p>
                    
                    {Object.keys(leader.social_links).length > 0 && (
                      <div className="flex justify-center gap-4">
                        {Object.entries(leader.social_links).map(([platform, url]) => (
                          <Button
                            key={platform}
                            variant="ghost"
                            size="lg"
                            className="p-4 text-white/70 hover:text-yellow-400 hover:bg-yellow-500/20 border-2 border-yellow-500/30 hover:border-yellow-400 transition-all duration-300"
                            onClick={() => window.open(url, '_blank')}
                          >
                            {getSocialIcon(platform)}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Clan Members Section */}
        {clanMembers.length > 0 && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
                <Shield className="h-10 w-10 text-s3m-red" />
                زعماء ومحاربو الكلان
                <Shield className="h-10 w-10 text-s3m-red" />
              </h2>
              <p className="text-white/70 text-lg">النخبة المختارة من محاربي S3M الأشداء</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clanMembers.map((member) => (
                <Card key={member.id} className="gaming-card group hover:scale-105 transition-all duration-300 border-2 border-s3m-red/30 hover:border-s3m-red shadow-xl hover:shadow-s3m-red/30">
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-6">
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto border-4 border-s3m-red/60 group-hover:border-s3m-red transition-colors object-cover shadow-lg"
                      />
                      <div className="absolute -top-2 -right-2">
                        <Shield className="h-6 w-6 text-s3m-red" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                    <Badge className={`${getRoleColor(member.role)} text-white mb-4 font-semibold`}>
                      {member.title}
                    </Badge>
                    
                    <p className="text-white/80 text-sm mb-6 leading-relaxed">
                      {member.description}
                    </p>
                    
                    {Object.keys(member.social_links).length > 0 && (
                      <div className="flex justify-center gap-2">
                        {Object.entries(member.social_links).map(([platform, url]) => (
                          <Button
                            key={platform}
                            variant="ghost"
                            size="sm"
                            className="p-2 text-white/60 hover:text-s3m-red hover:bg-s3m-red/10 transition-all duration-200"
                            onClick={() => window.open(url, '_blank')}
                          >
                            {getSocialIcon(platform)}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Developers Section */}
        {developers.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
                <Code className="h-10 w-10 text-blue-400" />
                فريق التطوير والإبداع
                <Code className="h-10 w-10 text-blue-400" />
              </h2>
              <p className="text-white/70 text-lg">العقول المبدعة وراء هذه المنصة الرائعة</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {developers.map((member) => (
                <Card key={member.id} className="gaming-card group hover:scale-105 transition-all duration-300 border-2 border-blue-500/30 hover:border-blue-400 shadow-xl hover:shadow-blue-400/30">
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-6">
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto border-4 border-blue-500/60 group-hover:border-blue-400 transition-colors object-cover shadow-lg"
                      />
                      {member.is_featured && (
                        <div className="absolute -top-2 -right-2">
                          <Star className="h-6 w-6 text-yellow-400 fill-current" />
                        </div>
                      )}
                      <div className="absolute -bottom-2 -left-2">
                        <Code className="h-6 w-6 text-blue-400" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                    <Badge className={`${getRoleColor(member.role)} text-white mb-4 font-semibold`}>
                      {member.title}
                    </Badge>
                    
                    <p className="text-white/80 text-sm mb-6 leading-relaxed">
                      {member.description}
                    </p>
                    
                    {Object.keys(member.social_links).length > 0 && (
                      <div className="flex justify-center gap-2">
                        {Object.entries(member.social_links).map(([platform, url]) => (
                          <Button
                            key={platform}
                            variant="ghost"
                            size="sm"
                            className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200"
                            onClick={() => window.open(url, '_blank')}
                          >
                            {getSocialIcon(platform)}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <Card className="gaming-card max-w-4xl mx-auto border-2 border-s3m-red/30 shadow-2xl shadow-s3m-red/20">
            <CardContent className="p-10">
              <div className="relative">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 bg-gradient-to-r from-s3m-red to-red-500 bg-clip-text text-transparent">
                  انضم إلى فريقنا الأسطوري
                </h3>
                <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
                  هل تريد أن تكون جزءاً من هذا الفريق المتميز؟ انضم إلينا وكن جزءاً من مستقبل الرياضات الإلكترونية في المملكة العربية السعودية
                </p>
                <Button className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red text-lg px-8 py-4 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Crown className="mr-2 h-6 w-6" />
                  انضم إلينا الآن
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Team;
