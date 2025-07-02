
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, DollarSign, Calendar, Edit, Plus } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface GirlsAward {
  id: string;
  user_id: string | null;
  award_type: string;
  award_title: string;
  description: string | null;
  award_date: string;
  prize_amount: number | null;
  is_monetary: boolean | null;
  image_url: string | null;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string | null;
  };
}

const GirlsAwards = () => {
  const { userRole } = useAuth();

  const { data: awards, isLoading } = useQuery({
    queryKey: ['girls-awards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('girls_awards')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name
          )
        `)
        .order('award_date', { ascending: false });

      if (error) throw error;
      return data as GirlsAward[];
    },
  });

  const getAwardIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mvp':
      case 'best_player':
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 'monthly_winner':
        return <Star className="h-6 w-6 text-purple-400" />;
      case 'achievement':
        return <Award className="h-6 w-6 text-blue-400" />;
      default:
        return <Award className="h-6 w-6 text-pink-400" />;
    }
  };

  const getAwardColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mvp':
      case 'best_player':
        return 'from-yellow-400/20 to-amber-500/20 border-yellow-400/30';
      case 'monthly_winner':
        return 'from-purple-400/20 to-pink-500/20 border-purple-400/30';
      case 'achievement':
        return 'from-blue-400/20 to-cyan-500/20 border-blue-400/30';
      default:
        return 'from-pink-400/20 to-purple-500/20 border-pink-400/30';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Award className="h-6 w-6 text-pink-400" />
          الجوائز والتكريمات
        </h2>
        {userRole === 'admin' && (
          <div className="flex gap-2">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              إضافة جائزة
            </Button>
            <Button variant="outline" className="border-pink-400 text-pink-200 hover:bg-pink-500/20">
              <Edit className="h-4 w-4 mr-2" />
              إدارة الجوائز
            </Button>
          </div>
        )}
      </div>

      {awards && awards.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {awards.map((award) => (
            <Card 
              key={award.id} 
              className={`gaming-card bg-gradient-to-br ${getAwardColor(award.award_type)} hover:scale-105 transition-all duration-300`}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  {getAwardIcon(award.award_type)}
                </div>
                <CardTitle className="text-white text-lg">{award.award_title}</CardTitle>
                <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(award.award_date), 'PP', { locale: ar })}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {award.image_url && (
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <img
                      src={award.image_url}
                      alt={award.award_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="font-bold text-white text-lg mb-1">
                    {award.profiles?.full_name || award.profiles?.username || 'فائزة مجهولة'}
                  </h3>
                  <Badge className="bg-white/10 text-white/80 border-white/20">
                    {award.award_type}
                  </Badge>
                </div>
                
                {award.description && (
                  <p className="text-white/80 text-sm text-center leading-relaxed">
                    {award.description}
                  </p>
                )}
                
                {award.is_monetary && award.prize_amount && (
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-3 text-center border border-green-400/30">
                    <div className="flex items-center justify-center gap-2 text-green-200">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-bold">{award.prize_amount} ريال</span>
                    </div>
                    <p className="text-green-300/80 text-xs mt-1">جائزة مالية</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="gaming-card">
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl text-white/60 mb-2">لا توجد جوائز حالياً</h3>
            <p className="text-white/40">سيتم إضافة الجوائز والتكريمات قريباً</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GirlsAwards;
