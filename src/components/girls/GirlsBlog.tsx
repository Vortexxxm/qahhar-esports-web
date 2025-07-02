import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Edit, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface BlogPost {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  category: string | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string | null;
  } | null;
}

const GirlsBlog = () => {
  const { user, userRole } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['girls-blog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('girls_blog')
        .select(`
          *,
          profiles!girls_blog_user_id_fkey (
            username,
            full_name
          )
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        throw error;
      }
      return data as BlogPost[];
    },
  });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'diary':
        return 'يوميات';
      case 'tips':
        return 'نصائح';
      case 'experience':
        return 'تجارب';
      default:
        return 'أخرى';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'diary':
        return 'bg-pink-500/20 text-pink-200 border-pink-400';
      case 'tips':
        return 'bg-blue-500/20 text-blue-200 border-blue-400';
      case 'experience':
        return 'bg-purple-500/20 text-purple-200 border-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-400';
    }
  };

  const filteredPosts = posts?.filter(post => 
    activeCategory === 'all' || post.category === activeCategory
  ) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-pink-400" />
          المدونة الداخلية
        </h2>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
          <Edit className="h-4 w-4 mr-2" />
          كتابة مقال جديد
        </Button>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-4 bg-black/30 mb-6">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="diary">يوميات</TabsTrigger>
          <TabsTrigger value="tips">نصائح</TabsTrigger>
          <TabsTrigger value="experience">تجارب</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-0">
          {filteredPosts.length > 0 ? (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="gaming-card hover:scale-102 transition-transform">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getCategoryColor(post.category || 'other')}>
                        {getCategoryLabel(post.category || 'other')}
                      </Badge>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.profiles?.full_name || post.profiles?.username}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.published_at || post.created_at), 'PP', { locale: ar })}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-white text-xl">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-invert max-w-none text-white/80"
                      dangerouslySetInnerHTML={{ __html: post.content.substring(0, 300) + (post.content.length > 300 ? '...' : '') }}
                    />
                    {post.content.length > 300 && (
                      <Button 
                        variant="link" 
                        className="text-pink-400 hover:text-pink-300 p-0 mt-3"
                      >
                        اقرأ المزيد
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl text-white/60 mb-2">لا توجد مقالات في هذه الفئة</h3>
              <p className="text-white/40">كوني أول من يشارك تجربتها!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GirlsBlog;
