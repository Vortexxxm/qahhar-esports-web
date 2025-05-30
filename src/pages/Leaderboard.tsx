
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Star } from "lucide-react";

const Leaderboard = () => {
  // Mock data - will be replaced with real Supabase data
  const leaderboardData = [
    { rank: 1, name: "Ahmad_S3M", points: 9850, wins: 47, kd: 3.2, avatar: "", status: "متصل" },
    { rank: 2, name: "Khalid_Pro", points: 9420, wins: 43, kd: 2.9, avatar: "", status: "متصل" },
    { rank: 3, name: "Omar_Elite", points: 8950, wins: 41, kd: 2.7, avatar: "", status: "غير متصل" },
    { rank: 4, name: "Saud_Fire", points: 8650, wins: 38, kd: 2.5, avatar: "", status: "متصل" },
    { rank: 5, name: "Nasser_X", points: 8300, wins: 35, kd: 2.3, avatar: "", status: "في اللعبة" },
    { rank: 6, name: "Faisal_King", points: 7980, wins: 33, kd: 2.1, avatar: "", status: "غير متصل" },
    { rank: 7, name: "Yazeed_S3M", points: 7650, wins: 31, kd: 2.0, avatar: "", status: "متصل" },
    { rank: 8, name: "Rayan_Beast", points: 7350, wins: 29, kd: 1.9, avatar: "", status: "في اللعبة" },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-white/60">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "gaming-gradient";
    if (rank <= 5) return "bg-gaming-primary";
    return "bg-white/20";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "متصل":
        return "bg-green-500";
      case "في اللعبة":
        return "bg-gaming-primary";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent">
            متصدرو الفريق
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            ترتيب أعضاء فريق S3M E-Sports حسب النقاط والإنجازات
          </p>
        </div>

        {/* Top 3 Podium */}
        <section className="mb-16">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {leaderboardData.slice(0, 3).map((player, index) => (
              <Card key={player.rank} className={`gaming-card hover:gaming-glow transition-all duration-300 ${
                player.rank === 1 ? 'md:order-2 transform md:scale-110' : 
                player.rank === 2 ? 'md:order-1' : 'md:order-3'
              }`}>
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    {getRankIcon(player.rank)}
                  </div>
                  <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-gaming-primary">
                    <AvatarImage src={player.avatar} />
                    <AvatarFallback className="bg-gaming-primary text-white text-lg">
                      {player.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-white mb-2">{player.name}</h3>
                  <div className="text-3xl font-bold text-gaming-primary mb-2">
                    {player.points.toLocaleString()}
                  </div>
                  <p className="text-white/60 text-sm mb-4">نقطة</p>
                  <div className="flex justify-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="text-white font-semibold">{player.wins}</div>
                      <div className="text-white/60">انتصار</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">{player.kd}</div>
                      <div className="text-white/60">K/D</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge className={`${getStatusColor(player.status)} text-white`}>
                      {player.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Full Leaderboard */}
        <section>
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gaming-primary">
                <TrendingUp className="h-6 w-6" />
                <span>الترتيب العام</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20 border-b border-gaming-primary/20">
                    <tr>
                      <th className="text-right py-4 px-6 text-white/80 font-semibold">الترتيب</th>
                      <th className="text-right py-4 px-6 text-white/80 font-semibold">اللاعب</th>
                      <th className="text-right py-4 px-6 text-white/80 font-semibold">النقاط</th>
                      <th className="text-right py-4 px-6 text-white/80 font-semibold">الانتصارات</th>
                      <th className="text-right py-4 px-6 text-white/80 font-semibold">K/D</th>
                      <th className="text-right py-4 px-6 text-white/80 font-semibold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((player, index) => (
                      <tr key={player.rank} className="border-b border-white/10 hover:bg-black/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            {player.rank <= 3 ? (
                              <div className="flex items-center space-x-2">
                                {getRankIcon(player.rank)}
                                <Badge className={getRankBadgeColor(player.rank)}>
                                  {player.rank}
                                </Badge>
                              </div>
                            ) : (
                              <Badge className={getRankBadgeColor(player.rank)}>
                                {player.rank}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10 border border-gaming-primary/30">
                              <AvatarImage src={player.avatar} />
                              <AvatarFallback className="bg-gaming-primary/20 text-white text-sm">
                                {player.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-white">{player.name}</div>
                              {player.rank <= 5 && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-gaming-accent" />
                                  <span className="text-xs text-gaming-accent">نجم الفريق</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gaming-primary font-bold text-lg">
                            {player.points.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white font-semibold">{player.wins}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-white font-semibold">{player.kd}</span>
                        </td>
                        <td className="py-4 px-6">
                          <Badge className={`${getStatusColor(player.status)} text-white`}>
                            {player.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats Summary */}
        <section className="mt-16">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "إجمالي اللاعبين", value: "25", icon: Trophy },
              { label: "متوسط النقاط", value: "7,850", icon: TrendingUp },
              { label: "إجمالي الانتصارات", value: "289", icon: Award },
              { label: "اللاعبين المتصلين", value: "18", icon: Star },
            ].map((stat, index) => (
              <Card key={index} className="gaming-card">
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-4 text-gaming-primary" />
                  <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Leaderboard;
