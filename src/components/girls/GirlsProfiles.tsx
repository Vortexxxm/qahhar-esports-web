
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Crown, Star, Instagram, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GirlsProfile {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  achievements: string[] | null;
  social_links: any;
  squad_name: string | null;
  is_featured: boolean | null;
}

const GirlsProfiles = () => {
  const { userRole } = useAuth();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['girls-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('girls_profiles')
        .select('*')
        .order('role', { ascending: true })
        .order('is_featured', { ascending: false });

      if (error) throw error;
      return data as GirlsProfile[];
    },
  });

  const leader = profiles?.find(p => p.role === 'leader');
  const members = profiles?.filter(p => p.role === 'member') || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Crown className="h-6 w-6 text-pink-400" />
          القائدة والسكواد
        </h2>
        {userRole === 'admin' && (
          <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            <Edit className="h-4 w-4 mr-2" />
            إدارة البروفايلات
          </Button>
        )}
      </div>

      {/* Leader Section */}
      {leader && (
        <Card className="gaming-card border-pink-500/30 bg-gradient-to-r from-pink-900/20 to-purple-900/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              قائدة الفريق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 border-4 border-pink-400">
                  <AvatarImage src={leader.image_url || ''} alt={leader.name} />
                  <AvatarFallback className="bg-pink-500 text-white text-2xl">
                    {leader.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{leader.name}</h3>
                  {leader.squad_name && (
                    <Badge className="bg-pink-500/20 text-pink-200 border-pink-400">
                      {leader.squad_name}
                    </Badge>
                  )}
                </div>
                
                {leader.bio && (
                  <p className="text-white/80 leading-relaxed">{leader.bio}</p>
                )}

                {leader.achievements && leader.achievements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      الإنجازات
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {leader.achievements.map((achievement, index) => (
                        <Badge key={index} variant="outline" className="border-yellow-400 text-yellow-200">
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {leader.social_links && (
                  <div className="flex gap-4">
                    {leader.social_links.instagram && (
                      <a
                        href={leader.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:from-pink-600 hover:to-red-600 transition-all"
                      >
                        <Instagram className="h-4 w-4" />
                        إنستغرام
                      </a>
                    )}
                    {leader.social_links.tiktok && (
                      <a
                        href={leader.social_links.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-black to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-black transition-all"
                      >
                        <MessageCircle className="h-4 w-4" />
                        تيك توك
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members Section */}
      {members.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-400" />
            أعضاء الفريق
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.id} className="gaming-card hover:scale-105 transition-transform">
                <CardContent className="p-6 text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4 border-2 border-purple-400">
                    <AvatarImage src={member.image_url || ''} alt={member.name} />
                    <AvatarFallback className="bg-purple-500 text-white">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h4 className="font-bold text-white mb-2">{member.name}</h4>
                  
                  {member.squad_name && (
                    <Badge className="bg-purple-500/20 text-purple-200 border-purple-400 mb-3">
                      {member.squad_name}
                    </Badge>
                  )}
                  
                  {member.bio && (
                    <p className="text-white/70 text-sm leading-relaxed">{member.bio}</p>
                  )}

                  {member.achievements && member.achievements.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {member.achievements.slice(0, 3).map((achievement, index) => (
                          <Badge key={index} variant="outline" className="border-yellow-400 text-yellow-200 text-xs">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(!profiles || profiles.length === 0) && (
        <div className="text-center py-12">
          <h3 className="text-xl text-white/60 mb-4">لا توجد بروفايلات حالياً</h3>
          <p className="text-white/40">سيتم إضافة بروفايلات الفريق قريباً</p>
        </div>
      )}
    </div>
  );
};

export default GirlsProfiles;
