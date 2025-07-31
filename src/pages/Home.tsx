import React, { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Crown, GamepadIcon, Trophy, Eye, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import HomepageVideo from "@/components/HomepageVideo";
import WeeklyPlayerCard from '@/components/WeeklyPlayerCard';
import MonthlyPlayerCard from '@/components/MonthlyPlayerCard';

const Home = memo(() => {
  const { user, userRole } = useAuth();

  // Single optimized query for all home page data
  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home-data'],
    queryFn: async () => {
      // Fetch all data in parallel for better performance
      const [specialPlayersResult, leaderboardResult, newsResult] = await Promise.all([
        supabase
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
          .eq('is_active', true),
        
        supabase
          .from('leaderboard_scores')
          .select('*'),
          
        supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      return {
        specialPlayers: specialPlayersResult.data || [],
        leaderboardScores: leaderboardResult.data || [],
        latestNews: newsResult.data || []
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
  });

  // Memoize calculations for better performance
  const { specialPlayers = [], leaderboardScores = [], latestNews = [] } = homeData || {};
  
  const weeklyPlayer = useMemo(() => 
    specialPlayers.find(p => p.type === 'weekly'), 
    [specialPlayers]
  );
  
  const monthlyPlayer = useMemo(() => 
    specialPlayers.find(p => p.type === 'monthly'), 
    [specialPlayers]
  );

  const getPlayerLeaderboardData = useMemo(() => (userId: string) => {
    return leaderboardScores.find(score => score.user_id === userId) || null;
  }, [leaderboardScores]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-s3m-red mx-auto mb-4"></div>
          <div className="text-white text-lg">جاري تحميل المحتوى...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative">
      {/* Simplified Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-s3m-red via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-red-600 via-transparent to-transparent"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Content */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-s3m-red via-red-500 to-orange-500 mb-4">
              S3M E-SPORTS
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              مجتمع الألعاب الأول في الشرق الأوسط • انضم إلى النخبة واكتشف عالم الإثارة والمنافسة
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 px-4">
              <Button className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold transition-all duration-300">
                <GamepadIcon className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                ابدأ مغامرتك
              </Button>
              <Button variant="outline" className="border-2 border-gray-400 text-white hover:bg-white hover:text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold transition-all duration-300">
                <Trophy className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                استكشف البطولات
              </Button>
            </div>
          </div>
           
          {/* Promotional Video Section */}
          <div className="mb-16 sm:mb-20 px-4">
            <HomepageVideo />
          </div>
           
          {/* Special Players Section */}
          {(weeklyPlayer || monthlyPlayer) && (
            <section className="mb-16 sm:mb-20 px-4">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-purple-500 bg-clip-text text-transparent flex items-center justify-center gap-2 sm:gap-4 mb-4">
                  <Star className="w-6 h-6 sm:w-10 sm:h-10 text-yellow-400" />
                  نجوم الفريق
                  <Star className="w-6 h-6 sm:w-10 sm:h-10 text-yellow-400" />
                </h2>
                <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto">
                  أبطالنا المميزون الذين يقودون الفريق نحو النصر
                </p>
              </div>
               
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 max-w-6xl mx-auto">
                {monthlyPlayer && monthlyPlayer.profiles && (
                  <div className="relative">
                    <div className="absolute -top-4 sm:-top-6 -left-4 sm:-left-6 w-full h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl opacity-20 blur-xl"></div>
                    <div className="text-center mb-4 sm:mb-6 relative z-10">
                      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                        <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                          لاعب الشهر
                        </h3>
                        <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
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
                  </div>
                )}
                 
                {weeklyPlayer && weeklyPlayer.profiles && (
                  <div className="relative">
                    <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-20 blur-xl"></div>
                    <div className="text-center mb-4 sm:mb-6 relative z-10">
                      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
                        <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                          لاعب الأسبوع
                        </h3>
                        <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
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
                  </div>
                )}
              </div>
            </section>
          )}

          {/* News Section */}
          <section className="mb-16 px-4">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-s3m-red via-red-500 to-orange-500 bg-clip-text text-transparent mb-6">
                آخر الأخبار والتحديثات
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                ابقَ على اطلاع دائم بآخر أخبار الفريق والبطولات والإنجازات المميزة
              </p>
            </div>

            {latestNews.length > 0 ? (
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                {latestNews.map((newsItem) => (
                  <div 
                    key={newsItem.id} 
                    className="group relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-700/50 hover:border-s3m-red/50 transition-all duration-300 shadow-2xl h-full"
                  >
                    {/* News Image */}
                    {newsItem.image_url && (
                      <div className="relative h-48 sm:h-56 overflow-hidden">
                        <img 
                          src={newsItem.image_url} 
                          alt={newsItem.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      </div>
                    )}
                     
                    <div className="p-4 sm:p-6 relative z-10 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">
                          {formatDistanceToNow(new Date(newsItem.created_at), { addSuffix: true, locale: ar })}
                        </span>
                      </div>
                       
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-s3m-red transition-colors duration-300 flex-shrink-0">
                        {newsItem.title}
                      </h3>
                       
                      <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                        {newsItem.description}
                      </p>
                       
                      <div className="flex items-center text-s3m-red font-semibold text-sm cursor-pointer group-hover:text-white transition-colors duration-300 mt-auto">
                        <Eye className="w-4 h-4 ml-2" />
                        اقرأ المزيد
                        <ArrowRight className="w-4 h-4 mr-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 sm:py-20">
                <div className="relative inline-block">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-s3m-red to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">قريباً...</h3>
                  <p className="text-gray-400 max-w-md mx-auto text-sm sm:text-base">
                    ترقبوا أحدث الأخبار والتحديثات المثيرة من فريق S3M
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
});

export default Home;