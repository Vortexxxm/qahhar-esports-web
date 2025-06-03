
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, ArrowLeft, Calendar } from "lucide-react";

interface Tournament {
  id?: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_teams: number;
  entry_requirements: string | null;
  prize_info: string | null;
  rules: string | null;
  image_url: string | null;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  created_by?: string | null;
}

interface TournamentEditorProps {
  tournament?: Tournament | null;
  onClose: () => void;
}

const TournamentEditor = ({ tournament, onClose }: TournamentEditorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    max_teams: 16,
    entry_requirements: "",
    prize_info: "",
    rules: "",
    image_url: "",
    status: "upcoming" as const
  });

  useEffect(() => {
    if (tournament) {
      setFormData({
        title: tournament.title || "",
        description: tournament.description || "",
        start_date: tournament.start_date ? new Date(tournament.start_date).toISOString().slice(0, 16) : "",
        end_date: tournament.end_date ? new Date(tournament.end_date).toISOString().slice(0, 16) : "",
        registration_deadline: tournament.registration_deadline ? new Date(tournament.registration_deadline).toISOString().slice(0, 16) : "",
        max_teams: tournament.max_teams || 16,
        entry_requirements: tournament.entry_requirements || "",
        prize_info: tournament.prize_info || "",
        rules: tournament.rules || "",
        image_url: tournament.image_url || "",
        status: tournament.status || "upcoming"
      });
    }
  }, [tournament]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (tournament?.id) {
        const { error } = await supabase
          .from('tournaments')
          .update({
            title: data.title,
            description: data.description,
            start_date: new Date(data.start_date).toISOString(),
            end_date: new Date(data.end_date).toISOString(),
            registration_deadline: new Date(data.registration_deadline).toISOString(),
            max_teams: data.max_teams,
            entry_requirements: data.entry_requirements,
            prize_info: data.prize_info,
            rules: data.rules,
            image_url: data.image_url,
            status: data.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', tournament.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tournaments')
          .insert({
            title: data.title,
            description: data.description,
            start_date: new Date(data.start_date).toISOString(),
            end_date: new Date(data.end_date).toISOString(),
            registration_deadline: new Date(data.registration_deadline).toISOString(),
            max_teams: data.max_teams,
            entry_requirements: data.entry_requirements,
            prize_info: data.prize_info,
            rules: data.rules,
            image_url: data.image_url,
            status: data.status,
            created_by: user?.id
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast({
        title: tournament?.id ? "تم التحديث" : "تم الإنشاء",
        description: tournament?.id ? "تم تحديث البطولة بنجاح" : "تم إنشاء البطولة بنجاح",
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `tournaments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));

      toast({
        title: "تم رفع الصورة",
        description: "تم رفع صورة البطولة بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في رفع الصورة",
        description: error.message,
        variant: "destructive",
      });
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
            {tournament?.id ? "تعديل البطولة" : "إضافة بطولة جديدة"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-white">عنوان البطولة *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-black/20 border-s3m-red/30 text-white"
                placeholder="اسم البطولة..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">عدد الفرق الأقصى</Label>
              <Input
                type="number"
                value={formData.max_teams}
                onChange={(e) => setFormData(prev => ({ ...prev, max_teams: parseInt(e.target.value) || 16 }))}
                className="bg-black/20 border-s3m-red/30 text-white"
                min="2"
                max="64"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">وصف البطولة *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-black/20 border-s3m-red/30 text-white min-h-[100px]"
              placeholder="وصف تفصيلي للبطولة..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-white">تاريخ البداية</Label>
              <Input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="bg-black/20 border-s3m-red/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">تاريخ النهاية</Label>
              <Input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="bg-black/20 border-s3m-red/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">آخر موعد للتسجيل</Label>
              <Input
                type="datetime-local"
                value={formData.registration_deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_deadline: e.target.value }))}
                className="bg-black/20 border-s3m-red/30 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">حالة البطولة</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">قادمة</SelectItem>
                <SelectItem value="active">نشطة</SelectItem>
                <SelectItem value="completed">مكتملة</SelectItem>
                <SelectItem value="cancelled">ملغية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">شروط المشاركة</Label>
            <Textarea
              value={formData.entry_requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, entry_requirements: e.target.value }))}
              className="bg-black/20 border-s3m-red/30 text-white min-h-[80px]"
              placeholder="شروط المشاركة في البطولة..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">معلومات الجوائز</Label>
            <Textarea
              value={formData.prize_info}
              onChange={(e) => setFormData(prev => ({ ...prev, prize_info: e.target.value }))}
              className="bg-black/20 border-s3m-red/30 text-white min-h-[80px]"
              placeholder="تفاصيل الجوائز والمكافآت..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">قوانين البطولة</Label>
            <Textarea
              value={formData.rules}
              onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
              className="bg-black/20 border-s3m-red/30 text-white min-h-[100px]"
              placeholder="قوانين وأحكام البطولة..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">صورة البطولة</Label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="tournament-image"
                disabled={uploading}
              />
              <label
                htmlFor="tournament-image"
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
            {formData.image_url && (
              <div className="mt-4">
                <img 
                  src={formData.image_url} 
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
              {saveMutation.isPending ? "جاري الحفظ..." : (tournament?.id ? "تحديث البطولة" : "إنشاء البطولة")}
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

export default TournamentEditor;
