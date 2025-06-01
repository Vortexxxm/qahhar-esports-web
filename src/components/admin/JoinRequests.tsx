import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CheckCircle, XCircle, Phone, User, Calendar, Trophy, Clock, MessageSquare } from "lucide-react";

type JoinRequest = {
  id: string;
  user_id: string;
  full_name: string;
  game_id: string;
  phone_number: string;
  age: number;
  rank: string;
  experience: string;
  available_hours: string;
  why_join: string;
  status: 'new' | 'reviewed' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

const JoinRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['join-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('join_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as JoinRequest[];
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'reviewed' | 'rejected' }) => {
      const { error } = await supabase
        .from('join_requests')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['join-requests'] });
      toast({
        title: "تم تحديث الطلب",
        description: "تم تحديث حالة الطلب بنجاح",
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

  const handleUpdateStatus = (id: string, status: 'reviewed' | 'rejected') => {
    updateRequestMutation.mutate({ id, status });
  };

  const getRankLabel = (rank: string) => {
    const ranks = {
      bronze: "برونز",
      silver: "فضي",
      gold: "ذهبي",
      platinum: "بلاتيني",
      diamond: "ديامند",
      master: "ماستر",
      grandmaster: "جراند ماستر"
    };
    return ranks[rank as keyof typeof ranks] || rank;
  };

  const getExperienceLabel = (exp: string) => {
    const experiences = {
      "less-than-1": "أقل من سنة",
      "1-2": "1-2 سنة",
      "2-3": "2-3 سنوات",
      "3-5": "3-5 سنوات",
      "more-than-5": "أكثر من 5 سنوات"
    };
    return experiences[exp as keyof typeof experiences] || exp;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">جديد</Badge>;
      case 'reviewed':
        return <Badge className="bg-green-500">تمت المراجعة</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">مرفوض</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-white">جاري تحميل الطلبات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedRequest ? (
        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-s3m-red">تفاصيل الطلب</CardTitle>
            <Button
              variant="outline"
              className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white"
              onClick={() => setSelectedRequest(null)}
            >
              عودة للقائمة
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-s3m-red" />
                  <div>
                    <p className="text-white/60 text-sm">الاسم الكامل</p>
                    <p className="text-white font-semibold">{selectedRequest.full_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-s3m-red" />
                  <div>
                    <p className="text-white/60 text-sm">معرف اللعبة</p>
                    <p className="text-white font-semibold">{selectedRequest.game_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-s3m-red" />
                  <div>
                    <p className="text-white/60 text-sm">رقم الهاتف</p>
                    <p className="text-white font-semibold">{selectedRequest.phone_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-s3m-red" />
                  <div>
                    <p className="text-white/60 text-sm">العمر</p>
                    <p className="text-white font-semibold">{selectedRequest.age} سنة</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm">الرانك</p>
                  <p className="text-white font-semibold">{getRankLabel(selectedRequest.rank)}</p>
                </div>

                <div>
                  <p className="text-white/60 text-sm">الخبرة</p>
                  <p className="text-white font-semibold">{getExperienceLabel(selectedRequest.experience)}</p>
                </div>

                <div>
                  <p className="text-white/60 text-sm">ساعات التفرغ</p>
                  <p className="text-white font-semibold">{selectedRequest.available_hours}</p>
                </div>

                <div>
                  <p className="text-white/60 text-sm">تاريخ الطلب</p>
                  <p className="text-white font-semibold">
                    {format(new Date(selectedRequest.created_at), 'PPP', { locale: ar })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-s3m-red" />
                <p className="text-white/60">سبب الانضمام</p>
              </div>
              <p className="text-white bg-black/20 p-4 rounded-lg">{selectedRequest.why_join}</p>
            </div>

            {selectedRequest.status === 'new' && (
              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'reviewed')}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  قبول الطلب
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')}
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
          {requests?.map((request) => (
            <Card 
              key={request.id} 
              className={`gaming-card cursor-pointer transition-all hover:border-s3m-red/50 ${
                request.status === 'new' ? 'border-blue-500/50' : ''
              }`}
              onClick={() => setSelectedRequest(request)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {request.full_name}
                      </h3>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Trophy className="h-4 w-4" />
                        <span>{request.game_id}</span>
                        <span className="text-white/30">•</span>
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(request.created_at), 'PPP', { locale: ar })}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardContent>
            </Card>
          ))}

          {(!requests || requests.length === 0) && (
            <Card className="gaming-card">
              <CardContent className="p-6 text-center">
                <p className="text-white/60">لا توجد طلبات انضمام حالياً</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default JoinRequests;