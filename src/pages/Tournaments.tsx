
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, MapPin, Clock, Edit, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import TournamentEditor from "@/components/admin/TournamentEditor";

const Tournaments = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingTournament, setEditingTournament] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف البطولة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (tournament: any) => {
    setEditingTournament(tournament);
    setShowEditor(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه البطولة؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseEditor = () => {
    setEditingTournament(null);
    setShowEditor(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-500">قادمة</Badge>;
      case 'active':
        return <Badge className="bg-green-500">نشطة</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500">مكتملة</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">ملغية</Badge>;
      default:
        return <Badge className="bg-blue-500">قادمة</Badge>;
    }
  };

  const isAdmin = userRole === 'admin';

  if (showEditor) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <TournamentEditor 
            tournament={editingTournament} 
            onClose={handleCloseEditor}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
              البطولات والمنافسات
            </h1>
            <p className="text-white/70 text-lg">شارك في أقوى البطولات واربح جوائز مميزة</p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setShowEditor(true)}
              className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
            >
              <Plus className="h-5 w-5 mr-2" />
              إضافة بطولة جديدة
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-white/60">جاري تحميل البطولات...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tournaments?.map((tournament) => (
              <Card 
                key={tournament.id} 
                className="gaming-card hover:scale-105 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
              >
                {tournament.image_url && (
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={tournament.image_url} 
                      alt={tournament.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(tournament.status)}
                    </div>
                    {isAdmin && (
                      <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(tournament);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(tournament.id);
                          }}
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl text-white group-hover:text-s3m-red transition-colors">
                      {tournament.title}
                    </CardTitle>
                    {!tournament.image_url && (
                      <div className="flex gap-2">
                        {getStatusBadge(tournament.status)}
                        {isAdmin && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(tournament);
                              }}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(tournament.id);
                              }}
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-white/80 text-sm line-clamp-3">
                    {tournament.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-white/60">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(tournament.start_date), 'PPP', { locale: ar })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="h-4 w-4" />
                      <span>
                        آخر موعد للتسجيل: {format(new Date(tournament.registration_deadline), 'PPP', { locale: ar })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/60">
                      <Users className="h-4 w-4" />
                      <span>حتى {tournament.max_teams} فريق</span>
                    </div>
                  </div>
                  
                  {tournament.prize_info && (
                    <div className="flex items-center gap-2 text-s3m-red">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-medium">جوائز مميزة</span>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tournaments/${tournament.id}`);
                    }}
                  >
                    عرض التفاصيل
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
