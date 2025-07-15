
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Crown, Eye, ArrowRight, Sparkles, Trophy, GamepadIcon } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import HomepageVideo from "@/components/HomepageVideo";
import WeeklyPlayerCard from '@/components/WeeklyPlayerCard';
import MonthlyPlayerCard from '@/components/MonthlyPlayerCard';
import { motion } from "framer-motion";

const Home = () => {
  const { user, userRole } = useAuth();
  const [latestNews, setLatestNews] = useState([]);

  console.log("Home component rendered, user:", user?.id, "role:", userRole);

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
    const fetchLatestNews = async () => {
      console.log("Fetching latest news...");
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3); // عرض آخر 3 أخبار فقط

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

    fetchLatestNews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-s3m-red via-transparent to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-red-600 via-transparent to-transparent animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-20 animate-float"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-s3m-red rounded-full opacity-30"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{ 
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
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
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative inline-block"
            >
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-s3m-red via-red-500 to-orange-500 mb-4 relative">
                S3M E-SPORTS
                <motion.div
                  className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 sm:w-8 sm:h-8 text-yellow-400" />
                </motion.div>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed px-4"
            >
              مجتمع الألعاب الأول في الشرق الأوسط • انضم إلى النخبة واكتشف عالم الإثارة والمنافسة
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-8 px-4"
            >
              <Button className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-2xl">
                <GamepadIcon className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                ابدأ مغامرتك
              </Button>
              <Button variant="outline" className="border-2 border-gray-400 text-white hover:bg-white hover:text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold transform hover:scale-105 transition-all duration-300 backdrop-blur-sm">
                <Trophy className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                استكشف البطولات
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Promotional Video Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16 sm:mb-20 px-4"
          >
            <HomepageVideo />
          </motion.div>
          
          {/* Special Players Section */}
          {(weeklyPlayer || monthlyPlayer) && (
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-16 sm:mb-20 px-4"
            >
              <div className="text-center mb-8 sm:mb-12">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-purple-500 bg-clip-text text-transparent flex items-center justify-center gap-2 sm:gap-4 mb-4"
                >
                  <Star className="w-6 h-6 sm:w-10 sm:h-10 text-yellow-400 animate-pulse" />
                  نجوم الفريق
                  <Star className="w-6 h-6 sm:w-10 sm:h-10 text-yellow-400 animate-pulse" />
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto"
                >
                  أبطالنا المميزون الذين يقودون الفريق نحو النصر
                </motion.p>
              </div>
              
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 max-w-6xl mx-auto">
                {monthlyPlayer && monthlyPlayer.profiles && (
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="relative"
                  >
                    <div className="absolute -top-4 sm:-top-6 -left-4 sm:-left-6 w-full h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl opacity-20 blur-xl"></div>
                    <div className="text-center mb-4 sm:mb-6 relative z-10">
                      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                        <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 animate-bounce" />
                        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                          لاعب الشهر
                        </h3>
                        <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 animate-bounce" />
                      </div>
                    </div>
                    <div className="relative z-10">
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
                    </div>
                  </motion.div>
                )}
                
                {weeklyPlayer && weeklyPlayer.profiles && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="relative"
                  >
                    <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-20 blur-xl"></div>
                    <div className="text-center mb-4 sm:mb-6 relative z-10">
                      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                        <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 animate-pulse" />
                        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                          لاعب الأسبوع
                        </h3>
                        <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 animate-pulse" />
                      </div>
                    </div>
                    <div className="relative z-10">
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
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.section>
          )}

          {/* Enhanced News Section - آخر 3 أخبار */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mb-16 px-4"
          >
            <div className="text-center mb-12 sm:mb-16">
              <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-s3m-red via-red-500 to-orange-500 bg-clip-text text-transparent mb-6 relative"
              >
                آخر الأخبار والتحديثات
                <motion.div
                  className="absolute -top-1 sm:-top-2 left-1/2 transform -translate-x-1/2"
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
                </motion.div>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              >
                ابقَ على اطلاع دائم بآخر أخبار الفريق والبطولات والإنجازات المميزة
              </motion.p>
            </div>

            {latestNews.length > 0 ? (
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                {latestNews.map((newsItem, index) => (
                  <motion.div 
                    key={newsItem.id} 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.8 + index * 0.2 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="group relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-700/50 hover:border-s3m-red/50 transition-all duration-500 shadow-2xl h-full"
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/0 via-s3m-red/20 to-s3m-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* News Image */}
                    {newsItem.image_url && (
                      <div className="relative h-48 sm:h-56 overflow-hidden">
                        <img 
                          src={newsItem.image_url} 
                          alt={newsItem.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute top-4 right-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 sm:w-8 sm:h-8 bg-s3m-red rounded-full flex items-center justify-center"
                          >
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </motion.div>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4 sm:p-6 relative z-10 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">{formatDistanceToNow(new Date(newsItem.created_at), { addSuffix: true, locale: ar })}</span>
                      </div>
                      
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-s3m-red transition-colors duration-300 flex-shrink-0">
                        {newsItem.title}
                      </h3>
                      
                      <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                        {newsItem.description}
                      </p>
                      
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center text-s3m-red font-semibold text-sm cursor-pointer group-hover:text-white transition-colors duration-300 mt-auto"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        اقرأ المزيد
                        <ArrowRight className="w-4 h-4 mr-2 transform group-hover:translate-x-2 transition-transform duration-300" />
                      </motion.div>
                    </div>
                    
                    {/* Hover Border Glow */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-s3m-red/30 transition-all duration-500"></div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.6 }}
                className="text-center py-16 sm:py-20"
              >
                <div className="relative inline-block">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-s3m-red to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">قريباً...</h3>
                  <p className="text-gray-400 max-w-md mx-auto text-sm sm:text-base">
                    ترقبوا أحدث الأخبار والتحديثات المثيرة من فريق S3M
                  </p>
                </div>
              </motion.div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Home;
