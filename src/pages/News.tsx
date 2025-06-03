
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NewsCard from "@/components/NewsCard";
import NewsEditor from "@/components/admin/NewsEditor";
import { Plus } from "lucide-react";

const News = () => {
  const { userRole } = useAuth();
  const [editingNews, setEditingNews] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);

  const { data: news, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (newsItem: any) => {
    setEditingNews(newsItem);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setEditingNews(null);
    setShowEditor(false);
  };

  const isAdmin = userRole === 'admin';

  if (showEditor) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <NewsEditor 
            news={editingNews} 
            onClose={handleCloseEditor}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
              الأخبار والتحديثات
            </h1>
            <p className="text-white/70 text-lg">آخر أخبار الفريق والبطولات</p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setShowEditor(true)}
              className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
            >
              <Plus className="h-5 w-5 mr-2" />
              إضافة خبر جديد
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-white/60">جاري تحميل الأخبار...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news?.map((item) => (
              <NewsCard 
                key={item.id} 
                news={item} 
                onEdit={isAdmin ? handleEdit : undefined}
              />
            ))}
          </div>
        )}

        {news?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">لا توجد أخبار حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
