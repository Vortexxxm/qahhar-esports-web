import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, Upload, Star, Calendar, Trophy, Edit } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Highlight {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  is_approved: boolean | null;
  is_featured: boolean | null;
  is_monthly_winner: boolean | null;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
}

const GirlsHighlights = () => {
  const { userRole } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { data: highlights, isLoading } = useQuery({
    queryKey: ['girls-highlights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('girls_highlights')
        .select('*')
        .eq('is_approved', true)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching highlights:', error);
        throw error;
      }
      return data as Highlight[];
    },
  });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'clutch':
        return 'الكلاتش';
      case 'ace':
        return 'الآيس';
      case 'funny':
        return 'مضحك';
      default:
        return 'أخرى';
    }
  };

  const filteredHighlights = highlights?.filter(highlight => 
    activeCategory === 'all' || highlight.category === activeCategory
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
          <PlayCircle className="h-6 w-6 text-pink-400" />
          أبرز اللحظات
        </h2>
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            <Upload className="h-4 w-4 mr-2" />
            رفع مقطع
          </Button>
          {userRole === 'admin' && (
            <Button variant="outline" className="border-pink-400 text-pink-200 hover:bg-pink-500/20">
              <Edit className="h-4 w-4 mr-2" />
              إدارة المقاطع
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-4 bg-black/30 mb-6">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="clutch">الكلاتش</TabsTrigger>
          <TabsTrigger value="ace">الآيس</TabsTrigger>
          <TabsTrigger value="funny">مضحك</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-0">
          {filteredHighlights.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredHighlights.map((highlight) => (
                <Card key={highlight.id} className="gaming-card hover:scale-105 transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    {highlight.thumbnail_url ? (
                      <img
                        src={highlight.thumbnail_url}
                        alt={highlight.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                        <PlayCircle className="h-12 w-12 text-white/60" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button size="lg" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                        <PlayCircle className="h-6 w-6 mr-2" />
                        تشغيل
                      </Button>
                    </div>
                    
                    <div className="absolute top-2 right-2 flex gap-1">
                      {highlight.is_monthly_winner && (
                        <Badge className="bg-yellow-500/80 text-black">
                          <Trophy className="h-3 w-3 mr-1" />
                          فائز الشهر
                        </Badge>
                      )}
                      {highlight.is_featured && (
                        <Badge className="bg-purple-500/80 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          مميز
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{highlight.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(highlight.submitted_at || new Date()), 'PP', { locale: ar })}</span>
                    </div>
                  </CardHeader>
                  
                  {highlight.description && (
                    <CardContent>
                      <p className="text-white/80 text-sm">{highlight.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <PlayCircle className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl text-white/60 mb-2">لا توجد مقاطع في هذه الفئة</h3>
              <p className="text-white/40">كوني أول من يشارك أفضل لحظاتها!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GirlsHighlights;
