
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CalendarDays, Timer, Users, Flag, LayoutDashboard, Star, Crown, Calendar } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import HomepageVideo from "@/components/HomepageVideo";
import WeeklyPlayerCard from '@/components/WeeklyPlayerCard';
import MonthlyPlayerCard from '@/components/MonthlyPlayerCard';
import { motion } from "framer-motion";

const Home = () => {
  const { user, userRole } = useAuth();
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [latestNews, setLatestNews] = useState([]);

  console.log("Home component rendered, user:", user?.id, "role:", userRole);

  const { data: leaderboardData, isLoading: leaderboardLoading, error: leaderboardError } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      console.log("Fetching leaderboard data...");
      const { data, error } = await supabase
        .from('leaderboard_scores')
        .select(`
          points,
          profiles!inner (
            username,
            avatar_url
          )
        `)
        .eq('visible_in_leaderboard', true)
        .order('points', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching leaderboard data:", error);
        throw error;
      }

      console.log("Leaderboard data fetched:", data);
      return data;
    },
  });

  // Fetch special players
  const { data: specialPlayers, isLoading: specialPlayersLoading } = useQuery({
    queryKey: ['special-players'],
    queryFn: async () => {
      console.log("Fetching special players...");
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

      if (error) {
        console.error("Error fetching special players:", error);
        throw error;
      }

      console.log("Special players fetched:", data);
      return data;
    }
  });

  // Fetch leaderboard scores for special players
  const { data: leaderboardScores } = useQuery({
    queryKey: ['leaderboard-scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_scores')
        .select('*');

      if (error) {
        console.error("Error fetching leaderboard scores:", error);
        throw error;
      }

      return data;
    }
  });

  const weeklyPlayer = specialPlayers?.find(p => p.type === 'weekly');
  const monthlyPlayer = specialPlayers?.find(p => p.type === 'monthly');

  // Get leaderboard data for special players
  const getPlayerLeaderboardData = (userId: string) => {
    return leaderboardScores?.find(score => score.user_id === userId) || null;
  };

  useEffect(() => {
    const fetchUpcomingTournaments = async () => {
      console.log("Fetching upcoming tournaments...");
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(3);

        if (error) {
          console.error("Error fetching upcoming tournaments:", error);
        } else {
          console.log("Tournaments fetched:", data);
          setUpcomingTournaments(data || []);
        }
      } catch (error) {
        console.error("Error in fetchUpcomingTournaments:", error);
      }
    };

    const fetchLatestNews = async () => {
      console.log("Fetching latest news...");
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error("Error fetching latest news:", error);
        } else {
          console.log("News fetched:", data);
          setLatestNews(data || []);
        }
      } catch (error) {
        console.error("Error in fetchLatestNews:", error);
      }
    };

    fetchUpcomingTournaments();
    fetchLatestNews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-s3m-red via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-red-600 via-transparent to-transparent"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
              مرحباً بك في عالم S3M E-Sports
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              مجتمع الألعاب الأول في الشرق الأوسط. انضم إلينا اليوم وكن جزءًا من الإثارة!
            </p>
            <div className="flex justify-center space-x-4 space-x-reverse">
              <Button className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red">
                استكشف البطولات
              </Button>
              <Button variant="outline" className="border-gray-500 text-white hover:bg-gray-800">
                انضم إلى فريقنا
              </Button>
            </div>
          </motion.div>
          
          {/* Promotional Video Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HomepageVideo />
          </motion.div>
          
          {/* Special Players Section */}
          {(weeklyPlayer || monthlyPlayer) && (
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
                  <Star className="w-8 h-8 text-yellow-400" />
                  اللاعبون المميزون
                  <Star className="w-8 h-8 text-yellow-400" />
                </h2>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
                {monthlyPlayer && monthlyPlayer.profiles && (
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Crown className="w-6 h-6 text-yellow-400" />
                        <h3 className="text-xl font-bold text-yellow-400">لاعب الشهر</h3>
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
                
                {weeklyPlayer && weeklyPlayer.profiles && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  >
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-bold text-purple-400">لاعب الأسبوع</h3>
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
              </div>
            </motion.section>
          )}

          {/* Upcoming Tournaments Section */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-semibold text-white flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-s3m-red" />
                البطولات القادمة
              </h2>
              <Button variant="link" className="text-s3m-red">
                عرض الكل
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTournaments.map((tournament) => (
                <motion.div 
                  key={tournament.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-s3m-red/50 transition-all duration-300"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{tournament.title}</h3>
                  <p className="text-gray-400 mb-4">{tournament.description}</p>
                  <div className="flex items-center text-gray-500 mb-2">
                    <Timer className="h-4 w-4 mr-2" />
                    {formatDistanceToNow(new Date(tournament.start_date), { addSuffix: true, locale: ar })}
                  </div>
                  <Button className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red">
                    التفاصيل
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Leaderboard Section */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-semibold text-white flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-s3m-red" />
                المتصدرين
              </h2>
              <Button variant="link" className="text-s3m-red">
                عرض الكل
              </Button>
            </div>
            {leaderboardLoading ? (
              <div className="text-center">جاري التحميل...</div>
            ) : leaderboardError ? (
              <div className="text-center text-red-500">حدث خطأ أثناء تحميل المتصدرين.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leaderboardData?.map((entry: any, index: number) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-xl font-bold text-s3m-red mr-2">#{index + 1}</span>
                      <img
                        src={entry.profiles?.avatar_url || '/placeholder.svg'}
                        alt={entry.profiles?.username}
                        className="w-8 h-8 rounded-full mr-2"
                        onError={(e) => {
                          e.target.src = '/placeholder.svg';
                        }}
                      />
                      <h3 className="text-xl font-bold text-white">{entry.profiles?.username}</h3>
                    </div>
                    <p className="text-gray-400">النقاط: {entry.points?.toLocaleString() || 0}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Latest News Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-semibold text-white flex items-center gap-2">
                <Flag className="h-6 w-6 text-s3m-red" />
                آخر الأخبار
              </h2>
              <Button variant="link" className="text-s3m-red">
                عرض الكل
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestNews.map((newsItem, index) => (
                <motion.div 
                  key={newsItem.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-s3m-red/50 transition-all duration-300"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{newsItem.title}</h3>
                  <p className="text-gray-400 mb-4">{newsItem.content?.substring(0, 100) || newsItem.description?.substring(0, 100)}...</p>
                  <Button className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red">
                    اقرأ المزيد
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Home;
