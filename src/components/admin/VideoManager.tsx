
import { useState } from 'react';
import { Upload, X, Play, Link, Youtube, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const VideoManager = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current video file
  const { data: currentVideoFile } = useQuery({
    queryKey: ['homepage-video-file'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'homepage_video_file')
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching video file:', error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error in video file query:', error);
        return null;
      }
    }
  });

  // Fetch current video URL
  const { data: currentVideoUrl } = useQuery({
    queryKey: ['homepage-video-url'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'homepage_trailer')
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching video URL:', error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error in video URL query:', error);
        return null;
      }
    }
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `trailer-${Date.now()}.${fileExt}`;
      
      // رفع الملف مع مراقبة التقدم
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('admin-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Clear any existing URL setting
      await supabase
        .from('site_settings')
        .update({ 
          value: null,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'homepage_trailer');

      const { data: existingRecord } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'homepage_video_file')
        .maybeSingle();

      if (existingRecord) {
        const { error: updateError } = await supabase
          .from('site_settings')
          .update({ 
            value: fileName,
            updated_at: new Date().toISOString()
          })
          .eq('key', 'homepage_video_file');

        if (updateError) throw updateError;
      } else {
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
      queryClient.invalidateQueries({ queryKey: ['homepage-video-file'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-video-url'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-trailer'] });
      setUploadProgress(0);
      toast({
        title: "تم الرفع بنجاح",
        description: "تم رفع الفيديو الدعائي بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Video upload error:', error);
      setUploadProgress(0);
      toast({
        title: "خطأ في الرفع",
        description: error.message || "حدث خطأ أثناء رفع الفيديو",
        variant: "destructive",
      });
    },
  });

  const saveVideoUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      try {
        console.log('Starting saveVideoUrlMutation with URL:', url);
        
        const { data: upsertData, error: upsertError } = await supabase
          .from('site_settings')
          .upsert({
            key: 'homepage_trailer',
            value: url,
            description: 'Video URL for homepage trailer',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'key'
          })
          .select();

        if (upsertError) {
          console.error('Upsert error:', upsertError);
          throw upsertError;
        }

        console.log('Upsert successful:', upsertData);

        await supabase
          .from('site_settings')
          .upsert({
            key: 'homepage_video_file',
            value: null,
            description: 'Uploaded video file for homepage trailer',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'key'
          });

        console.log('Video URL saved successfully');
        return url;
      } catch (error) {
        console.error('Error in saveVideoUrlMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('saveVideoUrlMutation success callback');
      queryClient.invalidateQueries({ queryKey: ['homepage-video-file'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-video-url'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-trailer'] });
      setVideoUrl('');
      setIsAddingUrl(false);
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ رابط الفيديو بنجاح",
      });
    },
    onError: (error: any) => {
      console.error('Video URL save error in onError:', error);
      toast({
        title: "خطأ في الحفظ",
        description: error.message || "حدث خطأ أثناء حفظ رابط الفيديو",
        variant: "destructive",
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async () => {
      if (currentVideoFile?.value) {
        const { error: deleteError } = await supabase.storage
          .from('admin-videos')
          .remove([currentVideoFile.value]);

        if (deleteError) throw deleteError;

        await supabase
          .from('site_settings')
          .update({ 
            value: null,
            updated_at: new Date().toISOString()
          })
          .eq('key', 'homepage_video_file');
      }

      if (currentVideoUrl?.value) {
        await supabase
          .from('site_settings')
          .update({ 
            value: null,
            updated_at: new Date().toISOString()
          })
          .eq('key', 'homepage_trailer');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-video-file'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-video-url'] });
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
        description: error.message || "حدث خطأ أثناء حذف الفيديو",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // تحقق من حجم الملف (900MB حد أقصى)
    const maxSize = 900 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "ملف كبير جداً",
        description: "يجب أن يكون حجم الملف أقل من 900 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('video/')) {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يرجى اختيار ملف فيديو",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // محاكاة شريط التقدم
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      await uploadVideoMutation.mutateAsync(file);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } finally {
      setUploading(false);
      clearInterval(progressInterval);
      event.target.value = '';
    }
  };

  const handleUrlSubmit = async () => {
    console.log('handleUrlSubmit called with URL:', videoUrl);
    
    if (!videoUrl.trim()) {
      toast({
        title: "رابط فارغ",
        description: "يرجى إدخال رابط الفيديو",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(videoUrl);
    } catch {
      toast({
        title: "رابط غير صحيح",
        description: "يرجى إدخال رابط صحيح",
        variant: "destructive",
      });
      return;
    }

    const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    const isInstagram = videoUrl.includes('instagram.com');
    
    if (!isYoutube && !isInstagram) {
      toast({
        title: "رابط غير مدعوم",
        description: "يرجى استخدام روابط YouTube أو Instagram فقط",
        variant: "destructive",
      });
      return;
    }

    console.log('Validation passed, calling mutation');
    try {
      await saveVideoUrlMutation.mutateAsync(videoUrl);
      console.log('Mutation completed successfully');
    } catch (error) {
      console.error('Error in handleUrlSubmit:', error);
    }
  };

  const getVideoFileUrl = () => {
    if (currentVideoFile?.value) {
      const { data } = supabase.storage
        .from('admin-videos')
        .getPublicUrl(currentVideoFile.value);
      return data.publicUrl;
    }
    return null;
  };

  const getCurrentVideoSource = () => {
    if (currentVideoFile?.value) {
      return { type: 'file', url: getVideoFileUrl() };
    }
    if (currentVideoUrl?.value) {
      return { type: 'url', url: currentVideoUrl.value };
    }
    return null;
  };

  const currentVideo = getCurrentVideoSource();

  const getVideoType = (url: string) => {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    return 'other';
  };

  const renderVideoPreview = () => {
    if (!currentVideo) return null;

    const videoType = getVideoType(currentVideo.url);

    return (
      <div className="space-y-4">
        <div className="relative rounded-lg overflow-hidden bg-black">
          {videoType === 'youtube' ? (
            <div className="aspect-video">
              <iframe
                src={currentVideo.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                className="w-full h-full"
                allowFullScreen
                title="YouTube Video"
              />
            </div>
          ) : videoType === 'instagram' ? (
            <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
              <div className="text-center text-white">
                <Instagram className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">فيديو Instagram</p>
                <a 
                  href={currentVideo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white underline"
                >
                  عرض على Instagram
                </a>
              </div>
            </div>
          ) : (
            <video
              src={currentVideo.url}
              controls
              className="w-full h-48 object-cover"
              preload="metadata"
            >
              <source src={currentVideo.url} type="video/mp4" />
            </video>
          )}
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
        </div>
      </div>
    );
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="text-s3m-red">إدارة الفيديو الدعائي</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentVideo ? (
          renderVideoPreview()
        ) : (
          <div className="text-center space-y-4">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8">
              <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">لا يوجد فيديو دعائي</p>
              
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    رفع ملف
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    رابط
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-white">
                        <span>جاري الرفع...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}
                  
                  <label>
                    <Button
                      disabled={uploading}
                      className="bg-s3m-red hover:bg-red-600 w-full"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4 ml-2" />
                        {uploading ? `جاري الرفع... ${Math.round(uploadProgress)}%` : 'رفع فيديو دعائي'}
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
                  <p className="text-sm text-gray-500 text-center">
                    الحد الأقصى: 900 ميجابايت • أنواع مدعومة: MP4, WebM, AVI
                  </p>
                </TabsContent>
                
                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="video-url" className="text-white">رابط الفيديو</Label>
                      <Input
                        id="video-url"
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=... أو https://www.instagram.com/p/..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="flex gap-2 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Youtube className="w-4 h-4 text-red-500" />
                        <span>YouTube</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Instagram className="w-4 h-4 text-pink-500" />
                        <span>Instagram</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleUrlSubmit}
                      disabled={saveVideoUrlMutation.isPending || !videoUrl.trim()}
                      className="bg-s3m-red hover:bg-red-600 w-full"
                    >
                      <Link className="w-4 h-4 ml-2" />
                      {saveVideoUrlMutation.isPending ? 'جاري الحفظ...' : 'حفظ الرابط'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoManager;
