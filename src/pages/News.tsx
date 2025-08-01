
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import NewsCard from "@/components/NewsCard";
import NewsEditor from "@/components/admin/NewsEditor";
import ImageModal from "@/components/ImageModal";

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
  category?: string;
}

const News = () => {
  const { userRole } = useAuth();
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: news, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NewsItem[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });

  const handleEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setEditingNews(null);
    setShowEditor(false);
  };

  const handleAddNews = () => {
    setEditingNews(null);
    setShowEditor(true);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  if (showEditor) {
    return (
      <div className="min-h-screen py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <NewsEditor 
            news={editingNews} 
            onClose={handleCloseEditor}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
              أخبار الفريق
            </h1>
            <p className="text-white/70">آخر أخبار وتحديثات فريق S3M E-Sports</p>
          </div>
          
          {userRole === 'admin' && (
            <Button
              onClick={handleAddNews}
              className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
            >
              <Plus className="h-4 w-4 mr-2" />
              إضافة خبر
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-s3m-red"></div>
          </div>
        ) : news && news.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {news.map((item) => (
              <NewsCard 
                key={item.id} 
                news={item} 
                onEdit={userRole === 'admin' ? handleEdit : undefined}
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl text-white/60 mb-4">لا توجد أخبار متاحة حالياً</h3>
            <p className="text-white/40">سيتم إضافة الأخبار قريباً</p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
};

export default News;
