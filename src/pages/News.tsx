
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Calendar, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type NewsItem = {
  id: string;
  title: string;
  description: string;
  content: string | null;
  image_url: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

const News = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    image_url: ""
  });

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
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('news-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['news'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createNewsMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('news')
        .insert({
          ...data,
          author_id: user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "تم نشر الخبر",
        description: "تم إضافة الخبر بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('news')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      setIsDialogOpen(false);
      setEditingNews(null);
      resetForm();
      toast({
        title: "تم تحديث الخبر",
        description: "تم تعديل الخبر بنجاح",
      });
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast({
        title: "تم حذف الخبر",
        description: "تم حذف الخبر بنجاح",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      image_url: ""
    });
  };

  const handleEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      description: newsItem.description,
      content: newsItem.content || "",
      image_url: newsItem.image_url || ""
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "خطأ",
        description: "العنوان والوصف مطلوبان",
        variant: "destructive",
      });
      return;
    }

    if (editingNews) {
      updateNewsMutation.mutate({ id: editingNews.id, data: formData });
    } else {
      createNewsMutation.mutate(formData);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
            آخر الأخبار
          </h1>
          <p className="text-xl text-white/70">تابع آخر أخبار وتحديثات فريق S3M</p>
          
          {userRole === 'admin' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="mt-6 bg-gradient-to-r from-s3m-red to-red-600"
                  onClick={() => {
                    setEditingNews(null);
                    resetForm();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة خبر جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="gaming-card max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-s3m-red">
                    {editingNews ? "تعديل الخبر" : "إضافة خبر جديد"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-white">العنوان</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                      placeholder="عنوان الخبر"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">الوصف المختصر</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                      placeholder="وصف مختصر للخبر"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">المحتوى الكامل</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                      placeholder="المحتوى التفصيلي للخبر"
                      rows={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">رابط الصورة</Label>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={createNewsMutation.isPending || updateNewsMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-s3m-red to-red-600"
                    >
                      {editingNews ? "تحديث الخبر" : "نشر الخبر"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-s3m-red/30"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* News Grid */}
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-white text-xl">جاري تحميل الأخبار...</div>
            </div>
          ) : news && news.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((newsItem) => (
                <Card key={newsItem.id} className="gaming-card overflow-hidden hover:scale-[1.02] transition-transform">
                  {newsItem.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={newsItem.image_url}
                        alt={newsItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="border-s3m-red/30 text-s3m-red">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(newsItem.created_at)}
                      </Badge>
                      {userRole === 'admin' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(newsItem)}
                            className="h-8 w-8 p-0 text-white hover:text-s3m-red"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNewsMutation.mutate(newsItem.id)}
                            className="h-8 w-8 p-0 text-white hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg text-white line-clamp-2">
                      {newsItem.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70 mb-4 line-clamp-3">
                      {newsItem.description}
                    </p>
                    {newsItem.content && (
                      <Button variant="outline" className="w-full border-s3m-red/30 text-s3m-red hover:bg-s3m-red hover:text-white">
                        قراءة المزيد
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">
                لا توجد أخبار حتى الآن
              </h3>
              <p className="text-white/50">
                تابعنا للحصول على آخر الأخبار والتحديثات
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;
