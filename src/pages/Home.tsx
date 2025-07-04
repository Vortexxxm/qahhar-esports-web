import { motion } from "framer-motion";
import { Trophy, Users, Target, Gamepad2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import WeeklyPlayerCard from "@/components/WeeklyPlayerCard";
import MonthlyPlayerCard from "@/components/MonthlyPlayerCard";
import MobileNewsSection from "@/components/MobileNewsSection";
import SmartGreeting from "@/components/SmartGreeting";
import HomepageVideo from "@/components/HomepageVideo";

const Home = () => {
  // Fetch all data independently to avoid dependency issues
  const { data: specialPlayers, isLoading: specialPlayersLoading } = useQuery({
    queryKey: ['special-players'],
    queryFn: async () => {
      console.log('Fetching special players...');
      const { data, error } = await supabase
        .from('special_players')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url,
            game_id,
            rank_title,
            bio,
            total_likes
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching special players:', error);
        throw error;
      }
      console.log('Special players fetched:', data);
      return data;
    },
    staleTime: 5000, // Cache for 5 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 10000 // Refetch every 10 seconds
  });

  // Get all leaderboard scores
  const { data: allLeaderboardScores, isLoading: scoresLoading } = useQuery({
    queryKey: ['all-leaderboard-scores'],
    queryFn: async () => {
      console.log('Fetching all leaderboard scores...');
      const { data, error } = await supabase
        .from('leaderboard_scores')
        .select('*');

      if (error) {
        console.error('Error fetching leaderboard scores:', error);
        throw error;
      }
      console.log('Leaderboard scores fetched:', data);
      return data;
    },
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchInterval: 10000
  });

  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ['homepage-news'],
    queryFn: async () => {
      console.log('Fetching news...');
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching news:', error);
        throw error;
      }
      console.log('News fetched:', data);
      return data || [];
    },
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchInterval: 15000
  });

  // Transform player data with leaderboard scores
  const transformPlayerData = (player: any) => {
    if (!player || !player.profiles || !allLeaderboardScores) return null;
    
    const leaderboardScore = allLeaderboardScores.find(score => score.user_id === player.user_id);
    
    return {
      id: player.user_id,
      username: player.profiles.username,
      full_name: player.profiles.full_name,
      avatar_url: player.profiles.avatar_url,
      rank_title: player.profiles.rank_title || 'Rookie',
      total_likes: player.profiles.total_likes || 0,
      bio: player.profiles.bio || '',
      leaderboard_scores: leaderboardScore ? {
        points: leaderboardScore.points || 0,
        wins: leaderboardScore.wins || 0,
        kills: leaderboardScore.kills || 0,
        deaths: leaderboardScore.deaths || 0,
        visible_in_leaderboard: leaderboardScore.visible_in_leaderboard || false
      } : null
    };
  };

  const weeklyPlayerRaw = specialPlayers?.find(p => p.type === 'weekly');
  const monthlyPlayerRaw = specialPlayers?.find(p => p.type === 'monthly');

  const weeklyPlayer = weeklyPlayerRaw ? transformPlayerData(weeklyPlayerRaw) : null;
  const monthlyPlayer = monthlyPlayerRaw ? transformPlayerData(monthlyPlayerRaw) : null;

  console.log('Weekly player:', weeklyPlayer);
  console.log('Monthly player:', monthlyPlayer);

  const features = [
    {
      icon: Trophy,
      title: "البطولات",
      description: "شارك في البطولات واربح جوائز قيمة",
      link: "/tournaments"
    },
    {
      icon: Users,
      title: "الفريق",
      description: "تعرف على أعضاء الفريق المحترفين",
      link: "/team"
    },
    {
      icon: Target,
      title: "المتصدرين",
      description: "اطلع على ترتيب أفضل اللاعبين",
      link: "/leaderboard"
    },
    {
      icon: Gamepad2,
      title: "انضم إلينا",
      description: "كن جزءاً من عائلة S3M",
      link: "/join-us"
    }
  ];

  // Show loading state while data is being fetched
  const isDataLoading = specialPlayersLoading || scoresLoading || newsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-s3m-red/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <SmartGreeting />
            
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-black mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-s3m-red via-red-500 to-orange-500 bg-clip-text text-transparent">
                S3M
              </span>
              <br />
              <span className="text-white text-3xl md:text-4xl lg:text-5xl">
                Gaming Community
              </span>
            </motion.h1>
            
            <motion.p
              className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              مجتمع الألعاب الرائد في المنطقة. انضم إلينا واستمتع بتجربة ألعاب لا تُنسى
              مع أفضل اللاعبين والبطولات الحصرية
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button asChild size="lg" className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/join-us">انضم إلى الفريق</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white font-bold py-4 px-8 rounded-xl transition-all duration-300">
                <Link to="/tournaments">البطولات</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Homepage Video - Always show */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <HomepageVideo />
          </motion.div>
        </div>
      </section>

      {/* Featured Players Section - Monthly player on the right, Weekly on the left */}
      <section className="py-16 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            اللاعبون المميزون
          </motion.h2>
          
          {isDataLoading ? (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="bg-gray-800 rounded-lg p-6 h-64"></div>
              </div>
              <div className="animate-pulse">
                <div className="bg-gray-800 rounded-lg p-6 h-64"></div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Monthly Player on the Right (appears first on desktop) */}
              {monthlyPlayer && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="md:order-2"
                >
                  <MonthlyPlayerCard player={monthlyPlayer} />
                </motion.div>
              )}
              
              {/* Weekly Player on the Left (appears second on desktop) */}
              {weeklyPlayer && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="md:order-1"
                >
                  <WeeklyPlayerCard player={weeklyPlayer} />
                </motion.div>
              )}
              
              {!weeklyPlayer && !monthlyPlayer && !isDataLoading && (
                <div className="col-span-2 text-center text-white/60">
                  لا توجد لاعبين مميزين حالياً
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* News Section - Moved before Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {newsLoading ? (
            <div className="animate-pulse">
              <div className="bg-gray-800 rounded-lg p-6 h-64 max-w-4xl mx-auto"></div>
            </div>
          ) : (
            <MobileNewsSection news={newsData || []} />
          )}
        </div>
      </section>

      {/* Features Section - Now after News */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            استكشف المجتمع
          </motion.h2>
          <motion.p
            className="text-white/70 text-center mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            اكتشف كل ما يقدمه مجتمع S3M من بطولات وفعاليات وتحديات مثيرة
          </motion.p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={feature.link}>
                  <Card className="gaming-card hover:scale-105 transition-all duration-300 h-full group">
                    <CardContent className="p-6 text-center">
                      <feature.icon className="w-12 h-12 text-s3m-red mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                      <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-white/70">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
