
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Calendar, User, PlayCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";

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
}

const NewsCard = ({ news, onEdit }: NewsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="gaming-card hover:scale-105 transition-all duration-300 h-fit">
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
            <img 
              src={news.image_url} 
              alt={news.title}
              className="w-full h-full object-cover"
            />
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
          <CardTitle className="text-lg text-white line-clamp-2 flex-1">
            {news.title}
          </CardTitle>
          {onEdit && !news.image_url && !news.video_url && (
            <Button
              size="sm"
              onClick={() => onEdit(news)}
              className="bg-blue-600 hover:bg-blue-700 ml-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-white/60">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(news.created_at), 'PPP', { locale: ar })}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-white/80 text-sm line-clamp-3">
          {news.description}
        </p>
        
        {news.content && (
          <div>
            {isExpanded ? (
              <div className="text-white/90 text-sm space-y-2">
                <div dangerouslySetInnerHTML={{ __html: news.content }} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-s3m-red hover:text-red-400 p-0"
                >
                  عرض أقل
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-s3m-red hover:text-red-400 p-0 flex items-center gap-1"
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
};

export default NewsCard;
