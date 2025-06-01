
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/integrations/supabase/types";

type UserWithProfile = {
  id: string;
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
  leaderboard_scores: Database['public']['Tables']['leaderboard_scores']['Row'] | null;
};

interface PointsManagerProps {
  users: UserWithProfile[];
  onAddPoints: (userId: string, points: number) => void;
  isLoading: boolean;
}

const PointsManager = ({ users, onAddPoints, isLoading }: PointsManagerProps) => {
  const [pointsToAdd, setPointsToAdd] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const handleAddPoints = () => {
    const points = parseInt(pointsToAdd);
    if (isNaN(points) || points <= 0 || !selectedUserId) {
      return;
    }

    const user = users?.find(u => u.id === selectedUserId);
    const currentPoints = user?.leaderboard_scores?.points || 0;
    const newPoints = currentPoints + points;

    onAddPoints(selectedUserId, newPoints);
    setPointsToAdd("");
    setSelectedUserId("");
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="text-s3m-red">إضافة نقاط</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white">اختر اللاعب</Label>
          <select 
            className="w-full p-3 bg-black/20 border border-s3m-red/30 rounded-lg text-white"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">اختر لاعب</option>
            {users?.map(userData => (
              <option key={userData.id} value={userData.id}>
                {userData.profiles?.username || 'مجهول'} - {userData.leaderboard_scores?.points || 0} نقطة
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-white">عدد النقاط</Label>
          <Input
            type="number"
            value={pointsToAdd}
            onChange={(e) => setPointsToAdd(e.target.value)}
            className="bg-black/20 border-s3m-red/30 text-white"
            placeholder="مثال: 100"
          />
        </div>
        <Button 
          className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
          onClick={handleAddPoints}
          disabled={isLoading}
        >
          {isLoading ? "جاري الإضافة..." : "إضافة النقاط"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PointsManager;
