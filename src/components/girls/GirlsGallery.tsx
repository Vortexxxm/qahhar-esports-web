import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Upload, Star, Calendar, User, Expand } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import ImageModal from "@/components/ImageModal";

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  uploaded_by: string | null;
  is_featured: boolean | null;
  uploaded_at: string;
  profiles?: {
    username: string;
    full_name: string | null;
  } | null;
}

const GirlsGallery = () => {
  const { user, userRole } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ['girls-gallery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('girls_gallery')
        .select(`
          *,
          profiles!girls_gallery_uploaded_by_fkey (
            username,
            full_name
          )
        `)
        .order('is_featured', { ascending: false })
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching gallery images:', error);
        throw error;
      }
      return data as GalleryImage[];
    },
  });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'group_photos':
        return 'صور جماعية';
      case 'room_screenshots':
        return 'لقطات من الرومات';
      case 'designs':
        return 'تصاميم';
      case 'fan_art':
        return 'رسومات المعجبات';
      default:
        return 'أخرى';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'group_photos':
        return 'bg-pink-500/20 text-pink-200 border-pink-400';
      case 'room_screenshots':
        return 'bg-blue-500/20 text-blue-200 border-blue-400';
      case 'designs':
        return 'bg-purple-500/20 text-purple-200 border-purple-400';
      case 'fan_art':
        return 'bg-green-500/20 text-green-200 border-green-400';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-400';
    }
  };

  const filteredImages = images?.filter(image => 
    activeCategory === 'all' || image.category === activeCategory
  ) || [];

  const featuredImages = images?.filter(img => img.is_featured) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Image className="h-6 w-6 text-pink-400" />
          جاليري الصور والذكريات
        </h2>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
          <Upload className="h-4 w-4 mr-2" />
          رفع صورة
        </Button>
      </div>

      {/* Featured Images */}
      {featuredImages.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            الصور المميزة
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredImages.map((image) => (
              <Card key={image.id} className="gaming-card border-yellow-400/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 overflow-hidden">
                <div className="relative aspect-square">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                    onClick={() => setSelectedImage(image.image_url)}
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 text-black hover:bg-white"
                      onClick={() => setSelectedImage(image.image_url)}
                    >
                      <Expand className="h-4 w-4 mr-1" />
                      عرض كامل
                    </Button>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-yellow-500/80 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    مميزة
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-semibold text-white text-sm mb-1">{image.title}</h4>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{image.profiles?.full_name || image.profiles?.username}</span>
                    <span>{format(new Date(image.uploaded_at), 'PP', { locale: ar })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-5 bg-black/30 mb-6">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="group_photos">جماعية</TabsTrigger>
          <TabsTrigger value="room_screenshots">الرومات</TabsTrigger>
          <TabsTrigger value="designs">تصاميم</TabsTrigger>
          <TabsTrigger value="fan_art">رسومات</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-0">
          {filteredImages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredImages.map((image) => (
                <Card key={image.id} className="gaming-card overflow-hidden hover:scale-105 transition-transform">
                  <div className="relative aspect-square">
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedImage(image.image_url)}
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 text-black hover:bg-white"
                        onClick={() => setSelectedImage(image.image_url)}
                      >
                        <Expand className="h-4 w-4" />
                      </Button>
                    </div>
                    {image.category && (
                      <Badge className={`absolute top-2 right-2 ${getCategoryColor(image.category)}`}>
                        {getCategoryLabel(image.category)}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-white text-sm mb-1">{image.title}</h4>
                    {image.description && (
                      <p className="text-white/70 text-xs mb-2 line-clamp-2">{image.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {image.profiles?.full_name || image.profiles?.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(image.uploaded_at), 'MM/dd', { locale: ar })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl text-white/60 mb-2">لا توجد صور في هذه الفئة</h3>
              <p className="text-white/40">كوني أول من يشارك صورها!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Image Modal */}
      <ImageModal 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
};

export default GirlsGallery;
