
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
import { Loader2, Trophy, Target, Users, Gamepad2, Edit, Phone, User, Mail, Upload, Save, X, AlertCircle, Heart, Star, Crown, Award } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Profile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Local state for form data
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    game_id: "",
    bio: "",
    phone_number: ""
  });
  
  // Local state for profile data
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
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
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

      const newAvatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setLocalProfileData(prev => prev ? {
        ...prev,
        profile: {
          ...prev.profile,
          avatar_url: newAvatarUrl
        }
      } : null);

      return newAvatarUrl;
    },
    onSuccess: (newAvatarUrl) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.refetchQueries({ queryKey: ['profile', user?.id] });
      
      queryClient.setQueryData(['profile', user?.id], (oldData: any) => {
        if (oldData?.profile) {
          return {
            ...oldData,
            profile: {
              ...oldData.profile,
              avatar_url: newAvatarUrl
            }
          };
        }
        return oldData;
      });

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
      const separator = avatarUrl.includes('?') ? '&' : '?';
      return `${avatarUrl}${separator}t=${Date.now()}&cache_bust=${Math.random()}`;
    }
    return null;
  };

  const isProfileIncomplete = (profile: any) => {
    if (!profile) return true;
    return !profile.full_name || !profile.game_id || !profile.bio || !profile.phone_number;
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

  const currentData = localProfileData || profileData;
  const profile = currentData?.profile || {
    username: user?.email?.split('@')[0] || 'مستخدم',
    full_name: '',
    game_id: '',
    bio: '',
    phone_number: '',
    avatar_url: null,
    total_likes: 0
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

  const profileIncomplete = isProfileIncomplete(profile);

  return (
    <div className="min-h-screen w-full">
      <div className="w-full max-w-none mx-auto px-4 py-8">
        {/* Welcome Message for New Users */}
        {profileIncomplete && !isEditing && (
          <Card className="gaming-card mb-8 border-s3m-red/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 sm:space-x-reverse">
                <AlertCircle className="h-6 w-6 text-s3m-red mb-2 sm:mb-0 sm:mt-0 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-s3m-red mb-2">مرحباً بك في S3M E-Sports!</h3>
                  <p className="text-white/80 mb-4">
                    يبدو أن هذه زيارتك الأولى. لتحصل على أفضل تجربة معنا، يرجى إكمال معلوماتك الشخصية.
                  </p>
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    إكمال الملف الشخصي
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Header Section with Likes */}
        <div className="relative w-full mb-8">
          <div 
            className="h-64 md:h-80 w-full rounded-2xl bg-cover bg-center relative overflow-hidden shadow-2xl"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(220,38,38,0.8), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-s3m-red/40 via-transparent to-black/60" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-8 md:space-x-reverse">
                  <div className="relative">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white/30 shadow-2xl backdrop-blur-sm">
                      <AvatarImage 
                        src={getAvatarUrl() || ""} 
                        key={getAvatarUrl() || 'no-avatar'}
                        onError={(e) => {
                          console.error('Avatar failed to load:', e);
                        }}
                      />
                      <AvatarFallback className="bg-s3m-red text-white text-3xl">
                        {(profile.username || profile.full_name || 'U').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-s3m-red rounded-full p-3 cursor-pointer hover:bg-red-600 transition-all duration-200 shadow-lg">
                      {uploading ? (
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      ) : (
                        <Upload className="h-5 w-5 text-white" />
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
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                      {profile.username || 'مستخدم جديد'}
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 mb-3 drop-shadow">
                      {profile.full_name || 'مرحباً بك في فريق S3M'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Badge className="bg-gradient-to-r from-s3m-red to-red-600 text-white px-4 py-2 text-sm font-bold shadow-lg">
                        <Trophy className="h-4 w-4 mr-2" />
                        {stats.points?.toLocaleString() || 0} نقطة
                      </Badge>
                      <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                        <Heart className="h-4 w-4 mr-2" />
                        {profile.total_likes || 0} إعجاب
                      </Badge>
                      {stats.rank_position && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                          <Crown className="h-4 w-4 mr-2" />
                          #{stats.rank_position}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                        size="sm"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 shadow-lg backdrop-blur-sm"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        إلغاء
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 shadow-lg"
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 w-full">
          {/* Enhanced Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="gaming-card text-center border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                <CardContent className="p-4">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white">{stats.wins || 0}</p>
                  <p className="text-sm text-white/60">الانتصارات</p>
                </CardContent>
              </Card>
              
              <Card className="gaming-card text-center border-red-500/20 bg-gradient-to-br from-red-500/10 to-pink-500/10">
                <CardContent className="p-4">
                  <Target className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white">{getKDRatio(stats.kills || 0, stats.deaths || 0)}</p>
                  <p className="text-sm text-white/60">نسبة K/D</p>
                </CardContent>
              </Card>
              
              <Card className="gaming-card text-center border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <CardContent className="p-4">
                  <Gamepad2 className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white">{stats.games_played || 0}</p>
                  <p className="text-sm text-white/60">الألعاب</p>
                </CardContent>
              </Card>
              
              <Card className="gaming-card text-center border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                <CardContent className="p-4">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white">{getWinRate(stats.wins || 0, stats.games_played || 0)}</p>
                  <p className="text-sm text-white/60">معدل الفوز</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Detailed Stats */}
            <Card className="gaming-card border-s3m-red/20 bg-gradient-to-br from-s3m-red/5 to-red-600/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-s3m-red text-xl flex items-center">
                  <Award className="h-6 w-6 mr-3" />
                  الإحصائيات التفصيلية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-white/80 flex items-center">
                        <Star className="h-4 w-4 mr-2 text-yellow-500" />
                        إجمالي النقاط:
                      </span>
                      <span className="text-s3m-red font-bold text-lg">{stats.points?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-white/80 flex items-center">
                        <Trophy className="h-4 w-4 mr-2 text-green-500" />
                        الانتصارات:
                      </span>
                      <span className="text-white font-bold text-lg">{stats.wins || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-white/80 flex items-center">
                        <X className="h-4 w-4 mr-2 text-red-500" />
                        الهزائم:
                      </span>
                      <span className="text-white font-bold text-lg">{stats.losses || 0}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-white/80 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-blue-500" />
                        القتلات:
                      </span>
                      <span className="text-white font-bold text-lg">{stats.kills || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-white/80 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-purple-500" />
                        الوفيات:
                      </span>
                      <span className="text-white font-bold text-lg">{stats.deaths || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                      <span className="text-white/80 flex items-center">
                        <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                        الترتيب:
                      </span>
                      <span className="text-s3m-red font-bold text-lg">#{stats.rank_position || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Profile Info */}
          <div className="space-y-6">
            <Card className="gaming-card border-s3m-red/20 bg-gradient-to-br from-s3m-red/5 to-red-600/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-s3m-red flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  المعلومات الشخصية
                  {profileIncomplete && (
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  )}
                </CardTitle>
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
                    <div className="flex items-center space-x-3 space-x-reverse p-3 bg-black/20 rounded-lg">
                      <User className="h-5 w-5 text-s3m-red flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-sm">اسم المستخدم</p>
                        <p className="text-white truncate">
                          {profile.username || (
                            <span className="text-white/40 italic">لم يتم تحديده بعد</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="flex items-center space-x-3 space-x-reverse p-3 bg-black/20 rounded-lg">
                      <User className="h-5 w-5 text-s3m-red flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-sm">الاسم الكامل</p>
                        <p className="text-white truncate">
                          {profile.full_name || (
                            <span className="text-white/40 italic">لم يتم تحديده بعد</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="flex items-center space-x-3 space-x-reverse p-3 bg-black/20 rounded-lg">
                      <Gamepad2 className="h-5 w-5 text-s3m-red flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-sm">معرف اللعبة</p>
                        <p className="text-white truncate">
                          {profile.game_id || (
                            <span className="text-white/40 italic">لم يتم تحديده بعد</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="flex items-center space-x-3 space-x-reverse p-3 bg-black/20 rounded-lg">
                      <Phone className="h-5 w-5 text-s3m-red flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-sm">رقم الهاتف</p>
                        <p className="text-white truncate">
                          {profile.phone_number || (
                            <span className="text-white/40 italic">لم يتم تحديده بعد</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />

                    <div className="flex items-center space-x-3 space-x-reverse p-3 bg-black/20 rounded-lg">
                      <Heart className="h-5 w-5 text-pink-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-sm">عدد الإعجابات</p>
                        <p className="text-pink-500 font-bold text-lg">{profile.total_likes || 0}</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="flex items-center space-x-3 space-x-reverse p-3 bg-black/20 rounded-lg">
                      <Mail className="h-5 w-5 text-s3m-red flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white/60 text-sm">البريد الإلكتروني</p>
                        <p className="text-white truncate">{user?.email || 'غير محدد'}</p>
                      </div>
                    </div>
                    
                    {(profile.bio || isEditing) && (
                      <>
                        <Separator className="bg-white/10" />
                        <div className="p-3 bg-black/20 rounded-lg">
                          <p className="text-white/60 text-sm mb-2">النبذة التعريفية</p>
                          <p className="text-white break-words">
                            {profile.bio || (
                              <span className="text-white/40 italic">لم يتم إضافة نبذة تعريفية بعد</span>
                            )}
                          </p>
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
