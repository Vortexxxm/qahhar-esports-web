
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, ArrowLeft } from "lucide-react";

interface NewsItem {
  id?: string;
  title: string;
  description: string;
  content: string | null;
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
  author_id?: string | null;
}

interface NewsEditorProps {
  news?: NewsItem | null;
  onClose: () => void;
}

const NewsEditor = ({ news, onClose }: NewsEditorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    image_url: ""
  });

  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title || "",
        description: news.description || "",
        content: news.content || "",
        image_url: news.image_url || ""
      });
      setImagePreview(news.image_url);
    }
  }, [news]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (news?.id) {
        const { error } = await supabase
          .from('news')
          .update({
            title: data.title,
            description: data.description,
            content: data.content,
            image_url: data.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', news.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('news')
          .insert({
            title: data.title,
            description: data.description,
            content: data.content,
            image_url: data.image_url,
            author_id: user?.id
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast({
        title: news?.id ? "تم التحديث" : "تم الإنشاء",
        description: news?.id ? "تم تحديث الخبر بنجاح" : "تم إنشاء الخبر بنجاح",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير",
        description: "يجب أن يكون حجم الصورة أقل من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `news-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      setImagePreview(publicUrl);

      toast({
        title: "تم رفع الصورة",
        description: "تم رفع صورة الخبر بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في رفع الصورة",
        description: error.message,
        variant: "destructive",
      });
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "حقول مطلوبة",
        description: "يرجى ملء العنوان والوصف",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-s3m-red">
            {news?.id ? "تعديل الخبر" : "إضافة خبر جديد"}
          </CardTitle>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-white">العنوان *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-black/20 border-s3m-red/30 text-white"
              placeholder="عنوان الخبر..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">الوصف المختصر *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-black/20 border-s3m-red/30 text-white min-h-[100px]"
              placeholder="وصف مختصر للخبر..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">المحتوى التفصيلي</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="bg-black/20 border-s3m-red/30 text-white min-h-[200px]"
              placeholder="المحتوى التفصيلي للخبر (اختياري)..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">صورة الخبر</Label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="news-image"
                disabled={uploading}
              />
              <label
                htmlFor="news-image"
                className="cursor-pointer bg-s3m-red hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                {uploading ? (
                  <>جاري الرفع...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    رفع صورة
                  </>
                )}
              </label>
              {formData.image_url && (
                <span className="text-green-400 text-sm">تم رفع الصورة بنجاح</span>
              )}
            </div>
            {imagePreview && (
              <div className="mt-4">
                <p className="text-white/60 text-sm mb-2">معاينة الصورة:</p>
                <img 
                  src={imagePreview} 
                  alt="معاينة الصورة"
                  className="w-full max-w-md rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
            >
              {saveMutation.isPending ? "جاري الحفظ..." : (news?.id ? "تحديث الخبر" : "إنشاء الخبر")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsEditor;
