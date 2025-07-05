
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Zap, Users, UserPlus, Trash2 } from 'lucide-react';

interface LeaderboardEntry {
  name: string;
  points: number;
  rank: number;
}

const AILeaderboardManager = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<LeaderboardEntry[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const processImageMutation = useMutation({
    mutationFn: async (file: File) => {
      // تحويل الصورة إلى base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // إرسال الصورة للذكاء الاصطناعي لاستخراج البيانات
      const response = await fetch('/api/extract-leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok) {
        throw new Error('فشل في معالجة الصورة');
      }

      const data = await response.json();
      return data.leaderboard as LeaderboardEntry[];
    },
    onSuccess: (data) => {
      setExtractedData(data);
      toast({
        title: "تم استخراج البيانات بنجاح",
        description: `تم العثور على ${data.length} لاعب في الصورة`,
      });
    },
    onError: (error: any) => {
      console.error('Error processing image:', error);
      toast({
        title: "خطأ في معالجة الصورة",
        description: error.message || "حدث خطأ أثناء معالجة الصورة",
        variant: "destructive",
      });
    },
  });

  const updateLeaderboardMutation = useMutation({
    mutationFn: async (entries: LeaderboardEntry[]) => {
      const results = [];
      
      for (const entry of entries) {
        // البحث عن المستخدم بالاسم
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', `%${entry.name}%`)
          .maybeSingle();

        let userId = existingUser?.id;

        // إنشاء مستخدم جديد إذا لم يكن موجوداً
        if (!userId) {
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: `${entry.name.toLowerCase().replace(/\s+/g, '')}@temp.com`,
            password: Math.random().toString(36).slice(-8),
            user_metadata: {
              username: entry.name,
              full_name: entry.name,
              game_id: 'تم إنشاؤه بواسطة الذكاء الاصطناعي'
            }
          });

          if (createError) {
            console.error('Error creating user:', createError);
            continue;
          }

          userId = newUser.user?.id;
        }

        if (userId) {
          // تحديث نقاط اللاعب
          const { error: updateError } = await supabase
            .from('leaderboard_scores')
            .upsert({
              user_id: userId,
              points: entry.points,
              visible_in_leaderboard: true,
              last_updated: new Date().toISOString()
            });

          if (updateError) {
            console.error('Error updating leaderboard:', updateError);
          } else {
            results.push({ name: entry.name, success: true });
          }
        }
      }

      // تحديث الترتيب
      await supabase.rpc('update_leaderboard_rankings');
      
      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.success).length;
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      
      toast({
        title: "تم تحديث المتصدرين",
        description: `تم تحديث ${successful} لاعب بنجاح`,
      });
      
      setExtractedData([]);
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (error: any) => {
      console.error('Error updating leaderboard:', error);
      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تحديث المتصدرين",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يرجى اختيار صورة",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    
    // معاينة الصورة
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProcessImage = async () => {
    if (!imageFile) return;
    
    setIsProcessing(true);
    try {
      await processImageMutation.mutateAsync(imageFile);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateEntry = (index: number, field: 'name' | 'points', value: string | number) => {
    const updated = [...extractedData];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedData(updated);
  };

  const handleDeleteEntry = (index: number) => {
    const updated = extractedData.filter((_, i) => i !== index);
    setExtractedData(updated);
  };

  const handleApplyChanges = async () => {
    if (extractedData.length === 0) return;
    await updateLeaderboardMutation.mutateAsync(extractedData);
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="text-s3m-red flex items-center gap-2">
          <Zap className="w-5 h-5" />
          ترتيب المتصدرين بالذكاء الاصطناعي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* رفع الصورة */}
        <div className="space-y-4">
          <Label className="text-white">رفع صورة المتصدرين</Label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            {imagePreview ? (
              <div className="space-y-4">
                <img 
                  src={imagePreview} 
                  alt="معاينة" 
                  className="max-h-64 mx-auto rounded-lg"
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleProcessImage}
                    disabled={isProcessing}
                    className="bg-s3m-red hover:bg-red-600"
                  >
                    <Zap className="w-4 h-4 ml-2" />
                    {isProcessing ? 'جاري المعالجة...' : 'استخراج البيانات'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setExtractedData([]);
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">اسحب صورة المتصدرين هنا أو انقر للاختيار</p>
                <label>
                  <Button className="bg-s3m-red hover:bg-red-600" asChild>
                    <span>اختيار صورة</span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* البيانات المستخرجة */}
        {extractedData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                البيانات المستخرجة ({extractedData.length} لاعب)
              </h3>
              <Button
                onClick={handleApplyChanges}
                disabled={updateLeaderboardMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="w-4 h-4 ml-2" />
                {updateLeaderboardMutation.isPending ? 'جاري التطبيق...' : 'تطبيق التغييرات'}
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {extractedData.map((entry, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-4 flex items-center gap-4">
                  <div className="text-s3m-red font-bold text-lg min-w-[2rem]">
                    #{entry.rank}
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white text-sm">اسم اللاعب</Label>
                      <Input
                        value={entry.name}
                        onChange={(e) => handleUpdateEntry(index, 'name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm">النقاط</Label>
                      <Input
                        type="number"
                        value={entry.points}
                        onChange={(e) => handleUpdateEntry(index, 'points', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteEntry(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AILeaderboardManager;
