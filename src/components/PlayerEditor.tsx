
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Save, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PlayerData = {
  id: string;
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
  leaderboard_scores: Database['public']['Tables']['leaderboard_scores']['Row'] | null;
  user_roles: { role: string }[];
};

interface PlayerEditorProps {
  player: PlayerData;
  onClose: () => void;
}

const PlayerEditor = ({ player, onClose }: PlayerEditorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editData, setEditData] = useState({
    username: player.profiles?.username || '',
    points: player.leaderboard_scores?.points || 0,
    wins: player.leaderboard_scores?.wins || 0,
    kills: player.leaderboard_scores?.kills || 0,
    deaths: player.leaderboard_scores?.deaths || 0,
    games_played: player.leaderboard_scores?.games_played || 0,
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async (data: typeof editData) => {
      console.log('Updating player data:', data);
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username: data.username })
        .eq('id', player.id);

      if (profileError) throw profileError;

      // Update leaderboard scores
      const { error: scoresError } = await supabase
        .from('leaderboard_scores')
        .update({
          points: data.points,
          wins: data.wins,
          kills: data.kills,
          deaths: data.deaths,
          games_played: data.games_played,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', player.id);

      if (scoresError) throw scoresError;

      // Update rankings
      await supabase.rpc('update_leaderboard_rankings');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast({
        title: "تم الحفظ بنجاح!",
        description: "تم تحديث بيانات اللاعب وسيظهر التحديث فوراً في المتصدرين",
      });
      onClose();
    },
    onError: (error: any) => {
      console.error('Error updating player:', error);
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!editData.username.trim()) {
      toast({
        title: "خطأ",
        description: "اسم اللاعب مطلوب",
        variant: "destructive",
      });
      return;
    }

    updatePlayerMutation.mutate(editData);
  };

  const getKDRatio = (kills: number, deaths: number) => {
    if (deaths === 0) return kills > 0 ? kills.toFixed(1) : "0.0";
    return (kills / deaths).toFixed(1);
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-s3m-red flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>تعديل بيانات اللاعب</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-s3m-red/30"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="w-16 h-16 border-2 border-s3m-red">
            <AvatarImage src={player.profiles?.avatar_url || ""} />
            <AvatarFallback className="bg-s3m-red text-white text-lg">
              {(editData.username || 'U').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-white font-bold text-lg">{player.profiles?.username}</h3>
            <p className="text-white/60">معرف المستخدم: {player.id.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">اسم اللاعب</Label>
            <Input
              value={editData.username}
              onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
              className="bg-black/20 border-s3m-red/30 text-white"
              placeholder="اسم اللاعب"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">النقاط</Label>
            <Input
              type="number"
              value={editData.points}
              onChange={(e) => setEditData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
              className="bg-black/20 border-s3m-red/30 text-white"
              placeholder="النقاط"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">عدد الانتصارات</Label>
            <Input
              type="number"
              value={editData.wins}
              onChange={(e) => setEditData(prev => ({ ...prev, wins: parseInt(e.target.value) || 0 }))}
              className="bg-black/20 border-s3m-red/30 text-white"
              placeholder="الانتصارات"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">عدد الألعاب</Label>
            <Input
              type="number"
              value={editData.games_played}
              onChange={(e) => setEditData(prev => ({ ...prev, games_played: parseInt(e.target.value) || 0 }))}
              className="bg-black/20 border-s3m-red/30 text-white"
              placeholder="عدد الألعاب"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">عدد القتلات</Label>
            <Input
              type="number"
              value={editData.kills}
              onChange={(e) => setEditData(prev => ({ ...prev, kills: parseInt(e.target.value) || 0 }))}
              className="bg-black/20 border-s3m-red/30 text-white"
              placeholder="القتلات"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">عدد الوفيات</Label>
            <Input
              type="number"
              value={editData.deaths}
              onChange={(e) => setEditData(prev => ({ ...prev, deaths: parseInt(e.target.value) || 0 }))}
              className="bg-black/20 border-s3m-red/30 text-white"
              placeholder="الوفيات"
            />
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-2">معاينة الإحصائيات</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/60">نسبة K/D:</span>
              <span className="text-s3m-red font-bold ml-2">
                {getKDRatio(editData.kills, editData.deaths)}
              </span>
            </div>
            <div>
              <span className="text-white/60">معدل الفوز:</span>
              <span className="text-s3m-red font-bold ml-2">
                {editData.games_played > 0 ? ((editData.wins / editData.games_played) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button
            onClick={handleSave}
            disabled={updatePlayerMutation.isPending}
            className="flex-1 bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
          >
            <Save className="h-4 w-4 mr-2" />
            {updatePlayerMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-s3m-red/30"
          >
            إلغاء
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerEditor;
