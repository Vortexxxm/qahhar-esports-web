
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

  // تكرار الأخبار 3 مرات للحصول على حركة مستمرة وسلسة
  const repeatedNews = [...news, ...news, ...news];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative py-8 md:py-16 bg-gradient-to-br from-black/95 via-s3m-red/10 to-purple-900/20 border-y border-s3m-red/30"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/5 to-purple-600/5"></div>
      
      {/* Floating particles */}
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
              y: [0, -20, 0],
              opacity: [0.2, 0.9, 0.2],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 container mx-auto px-3">
        {/* Header */}
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
                الأخبار المميزة
              </h3>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mr-3"
              >
                <Globe className="w-6 h-6 md:w-7 md:h-7 text-s3m-red" />
              </motion.div>
            </div>
            <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-s3m-red to-orange-500 rounded-full mx-auto mb-4"></div>
            <p className="text-white/90 text-base md:text-lg font-medium px-4">آخر الأخبار والتطورات من عالم S3M E-Sports</p>
          </motion.div>
        </div>
        
        {/* Mobile News Container */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black/90 to-gray-900/90 border-2 border-s3m-red/50 backdrop-blur-sm shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/15 via-transparent to-purple-600/15"></div>
          
          {/* News Scrolling Container */}
          <div className="relative py-6">
            <motion.div
              className="flex gap-4"
              animate={{ x: [0, "-33.333%"] }}
              transition={{
                duration: 45, // حركة أبطأ - 45 ثانية
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop"
              }}
              style={{ 
                willChange: "transform",
                width: `${repeatedNews.length * 300}px`
              }}
            >
              {repeatedNews.map((newsItem, index) => (
                <motion.div
                  key={`${newsItem.id}-${index}`}
                  className="flex-shrink-0 w-72"
                  whileHover={{ 
                    scale: 1.03,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="relative group h-full">
                    {/* Enhanced Glow effect */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-s3m-red/50 to-purple-600/50 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    
                    {/* News Card */}
                    <div className="relative bg-gradient-to-br from-gray-900/98 to-black/98 border-2 border-s3m-red/40 rounded-xl overflow-hidden h-full shadow-xl group-hover:border-s3m-red/70 transition-all duration-300">
                      {/* News Image */}
                      {newsItem.image_url && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={newsItem.image_url} 
                            alt={newsItem.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        </div>
                      )}
                      
                      {/* News Content */}
                      <div className="p-4">
                        <h4 className="text-base font-bold text-s3m-red mb-3 line-clamp-2 leading-tight">
                          {newsItem.title}
                        </h4>
                        <p className="text-white/85 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {newsItem.description}
                        </p>
                        
                        {/* News Meta */}
                        <div className="flex items-center justify-between text-sm text-white/70">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(newsItem.created_at).toLocaleDateString('ar-SA')}</span>
                          </div>
                          {newsItem.author_id && (
                            <div className="flex items-center gap-1">
                              <span className="text-s3m-red font-medium">الإدارة</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-s3m-red/20"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Enhanced Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black via-black/95 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black via-black/95 to-transparent z-10"></div>
        </div>
        
        {/* View All News Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mt-8"
        >
          <Button 
            variant="outline"
            onClick={() => navigate('/news')}
            className="border-2 border-s3m-red text-s3m-red hover:bg-gradient-to-r hover:from-s3m-red hover:to-red-600 hover:text-white hover:border-transparent rounded-xl transition-all duration-500 text-base px-8 py-3 font-bold shadow-lg hover:shadow-2xl transform hover:scale-110"
          >
            <Newspaper className="w-5 h-5 ml-2" />
            جميع الأخبار
            <ArrowRight className="w-5 h-5 mr-2" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default MobileNewsSection;
