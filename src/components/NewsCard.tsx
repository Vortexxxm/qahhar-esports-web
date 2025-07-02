
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Calendar, PlayCircle, Eye, EyeOff, Expand } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState, memo } from "react";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
  author_id: string | null;
}

interface NewsCardProps {
  news: NewsItem;
  onEdit?: (news: NewsItem) => void;
  onImageClick?: (imageUrl: string) => void;
}

const NewsCard = memo(({ news, onEdit, onImageClick }: NewsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (news.image_url && onImageClick) {
      onImageClick(news.image_url);
    }
  };

  return (
    <Card className="gaming-card hover:scale-105 transition-all duration-300 h-fit group">
      {(news.image_url || news.video_url) && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          {news.video_url ? (
            <div className="relative w-full h-full">
              <video
                className="w-full h-full object-cover"
                poster={news.image_url || undefined}
                controls
                preload="metadata"
              >
                <source src={news.video_url} type="video/mp4" />
                متصفحك لا يدعم تشغيل الفيديو
              </video>
              <div className="absolute top-2 right-2">
                <Badge className="bg-s3m-red/80 text-white">
                  <PlayCircle className="h-3 w-3 mr-1" />
                  فيديو
                </Badge>
              </div>
            </div>
          ) : news.image_url ? (
            <div className="relative w-full h-full group/image">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-t-lg" />
              )}
              <img 
                src={news.image_url} 
                alt={news.title}
                className={`w-full h-full object-cover cursor-pointer transition-all duration-300 hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={handleImageClick}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 text-black hover:bg-white"
                  onClick={handleImageClick}
                >
                  <Expand className="h-4 w-4 mr-1" />
                  عرض كامل
                </Button>
              </div>
            </div>
          ) : null}
          
          {onEdit && (
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                onClick={() => onEdit(news)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-white line-clamp-2 flex-1 leading-tight">
            {news.title}
          </CardTitle>
          {onEdit && !news.image_url && !news.video_url && (
            <Button
              size="sm"
              onClick={() => onEdit(news)}
              className="bg-blue-600 hover:bg-blue-700 ml-2 flex-shrink-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-white/60 mt-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>{format(new Date(news.created_at), 'PPP', { locale: ar })}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="prose prose-sm prose-invert max-w-none">
          <p className="text-white/80 text-sm leading-relaxed line-clamp-3 mb-3">
            {news.description}
          </p>
        </div>
        
        {news.content && (
          <div className="border-t border-white/10 pt-4">
            {isExpanded ? (
              <div className="text-white/90 text-sm space-y-3">
                <div 
                  dangerouslySetInnerHTML={{ __html: news.content }} 
                  className="prose prose-sm prose-invert max-w-none"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-s3m-red hover:text-red-400 p-0 h-auto font-medium"
                >
                  <EyeOff className="h-3 w-3 mr-1" />
                  عرض أقل
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-s3m-red hover:text-red-400 p-0 h-auto font-medium flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                اقرأ المزيد
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

NewsCard.displayName = 'NewsCard';

export default NewsCard;
