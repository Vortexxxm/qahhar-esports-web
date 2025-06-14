import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Trophy, Target, Star, Crown, Calendar, ArrowRight, Bell, Globe, Rocket, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import WeeklyPlayerCard from '@/components/WeeklyPlayerCard';
import MonthlyPlayerCard from '@/components/MonthlyPlayerCard';
import NewsCard from '@/components/NewsCard';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch latest news with images
  const { data: news = [] } = useQuery({
    queryKey: ['latest-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      
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

  // Fetch uploaded video from storage or URL
  const { data: trailerVideo } = useQuery({
    queryKey: ['homepage-trailer'],
    queryFn: async () => {
      const { data: videoFile, error: videoError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'homepage_video_file')
        .maybeSingle();
      
      if (videoFile && videoFile.value) {
        const { data: urlData } = supabase.storage
          .from('admin-videos')
          .getPublicUrl(videoFile.value);
        return { type: 'file', url: urlData.publicUrl };
      }

      const { data: urlSetting, error: urlError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'homepage_trailer')
        .maybeSingle();
      
      if (urlSetting && urlSetting.value) {
        return { type: 'url', url: urlSetting.value };
      }

      return null;
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

  const weeklyPlayer = specialPlayers?.find(p => p.type === 'weekly');
  const monthlyPlayer = specialPlayers?.find(p => p.type === 'monthly');

  const getPlayerLeaderboardData = (userId: string) => {
    return leaderboardScores?.find(score => score.user_id === userId) || null;
  };

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
        duration: 0.6
      }
    }
  };

  const getTrailerVideoUrl = () => {
    return trailerVideo?.url || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-s3m-red/20 overflow-hidden rtl" dir="rtl">
      {/* Hero Video Trailer Section */}
      <motion.section 
        className="relative h-screen flex items-center justify-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Video Background */}
        <div className="absolute inset-0 bg-black">
          {getTrailerVideoUrl() ? (
            <video
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src={getTrailerVideoUrl()!} type="video/mp4" />
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80')`
                }}
              />
            </video>
          ) : (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80')`
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-s3m-red/30 to-black/80"></div>
        </div>
        
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
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl md:text-8xl font-black mb-6 bg-gradient-to-r from-s3m-red via-red-400 to-orange-500 bg-clip-text text-transparent">
              إطلاق القوة
            </h1>
            <div className="flex items-center justify-center gap-3 mb-6">
              <p className="text-2xl md:text-4xl text-white font-bold">
                S3M E-Sports
              </p>
            </div>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              نهيمن على ساحة المعركة. نعيد تعريف النصر. انضم إلى الأسطورة.
            </p>
          </motion.div>

          {!getTrailerVideoUrl() && (
            <motion.div variants={itemVariants} className="mb-12">
              <div className="relative w-full max-w-4xl mx-auto">
                <div className="relative bg-gradient-to-br from-s3m-red/20 to-purple-600/20 rounded-3xl p-2 border-2 border-s3m-red/50 shadow-2xl shadow-s3m-red/25">
                  <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
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
                          🎬 المقطع الدعائي الرسمي لـ S3M
                        </h3>
                        <p className="text-lg text-white/80 mb-6">
                          شاهد رحلتنا الأسطورية نحو العظمة
                        </p>
                        
                        <Button 
                          size="lg"
                          className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <Play className="w-6 h-6 ml-2" />
                          تشغيل المقطع الدعائي
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => navigate('/join-us')}
              className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Users className="w-6 h-6 ml-2" />
              انضم إلى فريقنا
              <Rocket className="w-5 h-5 mr-2" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/tournaments')}
              className="border-2 border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <Trophy className="w-6 h-6 ml-2" />
              البطولات
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Mobile-First News Section */}
      {news.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative py-12 md:py-16 bg-gradient-to-br from-black/95 via-s3m-red/10 to-purple-900/20 border-y border-s3m-red/30"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/5 to-purple-600/5"></div>
          
          {/* Floating particles for enhanced visual appeal */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-s3m-red/40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 container mx-auto px-3 md:px-4">
            <div className="flex items-center justify-center mb-8 md:mb-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-4 md:mb-6">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="mr-3 md:mr-4"
                  >
                    <Bell className="w-8 h-8 md:w-10 md:h-10 text-s3m-red" />
                  </motion.div>
                  <h3 className="text-2xl md:text-3xl lg:text-5xl font-black bg-gradient-to-r from-s3m-red via-red-400 to-orange-500 bg-clip-text text-transparent">
                    الأخبار المميزة
                  </h3>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mr-3 md:mr-4"
                  >
                    <Globe className="w-6 h-6 md:w-8 md:h-8 text-s3m-red" />
                  </motion.div>
                </div>
                <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-s3m-red to-orange-500 rounded-full mx-auto mb-4 md:mb-6"></div>
                <p className="text-white/80 text-base md:text-lg font-medium px-4">آخر الأخبار والتطورات من عالم S3M E-Sports</p>
              </motion.div>
            </div>
            
            {/* Mobile-Optimized News Carousel */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-black/70 to-gray-900/70 border border-s3m-red/40 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/10 via-transparent to-purple-600/10"></div>
              
              <div className="relative py-6 md:py-8">
                {/* Mobile News Display */}
                <div className="block md:hidden">
                  <motion.div
                    className="flex gap-4 px-4"
                    animate={{ x: [0, -100 * news.length + "%"] }}
                    transition={{
                      duration: news.length * 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ width: `${news.length * 100}%` }}
                  >
                    {[...news, ...news].map((newsItem, index) => (
                      <motion.div
                        key={`${newsItem.id}-${index}`}
                        className="flex-shrink-0 w-80"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative group h-full">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-s3m-red/50 to-purple-600/50 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 border border-s3m-red/30 rounded-xl overflow-hidden h-full">
                            {/* News Image */}
                            {newsItem.image_url && (
                              <div className="aspect-video w-full overflow-hidden">
                                <img 
                                  src={newsItem.image_url} 
                                  alt={newsItem.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            {/* News Content */}
                            <div className="p-4">
                              <h4 className="text-lg font-bold text-s3m-red mb-2 line-clamp-2 leading-tight">
                                {newsItem.title}
                              </h4>
                              <p className="text-white/80 text-sm mb-3 line-clamp-3 leading-relaxed">
                                {newsItem.description}
                              </p>
                              
                              <div className="flex items-center justify-between text-xs text-white/60">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(newsItem.created_at).toLocaleDateString('ar-SA')}</span>
                                </div>
                                {newsItem.author_id && (
                                  <div className="flex items-center gap-1">
                                    <span>الإدارة</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Desktop News Display */}
                <div className="hidden md:block">
                  <motion.div
                    className="flex space-x-6 rtl:space-x-reverse"
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ willChange: "transform" }}
                  >
                    {[...news, ...news].map((newsItem, index) => (
                      <motion.div
                        key={`${newsItem.id}-${index}`}
                        className="flex-shrink-0 w-96"
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-s3m-red/60 to-purple-600/60 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 border border-s3m-red/30 rounded-2xl p-1">
                            <NewsCard news={newsItem} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
              
              {/* Enhanced Gradient overlays - Mobile Optimized */}
              <div className="absolute left-0 top-0 bottom-0 w-8 md:w-40 bg-gradient-to-r from-black via-black/90 to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 md:w-40 bg-gradient-to-l from-black via-black/90 to-transparent z-10"></div>
            </div>
            
            {/* Enhanced View All News Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-8 md:mt-10"
            >
              <Button 
                variant="outline"
                onClick={() => navigate('/news')}
                className="border-2 border-s3m-red text-s3m-red hover:bg-gradient-to-r hover:from-s3m-red hover:to-red-600 hover:text-white hover:border-transparent rounded-xl transition-all duration-300 text-base md:text-lg px-8 md:px-10 py-3 md:py-4 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Newspaper className="w-5 h-5 md:w-6 md:h-6 ml-2" />
                جميع الأخبار
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 mr-2" />
              </Button>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Enhanced Player of the Month/Week Section - Mobile Optimized */}
      {(weeklyPlayer || monthlyPlayer) && (
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="py-16 px-4 bg-gradient-to-br from-black/80 via-gray-900/80 to-s3m-red/20"
        >
          <div className="container mx-auto max-w-6xl">
            <motion.h2 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent"
            >
              🌟 اللاعبون المميزون 🌟
            </motion.h2>
            
            <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
              {monthlyPlayer && monthlyPlayer.profiles && (
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="relative"
                >
                  <div className="mb-4">
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
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="relative"
                >
                  <div className="mb-4">
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
          </div>
        </motion.section>
      )}

      {/* Team Stats Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="py-16 px-4 bg-gradient-to-r from-s3m-red/20 to-purple-600/20"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.h2 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold text-center mb-12 text-white"
          >
            🏆 إحصائيات النصر
          </motion.h2>
          
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { icon: Users, label: 'الأعضاء المميزون', value: '150+', color: 'text-blue-400' },
              { icon: Trophy, label: 'البطولات', value: '25+', color: 'text-yellow-400' },
              { icon: Target, label: 'الانتصارات', value: '500+', color: 'text-green-400' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center"
              >
                <Card className="gaming-card hover:border-s3m-red/60 transition-all duration-300">
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
    </div>
  );
};

export default Home;
