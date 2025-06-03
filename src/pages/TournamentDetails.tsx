
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar, Users, Trophy, Upload, ArrowLeft } from "lucide-react";

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "",
    player1Name: "",
    player1Id: "",
    player2Name: "",
    player2Id: "",
    player3Name: "",
    player3Id: "",
    player4Name: "",
    player4Id: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
    imageUrl: ""
  });

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: existingRegistration } = useQuery({
    queryKey: ['tournament-registration', id, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('tournament_id', id)
        .eq('leader_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user?.id,
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('يجب تسجيل الدخول أولاً');

      const { error } = await supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: id,
          leader_id: user.id,
          team_name: data.teamName,
          player_1_name: data.player1Name,
          player_1_id: data.player1Id,
          player_2_name: data.player2Name || null,
          player_2_id: data.player2Id || null,
          player_3_name: data.player3Name || null,
          player_3_id: data.player3Id || null,
          player_4_name: data.player4Name || null,
          player_4_id: data.player4Id || null,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone,
          notes: data.notes || null,
          image_url: data.imageUrl || null,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم تسجيل الطلب بنجاح!",
        description: "سيتم مراجعة طلبك والرد عليك قريباً",
      });
      setShowRegistrationForm(false);
      setFormData({
        teamName: "",
        player1Name: "",
        player1Id: "",
        player2Name: "",
        player2Id: "",
        player3Name: "",
        player3Id: "",
        player4Name: "",
        player4Id: "",
        contactEmail: "",
        contactPhone: "",
        notes: "",
        imageUrl: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التسجيل",
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
      const filePath = `tournament-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tournament-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tournament-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));

      toast({
        title: "تم رفع الصورة",
        description: "تم رفع صورة الفريق بنجاح",
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
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "قم بتسجيل الدخول أولاً للتسجيل في البطولة",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    registerMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-white">جاري تحميل تفاصيل البطولة...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-white">البطولة غير موجودة</div>
      </div>
    );
  }

  const isRegistrationOpen = new Date() < new Date(tournament.registration_deadline);
  const hasRegistered = !!existingRegistration;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          onClick={() => navigate('/tournaments')}
          className="mb-6 bg-white/10 hover:bg-white/20 text-white border border-white/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة للبطولات
        </Button>

        <Card className="gaming-card mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-s3m-red mb-2">{tournament.title}</CardTitle>
                <Badge className={`${tournament.status === 'upcoming' ? 'bg-blue-500' : 
                                   tournament.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}>
                  {tournament.status === 'upcoming' ? 'قادمة' : 
                   tournament.status === 'active' ? 'جارية' : 'منتهية'}
                </Badge>
              </div>
              {tournament.image_url && (
                <img 
                  src={tournament.image_url} 
                  alt={tournament.title}
                  className="w-32 h-24 object-cover rounded-lg"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-white/80 text-lg">{tournament.description}</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-s3m-red" />
                  <div>
                    <p className="text-white/60 text-sm">تاريخ البداية</p>
                    <p className="text-white">{format(new Date(tournament.start_date), 'PPP', { locale: ar })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-s3m-red" />
                  <div>
                    <p className="text-white/60 text-sm">تاريخ النهاية</p>
                    <p className="text-white">{format(new Date(tournament.end_date), 'PPP', { locale: ar })}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-s3m-red" />
                  <div>
                    <p className="text-white/60 text-sm">الحد الأقصى للفرق</p>
                    <p className="text-white">{tournament.max_teams || 'غير محدد'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-s3m-red" />
                  <div>
                    <p className="text-white/60 text-sm">آخر موعد للتسجيل</p>
                    <p className="text-white">{format(new Date(tournament.registration_deadline), 'PPP', { locale: ar })}</p>
                  </div>
                </div>
              </div>
            </div>

            {tournament.prize_info && (
              <div>
                <h3 className="text-s3m-red font-semibold mb-2 flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  الجوائز
                </h3>
                <p className="text-white/80">{tournament.prize_info}</p>
              </div>
            )}

            {tournament.entry_requirements && (
              <div>
                <h3 className="text-s3m-red font-semibold mb-2">شروط المشاركة</h3>
                <p className="text-white/80">{tournament.entry_requirements}</p>
              </div>
            )}

            {tournament.rules && (
              <div>
                <h3 className="text-s3m-red font-semibold mb-2">القوانين</h3>
                <p className="text-white/80">{tournament.rules}</p>
              </div>
            )}

            <div className="flex gap-4">
              {hasRegistered ? (
                <div className="text-center">
                  <Badge className="bg-green-500 text-lg py-2 px-4">
                    تم التسجيل مسبقاً - الحالة: {existingRegistration.status === 'pending' ? 'قيد الانتظار' : 
                                                  existingRegistration.status === 'approved' ? 'مقبول' : 'مرفوض'}
                  </Badge>
                </div>
              ) : isRegistrationOpen ? (
                <Button
                  onClick={() => setShowRegistrationForm(true)}
                  className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
                >
                  التسجيل في البطولة
                </Button>
              ) : (
                <Badge className="bg-gray-500 text-lg py-2 px-4">
                  انتهى موعد التسجيل
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {showRegistrationForm && (
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-s3m-red">تسجيل مشاركة جديدة</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white">اسم الفريق *</Label>
                  <Input
                    value={formData.teamName}
                    onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">اسم اللاعب الأول (القائد) *</Label>
                    <Input
                      value={formData.player1Name}
                      onChange={(e) => setFormData(prev => ({ ...prev, player1Name: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">معرف اللاعب الأول *</Label>
                    <Input
                      value={formData.player1Id}
                      onChange={(e) => setFormData(prev => ({ ...prev, player1Id: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">اسم اللاعب الثاني</Label>
                    <Input
                      value={formData.player2Name}
                      onChange={(e) => setFormData(prev => ({ ...prev, player2Name: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">معرف اللاعب الثاني</Label>
                    <Input
                      value={formData.player2Id}
                      onChange={(e) => setFormData(prev => ({ ...prev, player2Id: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">اسم اللاعب الثالث</Label>
                    <Input
                      value={formData.player3Name}
                      onChange={(e) => setFormData(prev => ({ ...prev, player3Name: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">معرف اللاعب الثالث</Label>
                    <Input
                      value={formData.player3Id}
                      onChange={(e) => setFormData(prev => ({ ...prev, player3Id: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">اسم اللاعب الرابع</Label>
                    <Input
                      value={formData.player4Name}
                      onChange={(e) => setFormData(prev => ({ ...prev, player4Name: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">معرف اللاعب الرابع</Label>
                    <Input
                      value={formData.player4Id}
                      onChange={(e) => setFormData(prev => ({ ...prev, player4Id: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">البريد الإلكتروني للتواصل *</Label>
                    <Input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">رقم الهاتف للتواصل *</Label>
                    <Input
                      value={formData.contactPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      className="bg-black/20 border-s3m-red/30 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">صورة الفريق (اختيارية)</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="team-image"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="team-image"
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
                    {formData.imageUrl && (
                      <span className="text-green-400 text-sm">تم رفع الصورة بنجاح</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">ملاحظات إضافية</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="bg-black/20 border-s3m-red/30 text-white min-h-[100px]"
                    placeholder="أي ملاحظات أو معلومات إضافية تود إضافتها..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
                  >
                    {registerMutation.isPending ? "جاري التسجيل..." : "تسجيل المشاركة"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRegistrationForm(false)}
                    className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TournamentDetails;
