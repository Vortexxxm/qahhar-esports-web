
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Trophy, Smile, Target, Upload, Star, Calendar } from "lucide-react";
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
  profiles?: {
    username: string;
    full_name: string | null;
  };
}

const GirlsHighlights = () => {
  const { user, userRole } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { data: highlights, isLoading } = useQuery({
    queryKey: ['girls-highlights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('girls_highlights')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name
          )
        `)
        .eq('is_approved', true)
        .order('is_monthly_winner', { ascending: false })
        .order('is_featured', { ascending: false })
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data as Highlight[];
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'kills':
        return <Target className="h-4 w-4" />;
      case 'funny':
        return <Smile className="h-4 w-4" />;
      case 'clutch':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'kills':
        return 'الكيلز';
      case 'funny':
        return 'اللحظات المضحكة';
      case 'clutch':
        return 'الكلاتش';
      default:
        return 'أخرى';
    }
  };

  const filteredHighlights = highlights?.filter(highlight => 
    activeCategory === 'all' || highlight.category === activeCategory
  ) || [];

  const monthlyWinners = highlights?.filter(h => h.is_monthly_winner) || [];
  const featuredHighlights = highlights?.filter(h => h.is_featured && !h.is_monthly_winner) || [];

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
          <Play className="h-6 w-6 text-pink-400" />
          S3M Girls Highlights
        </h2>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
          <Upload className="h-4 w-4 mr-2" />
          رفع لقطة
        </Button>
      </div>

      {/* Monthly Winners Section */}
      {monthlyWinners.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            أفضل لقطات الشهر
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {monthlyWinners.map((highlight) => (
              <Card key={highlight.id} className="gaming-card border-yellow-400/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-400">
                      <Star className="h-3 w-3 mr-1" />
                      فائزة الشهر
                    </Badge>
                    <Badge variant="outline" className="border-white/30 text-white/70">
                      {getCategoryIcon(highlight.category || '')}
                      <span className="mr-1">{getCategoryLabel(highlight.category || '')}</span>
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-lg">{highlight.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative aspect-video bg-black/30 rounded-lg overflow-hidden">
                    {highlight.thumbnail_url ? (
                      <img
                        src={highlight.thumbnail_url}
                        alt={highlight.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Play className="h-12 w-12 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  {highlight.description && (
                    <p className="text-white/70 text-sm">{highlight.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-white/60">
                    <span>{highlight.profiles?.full_name || highlight.profiles?.username}</span>
                    <span>{format(new Date(highlight.submitted_at || ''), 'PP', { locale: ar })}</span>
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
          <TabsTrigger value="kills">الكيلز</TabsTrigger>
          <TabsTrigger value="funny">مضحك</TabsTrigger>
          <TabsTrigger value="clutch">كلاتش</TabsTrigger>
          <TabsTrigger value="other">أخرى</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-0">
          {filteredHighlights.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredHighlights.map((highlight) => (
                <Card key={highlight.id} className="gaming-card hover:scale-105 transition-transform">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      {highlight.is_featured && (
                        <Badge className="bg-purple-500/20 text-purple-200 border-purple-400">
                          <Star className="h-3 w-3 mr-1" />
                          مميزة
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-white/30 text-white/70">
                        {getCategoryIcon(highlight.category || '')}
                        <span className="mr-1">{getCategoryLabel(highlight.category || '')}</span>
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg">{highlight.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative aspect-video bg-black/30 rounded-lg overflow-hidden">
                      {highlight.thumbnail_url ? (
                        <img
                          src={highlight.thumbnail_url}
                          alt={highlight.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Play className="h-12 w-12 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    
                    {highlight.description && (
                      <p className="text-white/70 text-sm">{highlight.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center text-sm text-white/60">
                      <span>{highlight.profiles?.full_name || highlight.profiles?.username}</span>
                      <span>{format(new Date(highlight.submitted_at || ''), 'PP', { locale: ar })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Play className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl text-white/60 mb-2">لا توجد لقطات في هذه الفئة</h3>
              <p className="text-white/40">كوني أول من يرفع لقطة!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GirlsHighlights;
