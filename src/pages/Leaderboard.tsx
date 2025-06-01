
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Target, Gamepad2, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

type LeaderboardEntry = {
  user_id: string;
  points: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  games_played: number;
  rank_position: number;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
};

const Leaderboard = () => {
  const { data: leaderboard, isLoading, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      // Get leaderboard scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('leaderboard_scores')
        .select('*')
        .order('rank_position', { ascending: true });

      if (scoresError) throw scoresError;

      // Get profiles for each score
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url');

      if (profilesError) throw profilesError;

      // Combine the data
      const combinedData: LeaderboardEntry[] = scoresData.map(score => ({
        ...score,
        profiles: profilesData.find(profile => profile.id === score.user_id) || null,
      }));

      return combinedData;
    },
  });

  // Real-time subscription for leaderboard updates
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_scores'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const getKDRatio = (kills: number, deaths: number) => {
    if (deaths === 0) return kills > 0 ? kills.toFixed(1) : "0.0";
    return (kills / deaths).toFixed(1);
  };

  const getWinRate = (wins: number, gamesPlayed: number) => {
    if (gamesPlayed === 0) return "0%";
    return `${((wins / gamesPlayed) * 100).toFixed(1)}%`;
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Trophy className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-white/60 font-bold">#{position}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-white text-xl">جاري تحميل قائمة المتصدرين...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
            قائمة المتصدرين
          </h1>
          <p className="text-xl text-white/70">أفضل اللاعبين في الفريق</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6">
            {leaderboard?.map((player, index) => (
              <Card 
                key={player.user_id} 
                className={`gaming-card transition-all duration-300 hover:scale-[1.02] ${
                  index < 3 ? 'border-s3m-red/50 shadow-lg shadow-s3m-red/20' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(player.rank_position || index + 1)}
                      </div>
                      
                      <Avatar className="w-16 h-16 border-2 border-s3m-red">
                        <AvatarImage src={player.profiles?.avatar_url || ""} />
                        <AvatarFallback className="bg-s3m-red text-white text-lg">
                          {(player.profiles?.username || 'U').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {player.profiles?.username || 'مجهول'}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-gradient-to-r from-s3m-red to-red-600">
                            {player.points.toLocaleString()} نقطة
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm text-white/60">الانتصارات</span>
                        <span className="text-lg font-bold text-white">{player.wins}</span>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-1">
                        <Target className="h-5 w-5 text-red-500" />
                        <span className="text-sm text-white/60">K/D</span>
                        <span className="text-lg font-bold text-white">
                          {getKDRatio(player.kills, player.deaths)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-1">
                        <Gamepad2 className="h-5 w-5 text-blue-500" />
                        <span className="text-sm text-white/60">الألعاب</span>
                        <span className="text-lg font-bold text-white">{player.games_played}</span>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-1">
                        <Zap className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-white/60">معدل الفوز</span>
                        <span className="text-lg font-bold text-white">
                          {getWinRate(player.wins, player.games_played)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!leaderboard || leaderboard.length === 0) && (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">
                لا توجد نتائج حتى الآن
              </h3>
              <p className="text-white/50">
                سيتم عرض أفضل اللاعبين هنا عند بدء المنافسات
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
