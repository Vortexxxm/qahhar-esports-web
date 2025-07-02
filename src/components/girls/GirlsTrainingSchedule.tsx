import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin, Edit, Plus, Trophy } from "lucide-react";
import { format, isFuture, isPast, isToday } from "date-fns";
import { ar } from "date-fns/locale";

interface TrainingEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  scheduled_date: string;
  duration_minutes: number | null;
  room_info: string | null;
  max_participants: number | null;
  created_at: string;
}

const GirlsTrainingSchedule = () => {
  const { userRole } = useAuth();

  const { data: events, isLoading } = useQuery({
    queryKey: ['girls-training-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('girls_training_schedule')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data as TrainingEvent[];
    },
  });

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'training':
        return <Users className="h-4 w-4" />;
      case 'war':
        return <Trophy className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'tournament':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'training':
        return 'تدريب';
      case 'war':
        return 'حرب';
      case 'meeting':
        return 'اجتماع';
      case 'tournament':
        return 'بطولة';
      default:
        return 'فعالية';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'training':
        return 'bg-blue-500/20 text-blue-200 border-blue-400';
      case 'war':
        return 'bg-red-500/20 text-red-200 border-red-400';
      case 'meeting':
        return 'bg-purple-500/20 text-purple-200 border-purple-400';
      case 'tournament':
        return 'bg-yellow-500/20 text-yellow-200 border-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-400';
    }
  };

  const getEventStatus = (date: string) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) {
      return { label: 'اليوم', color: 'bg-green-500/20 text-green-200 border-green-400' };
    } else if (isFuture(eventDate)) {
      return { label: 'قادم', color: 'bg-blue-500/20 text-blue-200 border-blue-400' };
    } else {
      return { label: 'انتهى', color: 'bg-gray-500/20 text-gray-200 border-gray-400' };
    }
  };

  const upcomingEvents = events?.filter(event => isFuture(new Date(event.scheduled_date)) || isToday(new Date(event.scheduled_date))) || [];
  const pastEvents = events?.filter(event => isPast(new Date(event.scheduled_date)) && !isToday(new Date(event.scheduled_date))) || [];

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
          <Calendar className="h-6 w-6 text-pink-400" />
          جدول التدريبات والحروب
        </h2>
        {userRole === 'admin' && (
          <div className="flex gap-2">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              إضافة فعالية
            </Button>
            <Button variant="outline" className="border-pink-400 text-pink-200 hover:bg-pink-500/20">
              <Edit className="h-4 w-4 mr-2" />
              إدارة الجدول
            </Button>
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-400" />
            الفعاليات القادمة
          </h3>
          <div className="space-y-4">
            {upcomingEvents.map((event) => {
              const status = getEventStatus(event.scheduled_date);
              return (
                <Card key={event.id} className="gaming-card hover:scale-102 transition-transform border-green-500/30">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getEventTypeColor(event.event_type || '')}>
                          {getEventTypeIcon(event.event_type || '')}
                          <span className="mr-1">{getEventTypeLabel(event.event_type || '')}</span>
                        </Badge>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-white/60">
                        {format(new Date(event.scheduled_date), 'PPp', { locale: ar })}
                      </div>
                    </div>
                    <CardTitle className="text-white text-lg">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.description && (
                      <p className="text-white/80">{event.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-white/70">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <span>{event.duration_minutes || 60} دقيقة</span>
                      </div>
                      
                      {event.max_participants && (
                        <div className="flex items-center gap-2 text-white/70">
                          <Users className="h-4 w-4 text-purple-400" />
                          <span>حتى {event.max_participants} مشاركة</span>
                        </div>
                      )}
                      
                      {event.room_info && (
                        <div className="flex items-center gap-2 text-white/70">
                          <MapPin className="h-4 w-4 text-pink-400" />
                          <span>{event.room_info}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            الفعاليات السابقة
          </h3>
          <div className="space-y-4">
            {pastEvents.slice(0, 5).map((event) => (
              <Card key={event.id} className="gaming-card opacity-70">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getEventTypeColor(event.event_type || '')}>
                      {getEventTypeIcon(event.event_type || '')}
                      <span className="mr-1">{getEventTypeLabel(event.event_type || '')}</span>
                    </Badge>
                    <div className="text-sm text-white/60">
                      {format(new Date(event.scheduled_date), 'PPp', { locale: ar })}
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg">{event.title}</CardTitle>
                </CardHeader>
                {event.description && (
                  <CardContent>
                    <p className="text-white/60 text-sm">{event.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {(!events || events.length === 0) && (
        <Card className="gaming-card">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl text-white/60 mb-2">لا توجد فعاليات مجدولة</h3>
            <p className="text-white/40">سيتم إضافة الجدول قريباً</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GirlsTrainingSchedule;
