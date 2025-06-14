
import { useState } from 'react';
import { Upload, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const VideoManager = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current video
  const { data: currentVideo } = useQuery({
    queryKey: ['homepage-video'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'homepage_video_file')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `trailer-${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('admin-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Check if record exists first
      const { data: existingRecord } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'homepage_video_file')
        .maybeSingle();

      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('site_settings')
          .update({ 
            value: fileName,
            updated_at: new Date().toISOString()
          })
          .eq('key', 'homepage_video_file');

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('site_settings')
          .insert({
            key: 'homepage_video_file',
            value: fileName,
            description: 'Uploaded video file for homepage trailer'
          });

        if (insertError) throw insertError;
      }

      return uploadData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-video'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-trailer'] });
      toast({
        title: "تم الرفع بنجاح",
        description: "تم رفع الفيديو الدعائي بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Video upload error:', error);
      toast({
        title: "خطأ في الرفع",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async () => {
      if (currentVideo?.value) {
        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from('admin-videos')
          .remove([currentVideo.value]);

        if (deleteError) throw deleteError;
      }

      // Remove from settings
      const { error: settingsError } = await supabase
        .from('site_settings')
        .update({ 
          value: null,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'homepage_video_file');

      if (settingsError) throw settingsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-video'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-trailer'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الفيديو الدعائي بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Video delete error:', error);
      toast({
        title: "خطأ في الحذف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (900MB limit)
    const maxSize = 900 * 1024 * 1024; // 900MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "ملف كبير جداً",
        description: "يجب أن يكون حجم الملف أقل من 900 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يرجى اختيار ملف فيديو",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await uploadVideoMutation.mutateAsync(file);
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const getVideoUrl = () => {
    if (currentVideo?.value) {
      const { data } = supabase.storage
        .from('admin-videos')
        .getPublicUrl(currentVideo.value);
      return data.publicUrl;
    }
    return null;
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="text-s3m-red">إدارة الفيديو الدعائي</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentVideo?.value ? (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                src={getVideoUrl()!}
                controls
                className="w-full h-48 object-cover"
                preload="metadata"
              >
                <source src={getVideoUrl()!} type="video/mp4" />
              </video>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => deleteVideoMutation.mutate()}
                variant="destructive"
                disabled={deleteVideoMutation.isPending}
                className="flex-1"
              >
                <X className="w-4 h-4 ml-2" />
                حذف الفيديو
              </Button>
              
              <label className="flex-1">
                <Button
                  disabled={uploading}
                  className="w-full bg-s3m-red hover:bg-red-600"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 ml-2" />
                    استبدال الفيديو
                  </span>
                </Button>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8">
              <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">لا يوجد فيديو دعائي</p>
              
              <label>
                <Button
                  disabled={uploading}
                  className="bg-s3m-red hover:bg-red-600"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 ml-2" />
                    {uploading ? 'جاري الرفع...' : 'رفع فيديو دعائي'}
                  </span>
                </Button>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            
            <p className="text-sm text-gray-500">
              الحد الأقصى: 900 ميجابايت • أنواع مدعومة: MP4, WebM, AVI
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoManager;
