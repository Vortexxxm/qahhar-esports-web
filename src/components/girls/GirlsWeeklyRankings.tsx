
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Calendar, Edit } from "lucide-react";
import { format, startOfWeek } from "date-fns";
import { ar } from "date-fns/locale";

interface WeeklyRating {
  id: string;
  user_id: string | null;
  week_start: string;
  activity_score: number | null;
  performance_score: number | null;
  commitment_score: number | null;
  total_score: number | null;
  notes: string | null;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const GirlsWeeklyRankings = () => {
  const { userRole } = useAuth();
  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 6 }), 'yyyy-MM-dd');

  const { data: ratings, isLoading } = useQuery({
    queryKey: ['girls-weekly-ratings', currentWeekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('girls_weekly_ratings')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('week_start', currentWeekStart)
        .order('total_score', { ascending: false });

      if (error) throw error;
      return data as WeeklyRating[];
    },
  });

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-2xl font-bold text-white/60">#{position}</span>;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return "from-yellow-400/20 to-amber-500/20 border-yellow-400/30";
      case 2:
        return "from-gray-300/20 to-slate-400/20 border-gray-300/30";
      case 3:
        return "from-amber-600/20 to-orange-500/20 border-amber-600/30";
      default:
        return "from-purple-500/20 to-pink-500/20 border-purple-400/30";
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
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-pink-400" />
            التقييم الأسبوعي
          </h2>
          <p className="text-white/60 mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            الأسبوع الحالي: {format(new Date(currentWeekStart), 'PP', { locale: ar })}
          </p>
        </div>
        {userRole === 'admin' && (
          <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            <Edit className="h-4 w-4 mr-2" />
            إدارة التقييمات
          </Button>
        )}
      </div>

      {ratings && ratings.length > 0 ? (
        <div className="space-y-4">
          {ratings.map((rating, index) => (
            <Card 
              key={rating.id} 
              className={`gaming-card bg-gradient-to-r ${getRankColor(index + 1)} hover:scale-102 transition-all duration-300`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-black/20">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {rating.profiles?.full_name || rating.profiles?.username || 'مجهول'}
                        </h3>
                        <p className="text-white/60">المركز #{index + 1}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white mb-1">
                          {rating.total_score || 0}
                        </div>
                        <p className="text-white/60 text-sm">النقاط الإجمالية</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-400">
                          {rating.activity_score || 0}
                        </div>
                        <p className="text-white/60 text-sm">النشاط</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-400">
                          {rating.performance_score || 0}
                        </div>
                        <p className="text-white/60 text-sm">الأداء</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-400">
                          {rating.commitment_score || 0}
                        </div>
                        <p className="text-white/60 text-sm">الالتزام</p>
                      </div>
                    </div>
                    
                    {rating.notes && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-white/80 text-sm">{rating.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="gaming-card">
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl text-white/60 mb-2">لا توجد تقييمات لهذا الأسبوع</h3>
            <p className="text-white/40">سيتم إضافة التقييمات قريباً</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GirlsWeeklyRankings;
