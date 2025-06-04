
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Github, Twitter, Linkedin, Instagram, Globe, Crown, Star } from "lucide-react";

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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'developer':
        return 'مطور';
      case 'clan_leader':
        return 'قائد الكلان';
      case 'clan_member':
        return 'عضو الكلان';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'developer':
        return 'bg-blue-500';
      case 'clan_leader':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'clan_member':
        return 'bg-s3m-red';
      default:
        return 'bg-gray-500';
    }
  };

  const developers = teamMembers?.filter(member => member.role === 'developer') || [];
  const clanLeaders = teamMembers?.filter(member => member.role === 'clan_leader') || [];
  const clanMembers = teamMembers?.filter(member => member.role === 'clan_member') || [];

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
            فريق S3M E-Sports
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            تعرف على فريق المطورين المبدعين وقادة الكلان المحترفين الذين يقودون مجتمع S3M للرياضات الإلكترونية
          </p>
        </div>

        {/* Developers Section */}
        {developers.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">فريق التطوير</h2>
              <p className="text-white/60">المبدعون وراء هذه المنصة الرائعة</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {developers.map((member) => (
                <Card key={member.id} className="gaming-card group hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto border-4 border-blue-500/50 group-hover:border-blue-400 transition-colors"
                      />
                      {member.is_featured && (
                        <div className="absolute -top-2 -right-2">
                          <Star className="h-6 w-6 text-yellow-400 fill-current" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <Badge className={`${getRoleColor(member.role)} text-white mb-2`}>
                      {member.title}
                    </Badge>
                    
                    <p className="text-white/70 text-sm mb-4 leading-relaxed">
                      {member.description}
                    </p>
                    
                    {Object.keys(member.social_links).length > 0 && (
                      <div className="flex justify-center gap-2">
                        {Object.entries(member.social_links).map(([platform, url]) => (
                          <Button
                            key={platform}
                            variant="ghost"
                            size="sm"
                            className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/10"
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

        {/* Clan Leaders Section */}
        {clanLeaders.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Crown className="h-8 w-8 text-yellow-400" />
                قادة الكلان
                <Crown className="h-8 w-8 text-yellow-400" />
              </h2>
              <p className="text-white/60">القادة الأسطوريون للكلان</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {clanLeaders.map((member) => (
                <Card key={member.id} className="gaming-card group hover:scale-105 transition-all duration-300 border-2 border-yellow-500/50">
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className="w-32 h-32 mx-auto relative">
                        <img
                          src={member.image_url}
                          alt={member.name}
                          className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-2xl shadow-yellow-400/50"
                        />
                        <div className="absolute -top-3 -right-3">
                          <Crown className="h-10 w-10 text-yellow-400 fill-current drop-shadow-lg" />
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black mb-4 text-sm px-4 py-1">
                      {member.title}
                    </Badge>
                    
                    <p className="text-white/80 leading-relaxed mb-6">
                      {member.description}
                    </p>
                    
                    {Object.keys(member.social_links).length > 0 && (
                      <div className="flex justify-center gap-3">
                        {Object.entries(member.social_links).map(([platform, url]) => (
                          <Button
                            key={platform}
                            variant="ghost"
                            size="sm"
                            className="p-3 text-white/60 hover:text-yellow-400 hover:bg-yellow-500/10 border border-yellow-500/30"
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
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">أعضاء الكلان</h2>
              <p className="text-white/60">النخبة المختارة من محاربي S3M</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clanMembers.map((member) => (
                <Card key={member.id} className="gaming-card group hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-20 h-20 rounded-full mx-auto border-4 border-s3m-red/50 group-hover:border-s3m-red transition-colors"
                      />
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                    <Badge className={`${getRoleColor(member.role)} text-white mb-2`}>
                      {member.title}
                    </Badge>
                    
                    <p className="text-white/70 text-sm mb-4 leading-relaxed">
                      {member.description}
                    </p>
                    
                    {Object.keys(member.social_links).length > 0 && (
                      <div className="flex justify-center gap-2">
                        {Object.entries(member.social_links).map(([platform, url]) => (
                          <Button
                            key={platform}
                            variant="ghost"
                            size="sm"
                            className="p-2 text-white/60 hover:text-s3m-red hover:bg-s3m-red/10"
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
        <div className="text-center mt-16">
          <Card className="gaming-card max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">انضم إلى فريقنا</h3>
              <p className="text-white/70 mb-6">
                هل تريد أن تكون جزءاً من هذا الفريق المتميز؟ انضم إلينا وكن جزءاً من مستقبل الرياضات الإلكترونية
              </p>
              <Button className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red">
                انضم إلينا الآن
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Team;
