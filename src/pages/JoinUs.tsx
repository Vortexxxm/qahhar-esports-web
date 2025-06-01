import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const JoinUs = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    gameId: "",
    phoneNumber: "",
    age: "",
    rank: "",
    experience: "",
    availableHours: "",
    whyJoin: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if user is logged in
      if (!user) {
        toast({
          title: "يجب تسجيل الدخول أولاً",
          description: "قم بتسجيل الدخول أو إنشاء حساب جديد للتقديم",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Submit join request
      const { error } = await supabase
        .from('join_requests')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          game_id: formData.gameId,
          phone_number: formData.phoneNumber,
          age: parseInt(formData.age),
          rank: formData.rank,
          experience: formData.experience,
          available_hours: formData.availableHours,
          why_join: formData.whyJoin,
          status: 'new'
        });

      if (error) throw error;

      toast({
        title: "تم إرسال طلبك بنجاح!",
        description: "سنقوم بمراجعة طلبك والتواصل معك قريباً",
      });

      // Reset form
      setFormData({
        fullName: "",
        gameId: "",
        phoneNumber: "",
        age: "",
        rank: "",
        experience: "",
        availableHours: "",
        whyJoin: "",
      });

    } catch (error: any) {
      toast({
        title: "خطأ في إرسال الطلب",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-2xl text-s3m-red text-center">طلب الانضمام للفريق</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">الاسم الكامل *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gameId" className="text-white">معرف Free Fire (UID) *</Label>
                    <Input
                      id="gameId"
                      value={formData.gameId}
                      onChange={(e) => handleInputChange("gameId", e.target.value)}
                      className="bg-black/20 border-s3m-red/30 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-white">رقم الهاتف *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className="bg-black/20 border-s3m-red/30 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-white">العمر *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="bg-black/20 border-s3m-red/30 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rank" className="text-white">الرانك الحالي *</Label>
                    <Select value={formData.rank} onValueChange={(value) => handleInputChange("rank", value)} required>
                      <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
                        <SelectValue placeholder="اختر رانكك" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-s3m-red/30">
                        <SelectItem value="bronze">برونز</SelectItem>
                        <SelectItem value="silver">فضي</SelectItem>
                        <SelectItem value="gold">ذهبي</SelectItem>
                        <SelectItem value="platinum">بلاتيني</SelectItem>
                        <SelectItem value="diamond">ديامند</SelectItem>
                        <SelectItem value="master">ماستر</SelectItem>
                        <SelectItem value="grandmaster">جراند ماستر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-white">الخبرة في Free Fire *</Label>
                    <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)} required>
                      <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
                        <SelectValue placeholder="اختر مستوى خبرتك" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-s3m-red/30">
                        <SelectItem value="less-than-1">أقل من سنة</SelectItem>
                        <SelectItem value="1-2">1-2 سنة</SelectItem>
                        <SelectItem value="2-3">2-3 سنوات</SelectItem>
                        <SelectItem value="3-5">3-5 سنوات</SelectItem>
                        <SelectItem value="more-than-5">أكثر من 5 سنوات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availableHours" className="text-white">ساعات التفرغ اليومية *</Label>
                    <Select value={formData.availableHours} onValueChange={(value) => handleInputChange("availableHours", value)} required>
                      <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
                        <SelectValue placeholder="كم ساعة متاح يومياً؟" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-s3m-red/30">
                        <SelectItem value="1-2">1-2 ساعة</SelectItem>
                        <SelectItem value="3-4">3-4 ساعات</SelectItem>
                        <SelectItem value="5-6">5-6 ساعات</SelectItem>
                        <SelectItem value="more-than-6">أكثر من 6 ساعات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whyJoin" className="text-white">لماذا تريد الانضمام إلى S3M؟ *</Label>
                  <Textarea
                    id="whyJoin"
                    value={formData.whyJoin}
                    onChange={(e) => handleInputChange("whyJoin", e.target.value)}
                    className="bg-black/20 border-s3m-red/30 text-white min-h-[120px]"
                    placeholder="اكتب هنا دوافعك وأهدافك..."
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "جاري إرسال الطلب..." : "إرسال طلب الانضمام"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JoinUs;