
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CheckCircle, XCircle, Users, Phone, Mail, Calendar, Eye, Image } from "lucide-react";

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
  image_url: string | null;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string | null;
  tournaments: {
    title: string;
  } | null;
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
          tournaments (
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TournamentRegistration[];
    },
  });

  const updateStatusMutation = useMutation({
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

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-blue-500">قيد الانتظار</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">مقبول</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">مرفوض</Badge>;
      default:
        return null;
    }
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
            <Button
              variant="outline"
              className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white"
              onClick={() => setSelectedRegistration(null)}
            >
              عودة للقائمة
            </Button>
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
                  <p className="text-white/60 text-sm">الحالة</p>
                  {getStatusBadge(selectedRegistration.status)}
                </div>

                {selectedRegistration.image_url && (
                  <div>
                    <p className="text-white/60 text-sm mb-2">صورة الفريق</p>
                    <img 
                      src={selectedRegistration.image_url} 
                      alt="صورة الفريق"
                      className="w-full max-w-sm rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-s3m-red font-semibold">أعضاء الفريق</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="text-white/60 text-sm">اللاعب الأول (القائد)</p>
                  <p className="text-white font-semibold">{selectedRegistration.player_1_name}</p>
                  <p className="text-white/80 text-sm">المعرف: {selectedRegistration.player_1_id}</p>
                </div>
                
                {selectedRegistration.player_2_name && (
                  <div className="bg-black/20 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">اللاعب الثاني</p>
                    <p className="text-white font-semibold">{selectedRegistration.player_2_name}</p>
                    <p className="text-white/80 text-sm">المعرف: {selectedRegistration.player_2_id}</p>
                  </div>
                )}
                
                {selectedRegistration.player_3_name && (
                  <div className="bg-black/20 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">اللاعب الثالث</p>
                    <p className="text-white font-semibold">{selectedRegistration.player_3_name}</p>
                    <p className="text-white/80 text-sm">المعرف: {selectedRegistration.player_3_id}</p>
                  </div>
                )}
                
                {selectedRegistration.player_4_name && (
                  <div className="bg-black/20 p-4 rounded-lg">
                    <p className="text-white/60 text-sm">اللاعب الرابع</p>
                    <p className="text-white font-semibold">{selectedRegistration.player_4_name}</p>
                    <p className="text-white/80 text-sm">المعرف: {selectedRegistration.player_4_id}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedRegistration.notes && (
              <div className="space-y-2">
                <h3 className="text-s3m-red font-semibold">ملاحظات إضافية</h3>
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
                  قبول الطلب
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleUpdateStatus(selectedRegistration.id, 'rejected')}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  رفض الطلب
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
                registration.status === 'pending' ? 'border-blue-500/50' : ''
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
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(registration.created_at), 'PPP', { locale: ar })}</span>
                        {registration.image_url && (
                          <>
                            <span className="text-white/30">•</span>
                            <Image className="h-4 w-4" />
                            <span>يحتوي على صورة</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(registration.status)}
                    <Eye className="h-4 w-4 text-white/60" />
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
