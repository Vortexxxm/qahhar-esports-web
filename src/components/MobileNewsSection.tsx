
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
        {[...Array(10)].map((_, i) => (
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
      
      <div className="relative z-10 container mx-auto px-3">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="mr-3"
              >
                <Bell className="w-6 h-6 md:w-8 md:h-8 text-s3m-red" />
              </motion.div>
              <h3 className="text-xl md:text-3xl font-black bg-gradient-to-r from-s3m-red via-red-400 to-orange-500 bg-clip-text text-transparent">
                الأخبار المميزة
              </h3>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mr-3"
              >
                <Globe className="w-5 h-5 md:w-6 md:h-6 text-s3m-red" />
              </motion.div>
            </div>
            <div className="w-12 md:w-20 h-1 bg-gradient-to-r from-s3m-red to-orange-500 rounded-full mx-auto mb-3"></div>
            <p className="text-white/80 text-sm md:text-base font-medium px-4">آخر الأخبار والتطورات من عالم S3M E-Sports</p>
          </motion.div>
        </div>
        
        {/* Mobile News Container */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-black/80 to-gray-900/80 border border-s3m-red/40 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/10 via-transparent to-purple-600/10"></div>
          
          {/* News Scrolling Container */}
          <div className="relative py-4">
            <motion.div
              className="flex gap-3"
              animate={{ x: ["100%", "-100%"] }}
              transition={{
                duration: news.length * 6,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ 
                willChange: "transform",
                width: `${news.length * 280}px`
              }}
            >
              {[...news, ...news].map((newsItem, index) => (
                <motion.div
                  key={`${newsItem.id}-${index}`}
                  className="flex-shrink-0 w-64"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative group h-full">
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-s3m-red/40 to-purple-600/40 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* News Card */}
                    <div className="relative bg-gradient-to-br from-gray-900/95 to-black/95 border border-s3m-red/30 rounded-lg overflow-hidden h-full">
                      {/* News Image */}
                      {newsItem.image_url && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={newsItem.image_url} 
                            alt={newsItem.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                        </div>
                      )}
                      
                      {/* News Content */}
                      <div className="p-3">
                        <h4 className="text-sm font-bold text-s3m-red mb-2 line-clamp-2 leading-tight">
                          {newsItem.title}
                        </h4>
                        <p className="text-white/80 text-xs mb-3 line-clamp-3 leading-relaxed">
                          {newsItem.description}
                        </p>
                        
                        {/* News Meta */}
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(newsItem.created_at).toLocaleDateString('ar-SA')}</span>
                          </div>
                          {newsItem.author_id && (
                            <div className="flex items-center gap-1">
                              <span className="text-s3m-red">الإدارة</span>
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
          
          {/* Gradient overlays for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black via-black/90 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black via-black/90 to-transparent z-10"></div>
        </div>
        
        {/* View All News Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <Button 
            variant="outline"
            onClick={() => navigate('/news')}
            className="border-2 border-s3m-red text-s3m-red hover:bg-gradient-to-r hover:from-s3m-red hover:to-red-600 hover:text-white hover:border-transparent rounded-lg transition-all duration-300 text-sm px-6 py-2 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Newspaper className="w-4 h-4 ml-2" />
            جميع الأخبار
            <ArrowRight className="w-4 h-4 mr-2" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default MobileNewsSection;
