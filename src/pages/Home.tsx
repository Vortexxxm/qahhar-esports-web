
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Trophy, Target, Star, Flame, Zap, GamepadIcon, Crown, Calendar, ArrowRight, Bell, Globe, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import WeeklyPlayerCard from '@/components/WeeklyPlayerCard';
import MonthlyPlayerCard from '@/components/MonthlyPlayerCard';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  // Fetch latest news with images
  const { data: news = [] } = useQuery({
    queryKey: ['latest-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch special players
  const { data: specialPlayers } = useQuery({
    queryKey: ['special-players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_players')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            rank_title,
            total_likes,
            bio
          ),
          leaderboard_scores:user_id (
            points,
            wins,
            kills,
            deaths,
            visible_in_leaderboard
          )
        `)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    }
  });

  const weeklyPlayer = specialPlayers?.find(p => p.type === 'weekly');
  const monthlyPlayer = specialPlayers?.find(p => p.type === 'monthly');

  // Auto-scroll news
  useEffect(() => {
    if (news.length > 1) {
      const interval = setInterval(() => {
        setCurrentNewsIndex((prev) => (prev + 1) % news.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [news.length]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-s3m-red/20 overflow-hidden">
      {/* Hero Section with Video Trailer */}
      <motion.section 
        className="relative h-screen flex items-center justify-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-s3m-red/20 to-black/80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]"></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-s3m-red/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          {/* Main Title */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl md:text-8xl font-black mb-4 bg-gradient-to-r from-s3m-red via-red-400 to-orange-500 bg-clip-text text-transparent">
              فريق قهار S3M
            </h1>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Flame className="w-8 h-8 text-red-500 animate-pulse" />
              <p className="text-xl md:text-3xl text-white/90 font-bold">
                ترايلر الكلان الأسطوري
              </p>
              <Flame className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
          </motion.div>

          {/* Video Trailer Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-br from-s3m-red/20 to-purple-600/20 rounded-3xl p-2 border-2 border-s3m-red/50 shadow-2xl shadow-s3m-red/25">
                <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                  {/* Video Placeholder with Amazing Effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-s3m-red/30 via-purple-600/20 to-blue-600/20 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                        className="mb-6"
                      >
                        <Play className="w-24 h-24 text-s3m-red mx-auto drop-shadow-2xl" />
                      </motion.div>
                      
                      <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
                        🎬 ترايلر فريق قهار الرسمي
                      </h3>
                      <p className="text-lg text-white/80 mb-6">
                        شاهد رحلة الكلان الأسطورية نحو المجد
                      </p>
                      
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Play className="w-6 h-6 mr-2" />
                        تشغيل الترايلر
                      </Button>
                    </div>
                  </div>
                  
                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-2xl border-4 border-transparent bg-gradient-to-r from-s3m-red via-purple-500 to-blue-500 opacity-50 animate-pulse"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => navigate('/join-us')}
              className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Users className="w-6 h-6 mr-2" />
              انضم إلى الفريق
              <Rocket className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/tournaments')}
              className="border-2 border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <Trophy className="w-6 h-6 mr-2" />
              البطولات
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Moving News Ticker */}
      <motion.section 
        variants={itemVariants}
        className="relative py-6 bg-black/80 border-y border-s3m-red/30 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/10 to-purple-600/10"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <Bell className="w-6 h-6 text-s3m-red mr-3 animate-pulse" />
            <h3 className="text-xl font-bold text-white">آخر الأخبار</h3>
            <Globe className="w-5 h-5 text-s3m-red ml-3" />
          </div>
          
          {news.length > 0 && (
            <div className="relative h-16 overflow-hidden rounded-lg bg-black/50 border border-s3m-red/30">
              <motion.div
                key={currentNewsIndex}
                initial={{ x: '100%' }}
                animate={{ x: '-100%' }}
                transition={{ duration: 20, ease: 'linear' }}
                className="absolute inset-0 flex items-center px-6 text-white"
              >
                <Star className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                <span className="text-lg font-medium whitespace-nowrap">
                  {news[currentNewsIndex]?.title}
                </span>
              </motion.div>
            </div>
          )}
          
          <div className="text-center mt-6">
            <Button 
              variant="outline"
              onClick={() => navigate('/news')}
              className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white"
            >
              زيارة صفحة الأخبار
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Special Players Section */}
      {(weeklyPlayer || monthlyPlayer) && (
        <motion.section 
          variants={itemVariants}
          className="py-16 px-4"
        >
          <div className="container mx-auto max-w-6xl">
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-s3m-red to-purple-500 bg-clip-text text-transparent"
            >
              🌟 اللاعبون المميزون 🌟
            </motion.h2>
            
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              {weeklyPlayer && weeklyPlayer.profiles && (
                <motion.div variants={itemVariants}>
                  <WeeklyPlayerCard 
                    player={{
                      id: weeklyPlayer.profiles.id,
                      username: weeklyPlayer.profiles.username,
                      full_name: weeklyPlayer.profiles.full_name,
                      avatar_url: weeklyPlayer.profiles.avatar_url,
                      rank_title: weeklyPlayer.profiles.rank_title,
                      total_likes: weeklyPlayer.profiles.total_likes,
                      bio: weeklyPlayer.profiles.bio,
                      leaderboard_scores: weeklyPlayer.leaderboard_scores
                    }}
                  />
                </motion.div>
              )}
              
              {monthlyPlayer && monthlyPlayer.profiles && (
                <motion.div variants={itemVariants}>
                  <MonthlyPlayerCard 
                    player={{
                      id: monthlyPlayer.profiles.id,
                      username: monthlyPlayer.profiles.username,
                      full_name: monthlyPlayer.profiles.full_name,
                      avatar_url: monthlyPlayer.profiles.avatar_url,
                      rank_title: monthlyPlayer.profiles.rank_title,
                      total_likes: monthlyPlayer.profiles.total_likes,
                      bio: monthlyPlayer.profiles.bio,
                      leaderboard_scores: monthlyPlayer.leaderboard_scores
                    }}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* Team Stats Section */}
      <motion.section 
        variants={itemVariants}
        className="py-16 px-4 bg-black/50"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-5xl font-bold text-center mb-12 text-white"
          >
            🏆 إحصائيات الفريق
          </motion.h2>
          
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { icon: Users, label: 'الأعضاء', value: '150+', color: 'text-blue-400' },
              { icon: Trophy, label: 'البطولات', value: '25+', color: 'text-yellow-400' },
              { icon: Target, label: 'الانتصارات', value: '500+', color: 'text-green-400' },
              { icon: GamepadIcon, label: 'المباريات', value: '1000+', color: 'text-purple-400' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center"
              >
                <Card className="bg-black/50 border-s3m-red/30 hover:border-s3m-red/60 transition-all duration-300">
                  <CardContent className="p-6">
                    <stat.icon className={`w-12 h-12 ${stat.color} mx-auto mb-4`} />
                    <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                    <p className="text-gray-400">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section 
        variants={itemVariants}
        className="py-16 px-4 text-center bg-gradient-to-r from-s3m-red/20 to-purple-600/20"
      >
        <div className="container mx-auto max-w-4xl">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-5xl font-bold mb-6 text-white"
          >
            🚀 هل أنت مستعد للانضمام؟
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-white/80 mb-8"
          >
            انضم إلى عائلة قهار وكن جزءاً من الأسطورة
          </motion.p>
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg"
              onClick={() => navigate('/join-us')}
              className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Crown className="w-6 h-6 mr-2" />
              ابدأ رحلتك الآن
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
