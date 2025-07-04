
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, Send } from "lucide-react";

interface FormData {
  full_name: string;
  email: string;
  phone_number: string;
  age: number;
  game_id: string;
  experience_level: string;
  preferred_role: string;
  play_hours_daily: string;
  commitment_level: string;
  can_attend_training: boolean;
  previous_teams: string;
  why_join: string;
  notes: string;
}

const GirlsJoinForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone_number: '',
    age: 0,
    game_id: '',
    experience_level: '',
    preferred_role: '',
    play_hours_daily: '',
    commitment_level: '',
    can_attend_training: true,
    previous_teams: '',
    why_join: '',
    notes: ''
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase
        .from('girls_join_requests')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "سيتم مراجعة طلبك والرد عليك في أقرب وقت ممكن",
      });
      setFormData({
        full_name: '',
        email: '',
        phone_number: '',
        age: 0,
        game_id: '',
        experience_level: '',
        preferred_role: '',
        play_hours_daily: '',
        commitment_level: '',
        can_attend_training: true,
        previous_teams: '',
        why_join: '',
        notes: ''
      });
      queryClient.invalidateQueries({ queryKey: ['join-requests'] });
    },
    onError: (error) => {
      console.error('Error submitting join request:', error);
      toast({
        title: "خطأ في إرسال الطلب",
        description: "حدث خطأ أثناء إرسال طلبك، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.full_name || !formData.email || !formData.phone_number || 
        !formData.age || !formData.game_id || !formData.why_join) {
      toast({
        title: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2 mb-4">
          <UserPlus className="h-6 w-6 text-pink-400" />
          انضمي إلى فريق البنات
        </h2>
        <p className="text-white/70">
          املئي النموذج أدناه للتقديم للانضمام إلى فريق البنات في S3M E-Sports
        </p>
      </div>

      <Card className="gaming-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-white text-center">نموذج طلب الانضمام</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name" className="text-white">الاسم الكامل *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                  placeholder="أدخلي اسمك الكامل"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone_number" className="text-white">رقم الهاتف *</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                  placeholder="05xxxxxxxx"
                  required
                />
              </div>
              <div>
                <Label htmlFor="age" className="text-white">العمر *</Label>
                <Input
                  id="age"
                  type="number"
                  min="16"
                  max="35"
                  value={formData.age || ''}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                  className="bg-black/30 border-white/20 text-white"
                  placeholder="18"
                  required
                />
              </div>
            </div>

            {/* Gaming Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="game_id" className="text-white">معرف اللعبة *</Label>
                <Input
                  id="game_id"
                  value={formData.game_id}
                  onChange={(e) => handleInputChange('game_id', e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                  placeholder="اسم المستخدم في اللعبة"
                  required
                />
              </div>
              <div>
                <Label className="text-white">مستوى الخبرة</Label>
                <Select onValueChange={(value) => handleInputChange('experience_level', value)}>
                  <SelectTrigger className="bg-black/30 border-white/20 text-white">
                    <SelectValue placeholder="اختاري مستوى خبرتك" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">مبتدئة</SelectItem>
                    <SelectItem value="intermediate">متوسطة</SelectItem>
                    <SelectItem value="advanced">متقدمة</SelectItem>
                    <SelectItem value="professional">محترفة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">الدور المفضل</Label>
                <Input
                  value={formData.preferred_role}
                  onChange={(e) => handleInputChange('preferred_role', e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                  placeholder="مثل: Duelist, Controller, ..."
                />
              </div>
              <div>
                <Label className="text-white">ساعات اللعب اليومية</Label>
                <Select onValueChange={(value) => handleInputChange('play_hours_daily', value)}>
                  <SelectTrigger className="bg-black/30 border-white/20 text-white">
                    <SelectValue placeholder="كم ساعة تلعبين يومياً؟" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1-2 ساعة</SelectItem>
                    <SelectItem value="3-4">3-4 ساعات</SelectItem>
                    <SelectItem value="5-6">5-6 ساعات</SelectItem>
                    <SelectItem value="7+">أكثر من 7 ساعات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-white">مستوى الالتزام</Label>
              <Select onValueChange={(value) => handleInputChange('commitment_level', value)}>
                <SelectTrigger className="bg-black/30 border-white/20 text-white">
                  <SelectValue placeholder="ما مدى التزامك؟" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">عادي</SelectItem>
                  <SelectItem value="semi_serious">جدي نوعاً ما</SelectItem>
                  <SelectItem value="serious">جدي</SelectItem>
                  <SelectItem value="professional">محترف</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="can_attend_training"
                checked={formData.can_attend_training}
                onCheckedChange={(checked) => handleInputChange('can_attend_training', !!checked)}
              />
              <Label htmlFor="can_attend_training" className="text-white">
                أستطيع حضور التدريبات المنتظمة
              </Label>
            </div>

            <div>
              <Label htmlFor="previous_teams" className="text-white">الفرق السابقة (اختياري)</Label>
              <Textarea
                id="previous_teams"
                value={formData.previous_teams}
                onChange={(e) => handleInputChange('previous_teams', e.target.value)}
                className="bg-black/30 border-white/20 text-white"
                placeholder="اذكري أي فرق سابقة لعبت معها..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="why_join" className="text-white">لماذا تريدين الانضمام؟ *</Label>
              <Textarea
                id="why_join"
                value={formData.why_join}
                onChange={(e) => handleInputChange('why_join', e.target.value)}
                className="bg-black/30 border-white/20 text-white"
                placeholder="أخبرينا عن دوافعك للانضمام إلى الفريق..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-white">ملاحظات إضافية</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="bg-black/30 border-white/20 text-white"
                placeholder="أي معلومات أخرى تودين إضافتها..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {submitMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {submitMutation.isPending ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GirlsJoinForm;
