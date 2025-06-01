
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Database } from "@/integrations/supabase/types";

type UserWithProfile = {
  id: string;
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
  leaderboard_scores: Database['public']['Tables']['leaderboard_scores']['Row'] | null;
};

interface TopPlayersProps {
  users: UserWithProfile[];
}

const TopPlayers = ({ users }: TopPlayersProps) => {
  const topPlayers = users
    ?.sort((a, b) => (b.leaderboard_scores?.points || 0) - (a.leaderboard_scores?.points || 0))
    .slice(0, 5);

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="text-s3m-red">أفضل اللاعبين</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPlayers?.map((userData, index) => (
            <div key={userData.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-s3m-red font-bold">#{index + 1}</span>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-s3m-red text-white text-xs">
                    {(userData.profiles?.username || 'U').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white">
                  {userData.profiles?.username || 'مجهول'}
                </span>
              </div>
              <span className="text-s3m-red font-bold">
                {userData.leaderboard_scores?.points?.toLocaleString() || '0'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPlayers;
