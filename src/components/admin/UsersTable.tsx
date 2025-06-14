
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Edit, UserCheck, UserX, Search, Eye, EyeOff } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type UserWithProfile = {
  id: string;
  profiles: Database['public']['Tables']['profiles']['Row'] | null;
  user_roles: { role: string }[] | null;
  leaderboard_scores: Database['public']['Tables']['leaderboard_scores']['Row'] | null;
};

interface UsersTableProps {
  users: UserWithProfile[];
  currentUserId: string;
  onEditPlayer: (user: UserWithProfile) => void;
  onToggleRole: (userId: string, currentRole: string) => void;
  onToggleVisibility: (userId: string, currentVisibility: boolean) => void;
  onSetWeeklyPlayer: (playerId: string) => void;
  onSetMonthlyPlayer: (playerId: string) => void;
}

const UsersTable = ({ 
  users, 
  currentUserId, 
  onEditPlayer, 
  onToggleRole, 
  onToggleVisibility,
  onSetWeeklyPlayer,
  onSetMonthlyPlayer 
}: UsersTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users?.filter(user => {
    const username = user.profiles?.username?.toLowerCase() || '';
    const userId = user.id.toLowerCase();
    const search = searchTerm.toLowerCase();
    return username.includes(search) || userId.includes(search);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-white/60" />
        <Input
          placeholder="البحث بالاسم أو ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-black/20 border-s3m-red/30 text-white max-w-md"
        />
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-s3m-red/20">
              <TableHead className="text-right text-white/80">المستخدم</TableHead>
              <TableHead className="text-right text-white/80">النقاط</TableHead>
              <TableHead className="text-right text-white/80">الدور</TableHead>
              <TableHead className="text-right text-white/80">مرئي في المتصدرين</TableHead>
              <TableHead className="text-right text-white/80">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((userData) => (
              <TableRow key={userData.id} className="border-b border-white/10">
                <TableCell className="py-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={userData.profiles?.avatar_url || ""} />
                      <AvatarFallback className="bg-s3m-red text-white">
                        {(userData.profiles?.username || 'U').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-semibold">
                        {userData.profiles?.username || 'مجهول'}
                      </p>
                      <p className="text-white/60 text-sm">
                        {userData.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-s3m-red font-bold">
                    {userData.leaderboard_scores?.points?.toLocaleString() || '0'}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <Badge className={userData.user_roles?.[0]?.role === "admin" ? "bg-gradient-to-r from-s3m-red to-red-600" : "bg-white/20"}>
                    {userData.user_roles?.[0]?.role === "admin" ? "مدير" : "عضو"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={userData.leaderboard_scores?.visible_in_leaderboard || false}
                      onCheckedChange={() => onToggleVisibility(userData.id, userData.leaderboard_scores?.visible_in_leaderboard || false)}
                    />
                    {userData.leaderboard_scores?.visible_in_leaderboard ? (
                      <Eye className="h-4 w-4 text-green-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditPlayer(userData)}
                      className="border-s3m-red/30"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleRole(userData.id, userData.user_roles?.[0]?.role || 'user')}
                      className="border-s3m-red/30"
                      disabled={userData.id === currentUserId}
                    >
                      {userData.user_roles?.[0]?.role === "admin" ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {filteredUsers?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-white/60">لا توجد نتائج للبحث "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
