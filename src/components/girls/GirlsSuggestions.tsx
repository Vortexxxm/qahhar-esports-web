
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, ThumbsUp, Calendar, User, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Suggestion {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  category: string | null;
  status: string | null;
  votes: number | null;
  response: string | null;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string | null;
  };
}

const GirlsSuggestions = () => {
  const { user, userRole } = useAuth();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['girls-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('girls_suggestions')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name
          )
        `)
        .order('votes', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Suggestion[];
    },
  });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'events':
        return 'فعاليات';
      case 'competitions':
        return 'مسابقات';
      case 'team_development':
        return 'تطوير الفريق';
      default:
        return 'أخرى';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'implemented':
        return <CheckCircle className="h-4 w-4 text-blue-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'مقبولة';
      case 'rejected':
        return 'مرفوضة';
      case 'implemented':
        return 'تم التنفيذ';
      default:
        return 'قيد المراجعة';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-200 border-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-200 border-red-400';
      case 'implemented':
        return 'bg-blue-500/20 text-blue-200 border-blue-400';
      default:
        return 'bg-yellow-500/20 text-yellow-200 border-yellow-400';
    }
  };

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
          <MessageSquare className="h-6 w-6 text-pink-400" />
          صندوق أفكار البنات
        </h2>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          اقتراح فكرة جديدة
        </Button>
      </div>

      {suggestions && suggestions.length > 0 ? (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="gaming-card hover:scale-102 transition-transform">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500/20 text-purple-200 border-purple-400">
                      {getCategoryLabel(suggestion.category || 'other')}
                    </Badge>
                    <Badge className={getStatusColor(suggestion.status || 'pending')}>
                      {getStatusIcon(suggestion.status || 'pending')}
                      <span className="mr-1">{getStatusLabel(suggestion.status || 'pending')}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {suggestion.votes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(suggestion.created_at), 'PP', { locale: ar })}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-white text-lg">{suggestion.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">{suggestion.description}</p>
                
                {suggestion.response && (
                  <div className="bg-black/30 rounded-lg p-4 border-r-4 border-pink-400">
                    <h4 className="font-semibold text-pink-200 mb-2">رد الإدارة:</h4>
                    <p className="text-white/80">{suggestion.response}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {suggestion.profiles?.full_name || suggestion.profiles?.username}
                  </span>
                  
                  {suggestion.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-pink-400 text-pink-200 hover:bg-pink-500/20"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      أعجبني ({suggestion.votes || 0})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="gaming-card">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl text-white/60 mb-2">لا توجد اقتراحات حالياً</h3>
            <p className="text-white/40">كوني أول من يشارك فكرتها!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GirlsSuggestions;
