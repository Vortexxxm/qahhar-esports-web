
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Play, Youtube, Instagram } from 'lucide-react';

const HomepageVideo = () => {
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
          return null;
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
          return null;
        }
        return data;
      } catch (error) {
        console.error('Error in video URL query:', error);
        return null;
      }
    }
  });

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

  if (!currentVideo) {
    return null;
  }

  const getVideoType = (url: string) => {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    return 'other';
  };

  const convertYouTubeUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const videoType = getVideoType(currentVideo.url);

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900/95 to-black/95 border border-s3m-red/30 shadow-2xl backdrop-blur-sm">
        <div className="p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-s3m-red to-red-400 bg-clip-text text-transparent">
            الفيديو الدعائي
          </h2>
          
          <div className="relative rounded-lg overflow-hidden bg-black">
            {videoType === 'youtube' ? (
              <div className="aspect-video">
                <iframe
                  src={convertYouTubeUrl(currentVideo.url)}
                  className="w-full h-full"
                  allowFullScreen
                  title="YouTube Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : videoType === 'instagram' ? (
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                <div className="text-center text-white">
                  <Instagram className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-xl font-bold mb-4">فيديو Instagram</p>
                  <a 
                    href={currentVideo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium"
                  >
                    <Play className="w-5 h-5" />
                    مشاهدة على Instagram
                  </a>
                </div>
              </div>
            ) : (
              <video
                src={currentVideo.url}
                controls
                autoPlay
                muted
                className="w-full aspect-video object-cover"
                preload="metadata"
              >
                <source src={currentVideo.url} type="video/mp4" />
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageVideo;
