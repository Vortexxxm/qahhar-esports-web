
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Pin, Calendar, Edit, Plus, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string | null;
  is_pinned: boolean | null;
  created_at: string;
  updated_at: string;
}

const GirlsAnnouncements = () => {
  const { userRole } = useAuth();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['girls-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('girls_announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Announcement[];
    },
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case 'normal':
        return <Info className="h-4 w-4 text-blue-400" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'عاجل';
      case 'high':
        return 'مهم';
      case 'normal':
        return 'عادي';
      case 'low':
        return 'منخفض';
      default:
        return 'عادي';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-200 border-red-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-200 border-orange-400';
      case 'normal':
        return 'bg-blue-500/20 text-blue-200 border-blue-400';
      case 'low':
        return 'bg-green-500/20 text-green-200 border-green-400';
      default:
        return 'bg-blue-500/20 text-blue-200 border-blue-400';
    }
  };

  const getCardBorderColor = (priority: string, isPinned: boolean) => {
    if (isPinned) return 'border-yellow-400/50';
    switch (priority) {
      case 'urgent':
        return 'border-red-400/50';
      case 'high':
        return 'border-orange-400/50';
      default:
        return 'border-purple-400/30';
    }
  };

  const pinnedAnnouncements = announcements?.filter(a => a.is_pinned) || [];
  const regularAnnouncements = announcements?.filter(a => !a.is_pinned) || [];

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
          <Megaphone className="h-6 w-6 text-pink-400" />
          إعلانات فرع البنات
        </h2>
        {userRole === 'admin' && (
          <div className="flex gap-2">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              إضافة إعلان
            </Button>
            <Button variant="outline" className="border-pink-400 text-pink-200 hover:bg-pink-500/20">
              <Edit className="h-4 w-4 mr-2" />
              إدارة الإعلانات
            </Button>
          </div>
        )}
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Pin className="h-5 w-5 text-yellow-400" />
            الإعلانات المثبتة
          </h3>
          <div className="space-y-4">
            {pinnedAnnouncements.map((announcement) => (
              <Card 
                key={announcement.id} 
                className={`gaming-card ${getCardBorderColor(announcement.priority || 'normal', true)} bg-gradient-to-r from-yellow-500/10 to-amber-500/10`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-400">
                        <Pin className="h-3 w-3 mr-1" />
                        مثبت
                      </Badge>
                      <Badge className={getPriorityColor(announcement.priority || 'normal')}>
                        {getPriorityIcon(announcement.priority || 'normal')}
                        <span className="mr-1">{getPriorityLabel(announcement.priority || 'normal')}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(announcement.created_at), 'PP', { locale: ar })}</span>
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg">{announcement.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-invert max-w-none text-white/80"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  />
                  {announcement.updated_at !== announcement.created_at && (
                    <p className="text-xs text-white/50 mt-3">
                      آخر تحديث: {format(new Date(announcement.updated_at), 'PPp', { locale: ar })}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Announcements */}
      {regularAnnouncements.length > 0 && (
        <div>
          {pinnedAnnouncements.length > 0 && (
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-purple-400" />
              الإعلانات العامة
            </h3>
          )}
          <div className="space-y-4">
            {regularAnnouncements.map((announcement) => (
              <Card 
                key={announcement.id} 
                className={`gaming-card ${getCardBorderColor(announcement.priority || 'normal', false)} hover:scale-102 transition-transform`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getPriorityColor(announcement.priority || 'normal')}>
                      {getPriorityIcon(announcement.priority || 'normal')}
                      <span className="mr-1">{getPriorityLabel(announcement.priority || 'normal')}</span>
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(announcement.created_at), 'PP', { locale: ar })}</span>
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg">{announcement.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-invert max-w-none text-white/80"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  />
                  {announcement.updated_at !== announcement.created_at && (
                    <p className="text-xs text-white/50 mt-3">
                      آخر تحديث: {format(new Date(announcement.updated_at), 'PPp', { locale: ar })}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(!announcements || announcements.length === 0) && (
        <Card className="gaming-card">
          <CardContent className="p-12 text-center">
            <Megaphone className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl text-white/60 mb-2">لا توجد إعلانات حالياً</h3>
            <p className="text-white/40">سيتم إضافة الإعلانات قريباً</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GirlsAnnouncements;
