
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { Database } from "@/integrations/supabase/types";

type LeaderboardEntry = Database['public']['Tables']['leaderboard_scores']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
};

const Leaderboard = () => {
  const [realtimeData, setRealtimeData] = useState<LeaderboardEntry[]>([]);

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_scores')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('rank_position', { ascending: true });

      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });

  useEffect(() => {
    if (leaderboardData) {
      setRealtimeData(leaderboardData);
    }
  }, [leaderboardData]);

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
          // Refetch data when leaderboard changes
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-white/60">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-gradient-to-r from-s3m-red to-red-600";
    if (rank <= 5) return "bg-s3m-red";
    return "bg-white/20";
  };

  const getKDRatio = (kills: number, deaths: number) => {
    if (deaths === 0) return kills > 0 ? kills.toFixed(1) : "0.0";
    return (kills / deaths).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-white text-xl">جاري تحميل المتصدرين...</div>
      </div>
    );
  }

  const topThree = realtimeData?.slice(0, 3) || [];
  const allPlayers = realtimeData || [];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
            متصدرو الفريق
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            ترتيب أعضاء فريق S3M E-Sports حسب النقاط والإنجازات - يتم التحديث فورياً
          </p>
        </div>

        {topThree.length > 0 && (
          <section className="mb-16">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {topThree.map((player, index) => (
                <Card key={player.id} className={`gaming-card hover:shadow-lg hover:shadow-s3m-red/20 transition-all duration-300 ${
                  player.rank_position === 1 ? 'md:order-2 transform md:scale-110' : 
                  player.rank_position === 2 ? 'md:order-1' : 'md:order-3'
                }`}>
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      {getRankIcon(player.rank_position || index + 1)}
                    </div>
                    <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-s3m-red">
                      <AvatarImage src={player.profiles?.avatar_url || ""} />
                      <AvatarFallback className="bg-s3m-red text-white text-lg">
                        {(player.profiles?.username || 'U').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {player.profiles?.username || 'مجهول'}
                    </h3>
                    <div className="text-3xl font-bold text-s3m-red mb-2">
                      {player.points.toLocaleString()}
                    </div>
                    <p className="text-white/60 text-sm mb-4">نقطة</p>
                    <div className="flex justify-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="text-white font-semibold">{player.wins}</div>
                        <div className="text-white/60">انتصار</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">
                          {getKDRatio(player.kills, player.deaths)}
                        </div>
                        <div className="text-white/60">K/D</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-s3m-red">
                <TrendingUp className="h-6 w-6" />
                <span>الترتيب العام</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20 border-b border-s3m-red/20">
                    <tr>
                      <th className="text-right py-4 px-6 text-white/80 font-semibold">الترتيب</th>
                      <th className="text-right py-4 px-6 text-white/80 font-semibold">اللاعب</th>
                      <th className="text-right py-4 px-6 text-white/80 font-semibold">النقاط</th>
                      <th className="text-right py-4 px-6 text-white/80 font-semibold">الانتصارات</th>
                      <th className="text-right py-4 px-6 text-white/80 font-semibold">K/D</th>
                      <th className="text-right py-4 px-6 text-white/80 font-semibold">الألعاب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPlayers.map((player) => (
                      <tr key={player.id} className="border-b border-white/10 hover:bg-black/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            {(player.rank_position || 0) <= 3 ? (
                              <div className="flex items-center space-x-2">
                                {getRankIcon(player.rank_position || 0)}
                                <Badge className={getRankBadgeColor(player.rank_position || 0)}>
                                  {player.rank_position}
                                </Badge>
                              </div>
                            ) : (
                              <Badge className={getRankBadgeColor(player.rank_position || 0)}>
                                {player.rank_position}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10 border border-s3m-red/30">
                              <AvatarImage src={player.profiles?.avatar_url || ""} />
                              <AvatarFallback className="bg-s3m-red/20 text-white text-sm">
                                {(player.profiles?.username || 'U').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-white">
                                {player.profiles?.username || 'مجهول'}
                              </div>
                              {(player.rank_position || 0) <= 5 && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-s3m-red" />
                                  <span className="text-xs text-s3m-red">نجم الفريق</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-s3m-red font-bold text-lg">
                            {player.points.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white font-semibold">{player.wins}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white font-semibold">
                            {getKDRatio(player.kills, player.deaths)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white font-semibold">{player.games_played}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {allPlayers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-white/60">لا توجد بيانات متاحة حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-16">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "إجمالي اللاعبين", value: allPlayers.length.toString(), icon: Trophy },
              { 
                label: "متوسط النقاط", 
                value: allPlayers.length > 0 
                  ? Math.round(allPlayers.reduce((sum, p) => sum + p.points, 0) / allPlayers.length).toLocaleString()
                  : "0", 
                icon: TrendingUp 
              },
              { 
                label: "إجمالي الانتصارات", 
                value: allPlayers.reduce((sum, p) => sum + p.wins, 0).toString(), 
                icon: Award 
              },
              { 
                label: "إجمالي الألعاب", 
                value: allPlayers.reduce((sum, p) => sum + p.games_played, 0).toString(), 
                icon: Star 
              },
            ].map((stat, index) => (
              <Card key={index} className="gaming-card">
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-4 text-s3m-red" />
                  <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Leaderboard;
