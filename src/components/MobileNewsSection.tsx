
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

  // تكرار الأخبار 4 مرات للحصول على حركة مستمرة واحترافية
  const repeatedNews = [...news, ...news, ...news, ...news];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative py-6 md:py-12 bg-gradient-to-br from-black/98 via-s3m-red/5 to-purple-900/10 border-y border-s3m-red/20"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/3 to-purple-600/3"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(239,68,68,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.08),transparent_50%)]"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-s3m-red/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 container mx-auto px-2">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <Bell className="w-6 h-6 md:w-8 md:h-8 text-s3m-red" />
              </motion.div>
              <h3 className="text-xl md:text-3xl font-black bg-gradient-to-r from-s3m-red via-red-400 to-orange-500 bg-clip-text text-transparent">
                الأخبار العاجلة
              </h3>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mr-2"
              >
                <Globe className="w-5 h-5 md:w-6 md:h-6 text-s3m-red" />
              </motion.div>
            </div>
            <div className="w-12 md:w-20 h-0.5 bg-gradient-to-r from-s3m-red to-orange-500 rounded-full mx-auto mb-3"></div>
            <p className="text-white/80 text-sm md:text-base font-medium px-2">
              تابع آخر أخبار وأحداث عالم S3M E-Sports
            </p>
          </motion.div>
        </div>
        
        {/* Professional Mobile News Container */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-black/95 to-gray-900/95 border border-s3m-red/30 backdrop-blur-sm shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/8 via-transparent to-purple-600/8"></div>
          
          {/* Enhanced News Scrolling Container */}
          <div className="relative py-4">
            <motion.div
              className="flex gap-3"
              animate={{ x: [0, "-25%"] }}
              transition={{
                duration: 60, // حركة أبطأ وأكثر احترافية - 60 ثانية
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop"
              }}
              style={{ 
                willChange: "transform",
                width: `${repeatedNews.length * 280}px`
              }}
            >
              {repeatedNews.map((newsItem, index) => (
                <motion.div
                  key={`${newsItem.id}-${index}`}
                  className="flex-shrink-0 w-64 md:w-72"
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="relative group h-full">
                    {/* Professional Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-s3m-red/30 to-purple-600/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    
                    {/* Enhanced News Card */}
                    <div className="relative bg-gradient-to-br from-gray-900/99 to-black/99 border border-s3m-red/40 rounded-lg overflow-hidden h-full shadow-lg group-hover:border-s3m-red/60 transition-all duration-200">
                      {/* News Image */}
                      {newsItem.image_url && (
                        <div className="aspect-video w-full overflow-hidden relative">
                          <img 
                            src={newsItem.image_url} 
                            alt={newsItem.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                          {/* News Badge */}
                          <div className="absolute top-2 right-2 bg-s3m-red/90 text-white text-xs px-2 py-1 rounded-full font-medium">
                            جديد
                          </div>
                        </div>
                      )}
                      
                      {/* Enhanced News Content */}
                      <div className="p-3">
                        <h4 className="text-sm md:text-base font-bold text-s3m-red mb-2 line-clamp-2 leading-tight">
                          {newsItem.title}
                        </h4>
                        <p className="text-white/80 text-xs md:text-sm mb-3 line-clamp-2 leading-relaxed">
                          {newsItem.description}
                        </p>
                        
                        {/* Professional News Meta */}
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(newsItem.created_at).toLocaleDateString('ar-SA')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-s3m-red font-medium text-xs">S3M</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Professional corner accent */}
                      <div className="absolute top-0 left-0 w-0 h-0 border-r-[25px] border-r-transparent border-t-[25px] border-t-s3m-red/15"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Professional Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black via-black/98 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black via-black/98 to-transparent z-10"></div>
        </div>
        
        {/* Enhanced View All News Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mt-6"
        >
          <Button 
            variant="outline"
            onClick={() => navigate('/news')}
            className="border border-s3m-red text-s3m-red hover:bg-gradient-to-r hover:from-s3m-red hover:to-red-600 hover:text-white hover:border-transparent rounded-lg transition-all duration-300 text-sm px-6 py-2 font-bold shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Newspaper className="w-4 h-4 ml-2" />
            المزيد من الأخبار
            <ArrowRight className="w-4 h-4 mr-2" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default MobileNewsSection;
