
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar, Users, Trophy, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Tournaments = () => {
  const navigate = useNavigate();

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-500">قادمة</Badge>;
      case 'active':
        return <Badge className="bg-green-500">جارية</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500">منتهية</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-white">جاري تحميل البطولات...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
            البطولات
          </h1>
          <p className="text-white/70 text-lg">شارك في البطولات المثيرة واربح الجوائز</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments?.map((tournament) => (
            <Card key={tournament.id} className="gaming-card overflow-hidden">
              {tournament.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={tournament.image_url} 
                    alt={tournament.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-s3m-red leading-tight">{tournament.title}</CardTitle>
                  {getStatusBadge(tournament.status)}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(tournament.start_date), 'MMM dd', { locale: ar })}</span>
                  </div>
                  {tournament.max_teams && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{tournament.max_teams} فريق</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-white/80 mb-4 leading-relaxed line-clamp-3">
                  {tournament.description}
                </p>
                
                {tournament.prize_info && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-s3m-red font-semibold text-sm">الجوائز</span>
                    </div>
                    <p className="text-white/70 text-sm line-clamp-2">{tournament.prize_info}</p>
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">تاريخ البداية:</span>
                    <span className="text-white">{format(new Date(tournament.start_date), 'PPP', { locale: ar })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">آخر موعد للتسجيل:</span>
                    <span className="text-white">{format(new Date(tournament.registration_deadline), 'PPP', { locale: ar })}</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => navigate(`/tournaments/${tournament.id}`)}
                  className="w-full mt-4 bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  عرض التفاصيل والتسجيل
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {tournaments?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">لا توجد بطولات حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments;
