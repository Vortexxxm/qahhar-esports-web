import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Target, Gamepad2, Zap, Crown, Medal, Award } from "lucide-react";
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
  visible_in_leaderboard: boolean;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
};

const Leaderboard = () => {
  const { data: leaderboard, isLoading, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      // Get only visible leaderboard scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('leaderboard_scores')
        .select('*')
        .eq('visible_in_leaderboard', true)
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

  const getTopPlayerCard = (player: LeaderboardEntry, position: number) => {
    const getRankConfig = (pos: number) => {
      switch (pos) {
        case 1:
          return {
            icon: <Crown className="h-8 w-8 text-yellow-500" />,
            bgGradient: "bg-gradient-to-br from-yellow-500/20 to-amber-600/20",
            borderColor: "border-yellow-500/50",
            textColor: "text-yellow-500",
            shadowColor: "shadow-yellow-500/25"
          };
        case 2:
          return {
            icon: <Medal className="h-8 w-8 text-gray-400" />,
            bgGradient: "bg-gradient-to-br from-gray-400/20 to-gray-600/20",
            borderColor: "border-gray-400/50",
            textColor: "text-gray-400",
            shadowColor: "shadow-gray-400/25"
          };
        case 3:
          return {
            icon: <Award className="h-8 w-8 text-amber-600" />,
            bgGradient: "bg-gradient-to-br from-amber-600/20 to-orange-600/20",
            borderColor: "border-amber-600/50",
            textColor: "text-amber-600",
            shadowColor: "shadow-amber-600/25"
          };
        default:
          return {
            icon: <span className="text-2xl font-bold text-white/60">#{position}</span>,
            bgGradient: "bg-gradient-to-br from-s3m-red/10 to-red-600/10",
            borderColor: "border-s3m-red/30",
            textColor: "text-s3m-red",
            shadowColor: "shadow-s3m-red/20"
          };
      }
    };

    const config = getRankConfig(position);

    return (
      <Card 
        key={player.user_id} 
        className={`gaming-card transition-all duration-300 hover:scale-[1.02] ${config.bgGradient} ${config.borderColor} border-2 shadow-2xl ${config.shadowColor} relative overflow-hidden`}
      >
        {position <= 3 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-60" />
        )}
        
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
              <div className="flex items-center justify-center w-16 h-16 relative">
                {config.icon}
                {position <= 3 && (
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-current/20 to-transparent animate-pulse" />
                )}
              </div>
              
              <Avatar className={`w-16 h-16 md:w-20 md:h-20 border-4 ${config.borderColor} ${config.shadowColor} shadow-lg`}>
                <AvatarImage src={player.profiles?.avatar_url || ""} />
                <AvatarFallback className={`${config.bgGradient} text-white text-lg md:text-xl font-bold`}>
                  {(player.profiles?.username || 'U').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className={`text-xl md:text-2xl font-bold text-white mb-2 ${position <= 3 ? 'drop-shadow-lg' : ''}`}>
                  {player.profiles?.username || 'مجهول'}
                </h3>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <Badge className={`${config.textColor === 'text-yellow-500' ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : 
                                    config.textColor === 'text-gray-400' ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                                    config.textColor === 'text-amber-600' ? 'bg-gradient-to-r from-amber-600 to-orange-600' :
                                    'bg-gradient-to-r from-s3m-red to-red-600'} text-white text-sm md:text-base px-3 py-1`}>
                    {player.points.toLocaleString()} نقطة
                  </Badge>
                  {position <= 3 && (
                    <Badge variant="outline" className={`${config.borderColor} ${config.textColor} animate-pulse`}>
                      أسطورة
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center w-full md:w-auto">
              <div className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-black/20">
                <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                <span className="text-xs text-white/60">الانتصارات</span>
                <span className="text-sm md:text-lg font-bold text-white">{player.wins}</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-black/20">
                <Target className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                <span className="text-xs text-white/60">K/D</span>
                <span className="text-sm md:text-lg font-bold text-white">
                  {getKDRatio(player.kills, player.deaths)}
                </span>
              </div>
              
              <div className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-black/20">
                <Gamepad2 className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                <span className="text-xs text-white/60">الألعاب</span>
                <span className="text-sm md:text-lg font-bold text-white">{player.games_played}</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-black/20">
                <Zap className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                <span className="text-xs text-white/60">معدل الفوز</span>
                <span className="text-sm md:text-lg font-bold text-white">
                  {getWinRate(player.wins, player.games_played)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-white text-xl">جاري تحميل قائمة المتصدرين...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header with Background */}
        <div 
          className="text-center mb-8 md:mb-12 rounded-lg bg-cover bg-center relative overflow-hidden p-8 md:p-16"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/20 to-red-600/20" />
          <div className="relative z-10">
            <Trophy className="h-12 w-12 md:h-16 md:w-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
              قائمة المتصدرين
            </h1>
            <p className="text-lg md:text-xl text-white/90">أساطير فريق S3M</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-4 md:gap-6">
            {leaderboard?.map((player, index) => 
              getTopPlayerCard(player, player.rank_position || index + 1)
            )}
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
