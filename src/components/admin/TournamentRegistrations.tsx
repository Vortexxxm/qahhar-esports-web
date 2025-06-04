
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";
import { CheckCircle, XCircle, Users, Mail, Phone, Calendar, Clock, FileText, Trash2 } from "lucide-react";

type TournamentRegistration = {
  id: string;
  tournament_id: string;
  leader_id: string;
  team_name: string;
  player_1_name: string;
  player_1_id: string;
  player_2_name: string | null;
  player_2_id: string | null;
  player_3_name: string | null;
  player_3_id: string | null;
  player_4_name: string | null;
  player_4_id: string | null;
  contact_email: string;
  contact_phone: string;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string | null;
  tournaments?: {
    title: string;
  };
};

const TournamentRegistrations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRegistration, setSelectedRegistration] = useState<TournamentRegistration | null>(null);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['tournament-registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournament_registrations')
        .select(`
          *,
          tournaments!inner(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TournamentRegistration[];
    },
  });

  const updateRegistrationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('tournament_registrations')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-registrations'] });
      toast({
        title: "تم تحديث الطلب",
        description: "تم تحديث حالة طلب المشاركة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRegistrationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tournament_registrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-registrations'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف طلب المشاركة بنجاح",
      });
      setSelectedRegistration(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    updateRegistrationMutation.mutate({ id, status });
  };

  const handleDeleteRegistration = (id: string) => {
    deleteRegistrationMutation.mutate(id);
  };

  const canDeleteRegistration = (createdAt: string) => {
    const daysSinceCreated = differenceInDays(new Date(), new Date(createdAt));
    return daysSinceCreated >= 1;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">قيد المراجعة</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">مقبول</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">مرفوض</Badge>;
      default:
        return null;
    }
  };

  const getPlayersList = (registration: TournamentRegistration) => {
    const players = [
      { name: registration.player_1_name, id: registration.player_1_id },
      registration.player_2_name ? { name: registration.player_2_name, id: registration.player_2_id } : null,
      registration.player_3_name ? { name: registration.player_3_name, id: registration.player_3_id } : null,
      registration.player_4_name ? { name: registration.player_4_name, id: registration.player_4_id } : null,
    ].filter(Boolean);

    return players;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-white">جاري تحميل طلبات المشاركة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedRegistration ? (
        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-s3m-red">تفاصيل طلب المشاركة</CardTitle>
            <div className="flex gap-2">
              {canDeleteRegistration(selectedRegistration.created_at) && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteRegistration(selectedRegistration.id)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف الطلب
                </Button>
              )}
              <Button
                variant="outline"
                className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white"
                onClick={() => setSelectedRegistration(null)}
              >
                عودة للقائمة
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-s3m-red" />
                  <div>
                    <p className="text-white/60 text-sm">اسم الفريق</p>
                    <p className="text-white font-semibold">{selectedRegistration.team_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-s3m-red" />
                  <div>
                    <p className="text-white/60 text-sm">البريد الإلكتروني</p>
                    <p className="text-white font-semibold">{selectedRegistration.contact_email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-s3m-red" />
                  <div>
                    <p className="text-white/60 text-sm">رقم الهاتف</p>
                    <p className="text-white font-semibold">{selectedRegistration.contact_phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-s3m-red" />
                  <div>
                    <p className="text-white/60 text-sm">تاريخ التسجيل</p>
                    <p className="text-white font-semibold">
                      {format(new Date(selectedRegistration.created_at), 'PPP', { locale: ar })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm">البطولة</p>
                  <p className="text-white font-semibold">{selectedRegistration.tournaments?.title}</p>
                </div>

                <div>
                  <p className="text-white/60 text-sm">أعضاء الفريق</p>
                  <div className="space-y-2">
                    {getPlayersList(selectedRegistration).map((player, index) => (
                      <div key={index} className="bg-black/20 p-2 rounded">
                        <p className="text-white text-sm">{player?.name}</p>
                        <p className="text-white/60 text-xs">{player?.id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {selectedRegistration.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-s3m-red" />
                  <p className="text-white/60">ملاحظات إضافية</p>
                </div>
                <p className="text-white bg-black/20 p-4 rounded-lg">{selectedRegistration.notes}</p>
              </div>
            )}

            {selectedRegistration.status === 'pending' && (
              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={() => handleUpdateStatus(selectedRegistration.id, 'approved')}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  قبول المشاركة
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleUpdateStatus(selectedRegistration.id, 'rejected')}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  رفض المشاركة
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {registrations?.map((registration) => (
            <Card 
              key={registration.id} 
              className={`gaming-card cursor-pointer transition-all hover:border-s3m-red/50 ${
                registration.status === 'pending' ? 'border-yellow-500/50' : ''
              }`}
              onClick={() => setSelectedRegistration(registration)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {registration.team_name}
                      </h3>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{registration.tournaments?.title}</span>
                        <span className="text-white/30">•</span>
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(registration.created_at), 'PPP', { locale: ar })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(registration.status)}
                    {canDeleteRegistration(registration.created_at) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRegistration(registration.id);
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!registrations || registrations.length === 0) && (
            <Card className="gaming-card">
              <CardContent className="p-6 text-center">
                <p className="text-white/60">لا توجد طلبات مشاركة حالياً</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentRegistrations;
