
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PlayerCard from '@/components/PlayerCard';
import WeeklyPlayerCard from '@/components/WeeklyPlayerCard';
import MonthlyPlayerCard from '@/components/MonthlyPlayerCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Trophy, Star, Crown, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Players = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all players
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          leaderboard_scores (
            points,
            wins,
            kills,
            deaths,
            visible_in_leaderboard
          )
        `)
        .order('total_likes', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch special players with corrected query
  const { data: specialPlayers } = useQuery({
    queryKey: ['special-players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_players')
        .select(`
          *,
          profiles!special_players_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            rank_title,
            total_likes,
            bio
          )
        `)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    }
  });

  // Fetch leaderboard scores separately
  const { data: leaderboardScores } = useQuery({
    queryKey: ['leaderboard-scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_scores')
        .select('*');

      if (error) throw error;
      return data;
    }
  });

  // Real-time subscription for special players
  useEffect(() => {
    const channel = supabase
      .channel('special-players-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'special_players'
        },
        () => {
          // Refresh special players data when changes occur
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const weeklyPlayer = specialPlayers?.find(p => p.type === 'weekly');
  const monthlyPlayer = specialPlayers?.find(p => p.type === 'monthly');

  // Get leaderboard data for special players
  const getPlayerLeaderboardData = (userId: string) => {
    return leaderboardScores?.find(score => score.user_id === userId) || null;
  };

  const filteredPlayers = players.filter(player =>
    player.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-s3m-red border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg">جاري تحميل اللاعبين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
            🌟 لاعبو فريق قهار
          </h1>
          <p className="text-white/70 text-lg">تعرف على أبطال الفريق ونجومه</p>
        </motion.div>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="ابحث عن لاعب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-12 pl-4 py-3 bg-black/50 border-s3m-red/30 text-white placeholder-gray-400 rounded-xl focus:border-s3m-red text-right"
            />
          </div>
        </motion.div>

        {/* Special Players Section */}
        {(weeklyPlayer || monthlyPlayer) && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <Card className="gaming-card mb-8">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
                  <Star className="w-8 h-8 text-yellow-400" />
                  اللاعبون المميزون
                  <Star className="w-8 h-8 text-yellow-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
                  {weeklyPlayer && weeklyPlayer.profiles && (
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Crown className="w-6 h-6 text-yellow-400" />
                          <h3 className="text-xl font-bold text-yellow-400">لاعب الأسبوع</h3>
                        </div>
                      </div>
                      <WeeklyPlayerCard 
                        player={{
                          id: weeklyPlayer.profiles.id,
                          username: weeklyPlayer.profiles.username,
                          full_name: weeklyPlayer.profiles.full_name,
                          avatar_url: weeklyPlayer.profiles.avatar_url,
                          rank_title: weeklyPlayer.profiles.rank_title,
                          total_likes: weeklyPlayer.profiles.total_likes,
                          bio: weeklyPlayer.profiles.bio,
                          leaderboard_scores: getPlayerLeaderboardData(weeklyPlayer.user_id)
                        }}
                      />
                    </motion.div>
                  )}
                  
                  {monthlyPlayer && monthlyPlayer.profiles && (
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Calendar className="w-6 h-6 text-purple-400" />
                          <h3 className="text-xl font-bold text-purple-400">لاعب الشهر</h3>
                        </div>
                      </div>
                      <MonthlyPlayerCard 
                        player={{
                          id: monthlyPlayer.profiles.id,
                          username: monthlyPlayer.profiles.username,
                          full_name: monthlyPlayer.profiles.full_name,
                          avatar_url: monthlyPlayer.profiles.avatar_url,
                          rank_title: monthlyPlayer.profiles.rank_title,
                          total_likes: monthlyPlayer.profiles.total_likes,
                          bio: monthlyPlayer.profiles.bio,
                          leaderboard_scores: getPlayerLeaderboardData(monthlyPlayer.user_id)
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* All Players Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="gaming-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-s3m-red flex items-center justify-center gap-3">
                <Users className="w-7 h-7" />
                جميع اللاعبين ({filteredPlayers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPlayers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">لا توجد نتائج</h3>
                  <p className="text-gray-400">لم يتم العثور على لاعبين تطابق بحثك</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredPlayers.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <PlayerCard
                        player={{
                          id: player.id,
                          username: player.username || '',
                          full_name: player.full_name || '',
                          avatar_url: player.avatar_url || '',
                          rank_title: player.rank_title || 'Rookie',
                          total_likes: player.total_likes || 0,
                          bio: player.bio || '',
                          leaderboard_scores: Array.isArray(player.leaderboard_scores) && player.leaderboard_scores.length > 0 
                            ? player.leaderboard_scores[0] 
                            : null
                        }}
                        cardStyle="classic"
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default Players;
