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
import { Loader2, Trophy, Target, Users, Gamepad2, Edit, Phone, User, Mail, Upload, Save, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Profile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Local state for form data - initialized with empty values
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    game_id: "",
    bio: "",
    phone_number: ""
  });
  
  // Local state for profile data to prevent disappearing
  const [localProfileData, setLocalProfileData] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const { data: profileData, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching profile data for user:', user.id);
      
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error('Profile error:', profileError);
        if (profileError.code === 'PGRST116') {
          // Create new profile if doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: user.email?.split('@')[0] || 'مستخدم',
              full_name: '',
              game_id: '',
              bio: '',
              phone_number: ''
            })
            .select()
            .single();
          
          if (createError) throw createError;
          
          // Also create leaderboard entry
          await supabase
            .from('leaderboard_scores')
            .insert({
              user_id: user.id,
              points: 0,
              wins: 0,
              losses: 0,
              kills: 0,
              deaths: 0,
              games_played: 0
            });
            
          return { profile: newProfile, stats: null };
        }
        throw profileError;
      }
      
      // Get stats data
      const { data: statsData, error: statsError } = await supabase
        .from('leaderboard_scores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (statsError) {
        console.error('Stats error:', statsError);
        // Don't throw error for stats, just log it
      }
      
      const result = {
        profile: profileData,
        stats: statsData || {
          points: 0,
          wins: 0,
          losses: 0,
          kills: 0,
          deaths: 0,
          games_played: 0,
          rank_position: null
        }
      };
      
      console.log('Profile data loaded:', result);
      return result;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 15, // Keep data fresh for 15 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  });
  
  // Update local state when profile data changes
  useEffect(() => {
    if (profileData) {
      console.log('Updating local profile data:', profileData);
      setLocalProfileData(profileData);
      
      if (profileData.profile) {
        setFormData({
          full_name: profileData.profile.full_name || "",
          username: profileData.profile.username || "",
          game_id: profileData.profile.game_id || "",
          bio: profileData.profile.bio || "",
          phone_number: profileData.profile.phone_number || ""
        });
      }
    }
  }, [profileData]);

  // Real-time subscription for profile updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_scores',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Stats updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.refetchQueries({ queryKey: ['profile', user?.id] });
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
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.refetchQueries({ queryKey: ['profile', user?.id] });
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
      if (file.size > 2 * 1024 * 1024) {
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

  // Helper functions
  const getKDRatio = (kills: number, deaths: number) => {
    if (deaths === 0) return kills > 0 ? kills.toFixed(1) : "0.0";
    return (kills / deaths).toFixed(1);
  };

  const getWinRate = (wins: number, gamesPlayed: number) => {
    if (gamesPlayed === 0) return "0%";
    return `${((wins / gamesPlayed) * 100).toFixed(1)}%`;
  };

  const getAvatarUrl = () => {
    const currentProfile = localProfileData?.profile || profileData?.profile;
    const avatarUrl = currentProfile?.avatar_url;
    if (avatarUrl && avatarUrl.trim() !== '') {
      const cleanUrl = avatarUrl.split('?')[0];
      const timestamp = Date.now();
      return `${cleanUrl}?t=${timestamp}&cache_bust=${Math.random()}`;
    }
    return null;
  };

  // Loading state
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-s3m-red" />
      </div>
    );
  }

  // Error state
  if (profileError && !localProfileData) {
    console.error('Profile error:', profileError);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <p>حدث خطأ في تحميل بيانات الملف الشخصي</p>
          <Button 
            onClick={() => queryClient.refetchQueries({ queryKey: ['profile', user?.id] })} 
            className="mt-4 bg-gradient-to-r from-s3m-red to-red-600"
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <p>لا يمكن تحميل بيانات الملف الشخصي</p>
          <Button 
            onClick={() => navigate('/login')} 
            className="mt-4 bg-gradient-to-r from-s3m-red to-red-600"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  // Use local data if available, fallback to fresh data
  const currentData = localProfileData || profileData;
  const profile = currentData?.profile || {
    username: user?.email?.split('@')[0] || 'مستخدم',
    full_name: '',
    game_id: '',
    bio: '',
    phone_number: '',
    avatar_url: null
  };

  const stats = currentData?.stats || {
    points: 0,
    wins: 0,
    losses: 0,
    kills: 0,
    deaths: 0,
    games_played: 0,
    rank_position: null
  };

  return (
    <div className="min-h-screen w-full">
      <div className="w-full max-w-none mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="relative w-full mb-8">
          <div 
            className="h-64 w-full rounded-xl bg-cover bg-center relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-s3m-red/30 to-red-600/30" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div className="flex items-end space-x-6 space-x-reverse">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                    <AvatarImage 
                      src={getAvatarUrl() || ""} 
                      key={getAvatarUrl()}
                    />
                    <AvatarFallback className="bg-s3m-red text-white text-2xl">
                      {(profile.username || profile.full_name || 'U').slice(0, 2).toUpperCase()}
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
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-1">
                    {profile.username || 'مستخدم'}
                  </h1>
                  <p className="text-lg opacity-90">
                    {profile.full_name || 'مرحباً بك'}
                  </p>
                  <Badge className="bg-gradient-to-r from-s3m-red to-red-600 mt-2">
                    {stats.points?.toLocaleString() || 0} نقطة
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      إلغاء
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 backdrop-blur text-white border border-white/30 hover:bg-white/30"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    تعديل
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* ... keep existing code (stats cards and detailed stats) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="gaming-card text-center">
                <CardContent className="p-4">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.wins || 0}</p>
                  <p className="text-sm text-white/60">الانتصارات</p>
                </CardContent>
              </Card>
              
              <Card className="gaming-card text-center">
                <CardContent className="p-4">
                  <Target className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{getKDRatio(stats.kills || 0, stats.deaths || 0)}</p>
                  <p className="text-sm text-white/60">نسبة K/D</p>
                </CardContent>
              </Card>
              
              <Card className="gaming-card text-center">
                <CardContent className="p-4">
                  <Gamepad2 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.games_played || 0}</p>
                  <p className="text-sm text-white/60">الألعاب</p>
                </CardContent>
              </Card>
              
              <Card className="gaming-card text-center">
                <CardContent className="p-4">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{getWinRate(stats.wins || 0, stats.games_played || 0)}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-white/80">إجمالي النقاط:</span>
                      <span className="text-s3m-red font-bold">{stats.points?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">الانتصارات:</span>
                      <span className="text-white font-bold">{stats.wins || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">الهزائم:</span>
                      <span className="text-white font-bold">{stats.losses || 0}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-white/80">القتلات:</span>
                      <span className="text-white font-bold">{stats.kills || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">الوفيات:</span>
                      <span className="text-white font-bold">{stats.deaths || 0}</span>
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
                        className="bg-black/20 border-s3m-red/30 text-white placeholder:text-white/40"
                        placeholder="أدخل اسم المستخدم"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">الاسم الكامل</Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white placeholder:text-white/40"
                        placeholder="أدخل الاسم الكامل"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">معرف اللعبة</Label>
                      <Input
                        value={formData.game_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, game_id: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white placeholder:text-white/40"
                        placeholder="أدخل معرف اللعبة"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">رقم الهاتف</Label>
                      <Input
                        value={formData.phone_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white placeholder:text-white/40"
                        placeholder="أدخل رقم الهاتف"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">النبذة التعريفية</Label>
                      <Input
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white placeholder:text-white/40"
                        placeholder="أدخل نبذة تعريفية"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <User className="h-5 w-5 text-s3m-red flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-sm">اسم المستخدم</p>
                        <p className="text-white truncate">{profile.username || 'غير محدد'}</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <User className="h-5 w-5 text-s3m-red flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-sm">الاسم الكامل</p>
                        <p className="text-white truncate">{profile.full_name || 'غير محدد'}</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Gamepad2 className="h-5 w-5 text-s3m-red flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-sm">معرف اللعبة</p>
                        <p className="text-white truncate">{profile.game_id || 'غير محدد'}</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Phone className="h-5 w-5 text-s3m-red flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-sm">رقم الهاتف</p>
                        <p className="text-white truncate">{profile.phone_number || 'غير محدد'}</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <Mail className="h-5 w-5 text-s3m-red flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-sm">البريد الإلكتروني</p>
                        <p className="text-white truncate">{user?.email || 'غير محدد'}</p>
                      </div>
                    </div>
                    
                    {profile.bio && (
                      <>
                        <Separator className="bg-white/10" />
                        <div>
                          <p className="text-white/60 text-sm mb-2">النبذة التعريفية</p>
                          <p className="text-white break-words">{profile.bio}</p>
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
