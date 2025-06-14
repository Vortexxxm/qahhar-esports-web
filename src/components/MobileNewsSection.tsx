
import { motion } from 'framer-motion';
import { Bell, Globe, Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string | null;
  image_url: string | null;
  video_url?: string | null;
  created_at: string;
  updated_at: string;
  author_id: string | null;
}

interface MobileNewsSectionProps {
  news: NewsItem[];
}

const MobileNewsSection = ({ news }: MobileNewsSectionProps) => {
  const navigate = useNavigate();

  if (news.length === 0) return null;

  // عرض أول 3 أخبار فقط
  const latestNews = news.slice(0, 3);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative py-8 md:py-12 bg-gradient-to-br from-black/98 via-s3m-red/5 to-purple-900/10 border-y border-s3m-red/20 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/3 to-purple-600/3"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(239,68,68,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.08),transparent_50%)]"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-s3m-red/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.9, 0.2],
              scale: [1, 2.5, 1],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 6,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 container mx-auto px-4">
        {/* Enhanced Header */}
        <div className="flex items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="mr-3"
              >
                <Bell className="w-7 h-7 md:w-9 md:h-9 text-s3m-red" />
              </motion.div>
              <h3 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-s3m-red via-red-400 to-orange-500 bg-clip-text text-transparent">
                الأخبار العاجلة
              </h3>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="mr-3"
              >
                <Globe className="w-6 h-6 md:w-7 md:h-7 text-s3m-red" />
              </motion.div>
            </div>
            <div className="w-16 md:w-24 h-0.5 bg-gradient-to-r from-s3m-red to-orange-500 rounded-full mx-auto mb-4"></div>
            <p className="text-white/85 text-base md:text-lg font-medium px-3">
              تابع آخر أخبار وأحداث عالم S3M E-Sports
            </p>
          </motion.div>
        </div>
        
        {/* قسم الأخبار الثابت - بدون تمرير */}
        <div className="relative rounded-2xl border border-s3m-red/40 backdrop-blur-sm shadow-2xl bg-black/95 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/10 via-transparent to-purple-600/10"></div>
          
          {/* عرض الأخبار الثابت */}
          <div className="relative py-6">
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 px-4">
              {latestNews.map((newsItem, index) => (
                <motion.div
                  key={`static-news-${newsItem.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="w-full"
                >
                  <div className="relative group h-full min-h-[280px] bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden shadow-xl border border-s3m-red/50 hover:border-s3m-red/70 transition-all duration-300">
                    
                    {/* صورة الخبر */}
                    {newsItem.image_url && (
                      <div className="aspect-video w-full overflow-hidden relative">
                        <img 
                          src={newsItem.image_url} 
                          alt={newsItem.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        
                        {/* شارة الخبر الجديد */}
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-s3m-red to-red-600 text-white text-sm px-3 py-1.5 rounded-full font-bold shadow-lg z-10">
                          🔥 جديد
                        </div>
                      </div>
                    )}
                    
                    {/* محتوى الخبر */}
                    <div className="p-4 flex-1 flex flex-col justify-between bg-black/95">
                      <div>
                        <h4 className="text-lg font-bold text-s3m-red mb-3 line-clamp-2 leading-tight">
                          {newsItem.title}
                        </h4>
                        <p className="text-white/85 text-base mb-4 line-clamp-2 leading-relaxed">
                          {newsItem.description}
                        </p>
                      </div>
                      
                      {/* معلومات الخبر */}
                      <div className="flex items-center justify-between text-sm text-white/70 mt-auto">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs">{new Date(newsItem.created_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-s3m-red font-bold text-sm">S3M</span>
                          <span className="text-xs">⭐</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* لمسة تصميمية */}
                    <div className="absolute top-0 left-0 w-0 h-0 border-r-[30px] border-r-transparent border-t-[30px] border-t-s3m-red/20"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* زر عرض المزيد */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8"
        >
          <Button 
            variant="outline"
            onClick={() => navigate('/news')}
            className="border-2 border-s3m-red text-s3m-red hover:bg-gradient-to-r hover:from-s3m-red hover:to-red-600 hover:text-white hover:border-transparent rounded-xl transition-all duration-300 text-base px-8 py-3 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Newspaper className="w-5 h-5 ml-2" />
            المزيد من الأخبار
            <ArrowRight className="w-5 h-5 mr-2" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default MobileNewsSection;
