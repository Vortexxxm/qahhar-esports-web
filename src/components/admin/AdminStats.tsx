
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Trophy, Settings } from "lucide-react";

interface AdminStatsProps {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  averagePoints: number;
}

const AdminStats = ({ totalUsers, activeUsers, adminCount, averagePoints }: AdminStatsProps) => {
  const stats = [
    { title: "إجمالي الأعضاء", value: totalUsers.toString(), icon: Users, color: "text-blue-400" },
    { title: "الأعضاء النشطين", value: activeUsers.toString(), icon: UserCheck, color: "text-green-400" },
    { title: "المديرين", value: adminCount.toString(), icon: Trophy, color: "text-yellow-400" },
    { title: "متوسط النقاط", value: averagePoints.toString(), icon: Settings, color: "text-purple-400" },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="gaming-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
