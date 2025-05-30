
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Users, Trophy, Settings, Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react";

const AdminPanel = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([
    { id: 1, name: "Ahmad_S3M", email: "ahmad@example.com", points: 9850, status: "active", role: "captain" },
    { id: 2, name: "Khalid_Pro", email: "khalid@example.com", points: 9420, status: "active", role: "member" },
    { id: 3, name: "Omar_Elite", email: "omar@example.com", points: 8950, status: "inactive", role: "member" },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [pointsToAdd, setPointsToAdd] = useState("");

  const handleAddPoints = (userId: number) => {
    const points = parseInt(pointsToAdd);
    if (isNaN(points) || points <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم صحيح للنقاط",
        variant: "destructive",
      });
      return;
    }

    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, points: user.points + points }
        : user
    ));

    toast({
      title: "تم بنجاح!",
      description: `تم إضافة ${points} نقطة للاعب`,
    });

    setPointsToAdd("");
  };

  const handleToggleUserStatus = (userId: number) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === "active" ? "inactive" : "active" }
        : user
    ));

    toast({
      title: "تم التحديث",
      description: "تم تغيير حالة المستخدم",
    });
  };

  const stats = [
    { title: "إجمالي الأعضاء", value: "25", icon: Users, color: "text-blue-400" },
    { title: "الأعضاء النشطين", value: "18", icon: UserCheck, color: "text-green-400" },
    { title: "البطولات", value: "12", icon: Trophy, color: "text-yellow-400" },
    { title: "متوسط النقاط", value: "7,850", icon: Settings, color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent">
            لوحة الإدارة
          </h1>
          <p className="text-white/70">إدارة أعضاء الفريق والنقاط والإحصائيات</p>
        </div>

        {/* Stats Cards */}
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

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-black/20 border border-gaming-primary/20">
            <TabsTrigger value="users" className="data-[state=active]:bg-gaming-primary">
              إدارة الأعضاء
            </TabsTrigger>
            <TabsTrigger value="points" className="data-[state=active]:bg-gaming-primary">
              إدارة النقاط
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gaming-primary">
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card className="gaming-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gaming-primary">قائمة الأعضاء</CardTitle>
                  <Button className="gaming-gradient">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة عضو جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gaming-primary/20">
                      <tr>
                        <th className="text-right py-3 text-white/80">المستخدم</th>
                        <th className="text-right py-3 text-white/80">النقاط</th>
                        <th className="text-right py-3 text-white/80">الدور</th>
                        <th className="text-right py-3 text-white/80">الحالة</th>
                        <th className="text-right py-3 text-white/80">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-white/10">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-gaming-primary text-white">
                                  {user.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white font-semibold">{user.name}</p>
                                <p className="text-white/60 text-sm">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-gaming-primary font-bold">
                              {user.points.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4">
                            <Badge className={user.role === "captain" ? "gaming-gradient" : "bg-white/20"}>
                              {user.role === "captain" ? "قائد" : "عضو"}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <Badge className={user.status === "active" ? "bg-green-500" : "bg-gray-500"}>
                              {user.status === "active" ? "نشط" : "غير نشط"}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleUserStatus(user.id)}
                                className="border-gaming-primary/30"
                              >
                                {user.status === "active" ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </Button>
                              <Button size="sm" variant="outline" className="border-gaming-primary/30">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-500/30 text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Points Management */}
          <TabsContent value="points">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-gaming-primary">إضافة نقاط</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">اختر اللاعب</Label>
                    <select className="w-full p-3 bg-black/20 border border-gaming-primary/30 rounded-lg text-white">
                      <option value="">اختر لاعب</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} - {user.points} نقطة
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
                      className="bg-black/20 border-gaming-primary/30 text-white"
                      placeholder="مثال: 100"
                    />
                  </div>
                  <Button 
                    className="w-full gaming-gradient"
                    onClick={() => handleAddPoints(users[0]?.id)}
                  >
                    إضافة النقاط
                  </Button>
                </CardContent>
              </Card>

              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-gaming-primary">أفضل اللاعبين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users
                      .sort((a, b) => b.points - a.points)
                      .slice(0, 5)
                      .map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-gaming-primary font-bold">#{index + 1}</span>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gaming-primary text-white text-xs">
                              {user.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white">{user.name}</span>
                        </div>
                        <span className="text-gaming-primary font-bold">
                          {user.points.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-gaming-primary">إعدادات النظام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">إعدادات الفريق</h3>
                    <div className="space-y-2">
                      <Label className="text-white">اسم الفريق</Label>
                      <Input
                        defaultValue="S3M E-Sports"
                        className="bg-black/20 border-gaming-primary/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">وصف الفريق</Label>
                      <Input
                        defaultValue="فريق الألعاب الإلكترونية المحترف"
                        className="bg-black/20 border-gaming-primary/30 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">إعدادات النقاط</h3>
                    <div className="space-y-2">
                      <Label className="text-white">نقاط الفوز</Label>
                      <Input
                        type="number"
                        defaultValue="50"
                        className="bg-black/20 border-gaming-primary/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">نقاط البطولة</Label>
                      <Input
                        type="number"
                        defaultValue="500"
                        className="bg-black/20 border-gaming-primary/30 text-white"
                      />
                    </div>
                  </div>
                </div>
                
                <Button className="gaming-gradient">
                  حفظ الإعدادات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
