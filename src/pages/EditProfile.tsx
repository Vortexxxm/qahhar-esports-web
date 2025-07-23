import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save, ArrowLeft } from 'lucide-react';

interface ProfileData {
  username: string;
  full_name: string;
  bio: string;
  game_id: string;
  phone_number: string;
  avatar_url: string;
  is_first_visit: boolean;
}

const EditProfile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    full_name: '',
    bio: '',
    game_id: '',
    phone_number: '',
    avatar_url: '',
    is_first_visit: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfileData({
        username: data.username || '',
        full_name: data.full_name || '',
        bio: data.bio || '',
        game_id: data.game_id || '',
        phone_number: data.phone_number || '',
        avatar_url: data.avatar_url || '',
        is_first_visit: data.is_first_visit ?? true
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // التحقق من الحقول المطلوبة
    if (!profileData.username.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "اسم المستخدم مطلوب",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      let avatarUrl = profileData.avatar_url;

      // رفع الصورة الشخصية إذا تم اختيارها
      if (avatarFile) {
        avatarUrl = await handleAvatarUpload(avatarFile);
      }

      // تحديث البروفايل
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profileData.username,
          full_name: profileData.full_name,
          bio: profileData.bio,
          game_id: profileData.game_id,
          phone_number: profileData.phone_number,
          avatar_url: avatarUrl,
          is_first_visit: false
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم تحديث ملفك الشخصي بنجاح",
      });

      // إذا كانت الزيارة الأولى، توجيه للصفحة الرئيسية
      if (profileData.is_first_visit) {
        navigate('/');
      } else {
        navigate('/profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث الملف الشخصي",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // عرض معاينة الصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar_url: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-s3m-red mx-auto mb-4"></div>
          <div className="text-white text-lg">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {!profileData.is_first_visit && (
          <Button
            onClick={() => navigate('/profile')}
            variant="ghost"
            className="mb-6 text-white hover:text-s3m-red"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للملف الشخصي
          </Button>
        )}

        <Card className="bg-gray-800/50 border-gray-700">
          <div className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {profileData.is_first_visit ? 'أهلاً وسهلاً! أكمل ملفك الشخصي' : 'تحرير الملف الشخصي'}
              </h1>
              <p className="text-gray-400">
                {profileData.is_first_visit 
                  ? 'يرجى إكمال المعلومات التالية لإنشاء ملفك الشخصي'
                  : 'يمكنك تعديل معلومات ملفك الشخصي هنا'
                }
              </p>
            </div>

            {/* صورة البروفايل */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-s3m-red/30">
                  <AvatarImage src={profileData.avatar_url} />
                  <AvatarFallback className="bg-gray-700 text-white text-2xl">
                    {profileData.username.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-2 -right-2 bg-s3m-red rounded-full p-2 cursor-pointer hover:bg-red-600 transition-colors">
                  <Upload className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-gray-400 text-sm mt-2">اضغط لتغيير الصورة الشخصية</p>
            </div>

            <div className="space-y-6">
              {/* اسم المستخدم */}
              <div>
                <Label htmlFor="username" className="text-white mb-2 flex items-center">
                  اسم المستخدم <span className="text-red-500 mr-1">*</span>
                </Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </div>

              {/* الاسم الكامل */}
              <div>
                <Label htmlFor="full_name" className="text-white mb-2">الاسم الكامل</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              {/* معرف اللعبة */}
              <div>
                <Label htmlFor="game_id" className="text-white mb-2">معرف اللعبة</Label>
                <Input
                  id="game_id"
                  value={profileData.game_id}
                  onChange={(e) => setProfileData(prev => ({ ...prev, game_id: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="أدخل معرف اللعبة الخاص بك"
                />
              </div>

              {/* رقم الهاتف */}
              <div>
                <Label htmlFor="phone_number" className="text-white mb-2">رقم الهاتف</Label>
                <Input
                  id="phone_number"
                  value={profileData.phone_number}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone_number: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="أدخل رقم هاتفك"
                />
              </div>

              {/* النبذة الشخصية */}
              <div>
                <Label htmlFor="bio" className="text-white mb-2">النبذة الشخصية</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                  placeholder="اكتب نبذة مختصرة عنك..."
                />
              </div>

              {/* أزرار الحفظ */}
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving || !profileData.username.trim()}
                  className="flex-1 bg-s3m-red hover:bg-red-600 text-white"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {profileData.is_first_visit ? 'إنشاء الملف الشخصي' : 'حفظ التغييرات'}
                </Button>
                
                {!profileData.is_first_visit && (
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    إلغاء
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;