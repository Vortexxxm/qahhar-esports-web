
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trophy, Target, Users, Gamepad2, Edit, Phone, User, Mail, Upload } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Profile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    game_id: "",
    bio: "",
    phone_number: ""
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      const { data: statsData, error: statsError } = await supabase
        .from('leaderboard_scores')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (statsError) throw statsError;
      
      return {
        profile: profileData,
        stats: statsData
      };
    },
    enabled: !!user?.id,
  });
  
  useEffect(() => {
    if (profileData?.profile) {
      setFormData({
        full_name: profileData.profile.full_name || "",
        username: profileData.profile.username || "",
        game_id: profileData.profile.game_id || "",
        bio: profileData.profile.bio || "",
        phone_number: profileData.profile.phone_number || ""
      });
    }
  }, [profileData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      toast({
        title: "تم التحديث بنجاح",
        description: "تم حفظ معلوماتك الشخصية",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('User not found');
      
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "تم تحديث الصورة",
        description: "تم رفع صورتك الشخصية بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في رفع الصورة",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "حجم الملف كبير",
          description: "يجب أن يكون حجم الصورة أقل من 2 ميجابايت",
          variant: "destructive",
        });
        return;
      }
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const getKDRatio = (kills: number, deaths: number) => {
    if (deaths === 0) return kills > 0 ? kills.toFixed(1) : "0.0";
    return (kills / deaths).toFixed(1);
  };

  const getWinRate = (wins: number, gamesPlayed: number) => {
    if (gamesPlayed === 0) return "0%";
    return `${((wins / gamesPlayed) * 100).toFixed(1)}%`;
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-s3m-red" />
      </div>
    );
  }

  if (!user || !profileData) {
    return null;
  }

  const { profile, stats } = profileData;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header with Background Image */}
        <div className="relative mb-8">
          <div 
            className="h-64 rounded-lg bg-cover bg-center relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/20 to-red-600/20" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div className="flex items-end space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                    <AvatarImage src={profile.avatar_url || ""} />
                    <AvatarFallback className="bg-s3m-red text-white text-2xl">
                      {(profile.username || 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-s3m-red rounded-full p-2 cursor-pointer hover:bg-red-600 transition-colors">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 text-white" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </div>
                <div className="text-white mb-2">
                  <h1 className="text-3xl font-bold mb-1">{profile.username}</h1>
                  <p className="text-lg opacity-90">{profile.full_name}</p>
                  <Badge className="bg-gradient-to-r from-s3m-red to-red-600 mt-2">
                    {stats.points.toLocaleString()} نقطة
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 backdrop-blur text-white border border-white/30 hover:bg-white/30"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "إلغاء" : "تعديل"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="gaming-card text-center">
                <CardContent className="p-4">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.wins}</p>
                  <p className="text-sm text-white/60">الانتصارات</p>
                </CardContent>
              </Card>
              
              <Card className="gaming-card text-center">
                <CardContent className="p-4">
                  <Target className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{getKDRatio(stats.kills, stats.deaths)}</p>
                  <p className="text-sm text-white/60">نسبة K/D</p>
                </CardContent>
              </Card>
              
              <Card className="gaming-card text-center">
                <CardContent className="p-4">
                  <Gamepad2 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.games_played}</p>
                  <p className="text-sm text-white/60">الألعاب</p>
                </CardContent>
              </Card>
              
              <Card className="gaming-card text-center">
                <CardContent className="p-4">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{getWinRate(stats.wins, stats.games_played)}</p>
                  <p className="text-sm text-white/60">معدل الفوز</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Stats */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-s3m-red">الإحصائيات التفصيلية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-white/80">إجمالي النقاط:</span>
                      <span className="text-s3m-red font-bold">{stats.points.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">الانتصارات:</span>
                      <span className="text-white font-bold">{stats.wins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">الهزائم:</span>
                      <span className="text-white font-bold">{stats.losses}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-white/80">القتلات:</span>
                      <span className="text-white font-bold">{stats.kills}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">الوفيات:</span>
                      <span className="text-white font-bold">{stats.deaths}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">الترتيب:</span>
                      <span className="text-s3m-red font-bold">#{stats.rank_position || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-s3m-red">المعلومات الشخصية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-white">اسم المستخدم</Label>
                      <Input
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">الاسم الكامل</Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">معرف اللعبة</Label>
                      <Input
                        value={formData.game_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, game_id: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">رقم الهاتف</Label>
                      <Input
                        value={formData.phone_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">النبذة التعريفية</Label>
                      <Input
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                      />
                    </div>
                    <Button 
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="w-full bg-gradient-to-r from-s3m-red to-red-600"
                    >
                      {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-s3m-red" />
                      <div>
                        <p className="text-white/60 text-sm">اسم المستخدم</p>
                        <p className="text-white">{profile.username}</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="flex items-center space-x-3">
                      <Gamepad2 className="h-5 w-5 text-s3m-red" />
                      <div>
                        <p className="text-white/60 text-sm">معرف اللعبة</p>
                        <p className="text-white">{profile.game_id || 'غير محدد'}</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-s3m-red" />
                      <div>
                        <p className="text-white/60 text-sm">رقم الهاتف</p>
                        <p className="text-white">{profile.phone_number || 'غير محدد'}</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-s3m-red" />
                      <div>
                        <p className="text-white/60 text-sm">البريد الإلكتروني</p>
                        <p className="text-white">{user.email}</p>
                      </div>
                    </div>
                    
                    {profile.bio && (
                      <>
                        <Separator className="bg-white/10" />
                        <div>
                          <p className="text-white/60 text-sm mb-2">النبذة التعريفية</p>
                          <p className="text-white">{profile.bio}</p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
