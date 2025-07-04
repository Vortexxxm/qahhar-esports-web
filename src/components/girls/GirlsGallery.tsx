import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Upload, Star, Calendar, Edit } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  description: string | null;
  category: string | null;
  is_featured: boolean | null;
  uploaded_at: string | null;
  uploaded_by: string | null;
}

const GirlsGallery = () => {
  const { userRole } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { data: images, isLoading } = useQuery({
    queryKey: ['girls-gallery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('girls_gallery')
        .select('*')
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
      case 'tournaments':
        return 'البطولات';
      case 'training':
        return 'التدريبات';
      case 'events':
        return 'الفعاليات';
      default:
        return 'أخرى';
    }
  };

  const filteredImages = images?.filter(image => 
    activeCategory === 'all' || image.category === activeCategory
  ) || [];

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
          <ImageIcon className="h-6 w-6 text-pink-400" />
          معرض الصور
        </h2>
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            <Upload className="h-4 w-4 mr-2" />
            رفع صورة
          </Button>
          {userRole === 'admin' && (
            <Button variant="outline" className="border-pink-400 text-pink-200 hover:bg-pink-500/20">
              <Edit className="h-4 w-4 mr-2" />
              إدارة المعرض
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-4 bg-black/30 mb-6">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="tournaments">البطولات</TabsTrigger>
          <TabsTrigger value="training">التدريبات</TabsTrigger>
          <TabsTrigger value="events">الفعاليات</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-0">
          {filteredImages.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredImages.map((image) => (
                <Card key={image.id} className="gaming-card hover:scale-105 transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-48 object-cover"
                    />
                    {image.is_featured && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500/80 text-black">
                        <Star className="h-3 w-3 mr-1" />
                        مميزة
                      </Badge>
                    )}
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{image.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(image.uploaded_at || new Date()), 'PP', { locale: ar })}</span>
                    </div>
                  </CardHeader>
                  
                  {image.description && (
                    <CardContent>
                      <p className="text-white/80 text-sm">{image.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl text-white/60 mb-2">لا توجد صور في هذه الفئة</h3>
              <p className="text-white/40">كوني أول من يشارك صورها!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GirlsGallery;
