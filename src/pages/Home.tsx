
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CalendarDays, Timer, Users, Flag, LayoutDashboard } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import HomepageVideo from "@/components/HomepageVideo";

const Home = () => {
  const { user, userRole } = useAuth();
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [latestNews, setLatestNews] = useState([]);

  const { data: leaderboardData, isLoading: leaderboardLoading, error: leaderboardError } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_scores')
        .select('points, profiles(username, avatar_url)')
        .order('points', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching leaderboard data:", error);
        throw error;
      }

      return data;
    },
  });

  useEffect(() => {
    const fetchUpcomingTournaments = async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(3);

      if (error) {
        console.error("Error fetching upcoming tournaments:", error);
      } else {
        setUpcomingTournaments(data || []);
      }
    };

    const fetchLatestNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching latest news:", error);
      } else {
        setLatestNews(data || []);
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
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
              مرحباً بك في عالم S3M E-Sports
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              مجتمع الألعاب الأول في الشرق الأوسط. انضم إلينا اليوم وكن جزءًا من الإثارة!
            </p>
            <div className="flex justify-center space-x-4">
              <Button className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red">
                استكشف البطولات
              </Button>
              <Button variant="outline" className="border-gray-500 text-white hover:bg-gray-800">
                انضم إلى فريقنا
              </Button>
            </div>
          </div>
          
          {/* Promotional Video Section */}
          <HomepageVideo />
          
          {/* Upcoming Tournaments Section */}
          <section className="mb-12">
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
                <div key={tournament.id} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-2">{tournament.title}</h3>
                  <p className="text-gray-400 mb-4">{tournament.description}</p>
                  <div className="flex items-center text-gray-500 mb-2">
                    <Timer className="h-4 w-4 mr-2" />
                    {formatDistanceToNow(new Date(tournament.start_date), { addSuffix: true, locale: ar })}
                  </div>
                  <Button className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red">
                    التفاصيل
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Leaderboard Section */}
          <section className="mb-12">
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
                  <div key={index} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center mb-2">
                      <span className="text-xl font-bold text-s3m-red mr-2">#{index + 1}</span>
                      <img
                        src={entry.profiles?.avatar_url}
                        alt={entry.profiles?.username}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <h3 className="text-xl font-bold text-white">{entry.profiles?.username}</h3>
                    </div>
                    <p className="text-gray-400">النقاط: {entry.points}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Latest News Section */}
          <section>
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
              {latestNews.map((newsItem) => (
                <div key={newsItem.id} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-2">{newsItem.title}</h3>
                  <p className="text-gray-400 mb-4">{newsItem.content?.substring(0, 100)}...</p>
                  <Button className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red">
                    اقرأ المزيد
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
