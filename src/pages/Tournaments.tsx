
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Calendar, Users, Plus, Edit, MapPin, Gift, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Tournament = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_teams: number | null;
  entry_requirements: string | null;
  prize_info: string | null;
  rules: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

const Tournaments = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [tournamentForm, setTournamentForm] = useState({
    title: "",
    description: "",
    image_url: "",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    max_teams: 16,
    entry_requirements: "",
    prize_info: "",
    rules: "",
    status: "upcoming"
  });
  const [registrationForm, setRegistrationForm] = useState({
    team_name: "",
    player_1_name: "",
    player_1_id: "",
    player_2_name: "",
    player_2_id: "",
    player_3_name: "",
    player_3_id: "",
    player_4_name: "",
    player_4_id: "",
    contact_phone: "",
    contact_email: ""
  });

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Tournament[];
    },
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (data: typeof tournamentForm) => {
      const { error } = await supabase
        .from('tournaments')
        .insert({
          ...data,
          created_by: user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      setIsDialogOpen(false);
      resetTournamentForm();
      toast({
        title: "تم إنشاء البطولة",
        description: "تم إضافة البطولة بنجاح",
      });
    },
  });

  const registerTeamMutation = useMutation({
    mutationFn: async (data: typeof registrationForm & { tournament_id: string }) => {
      const { error } = await supabase
        .from('tournament_registrations')
        .insert({
          ...data,
          leader_id: user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setIsRegisterDialogOpen(false);
      resetRegistrationForm();
      toast({
        title: "تم التسجيل بنجاح",
        description: "تم تسجيل فريقك في البطولة",
      });
    },
  });

  const resetTournamentForm = () => {
    setTournamentForm({
      title: "",
      description: "",
      image_url: "",
      start_date: "",
      end_date: "",
      registration_deadline: "",
      max_teams: 16,
      entry_requirements: "",
      prize_info: "",
      rules: "",
      status: "upcoming"
    });
  };

  const resetRegistrationForm = () => {
    setRegistrationForm({
      team_name: "",
      player_1_name: "",
      player_1_id: "",
      player_2_name: "",
      player_2_id: "",
      player_3_name: "",
      player_3_id: "",
      player_4_name: "",
      player_4_id: "",
      contact_phone: "",
      contact_email: user?.email || ""
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      upcoming: { label: "قريباً", color: "bg-blue-500" },
      registration_open: { label: "التسجيل مفتوح", color: "bg-green-500" },
      registration_closed: { label: "التسجيل مغلق", color: "bg-yellow-500" },
      ongoing: { label: "جارية", color: "bg-orange-500" },
      completed: { label: "انتهت", color: "bg-gray-500" }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.upcoming;
    
    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const handleRegister = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    resetRegistrationForm();
    setIsRegisterDialogOpen(true);
  };

  const submitRegistration = () => {
    if (!selectedTournament || !registrationForm.team_name || !registrationForm.player_1_name) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    registerTeamMutation.mutate({
      ...registrationForm,
      tournament_id: selectedTournament.id
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div 
            className="h-64 rounded-lg bg-cover bg-center relative overflow-hidden mb-8"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1920&q=80')`
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-5xl font-bold mb-4 text-white">
                  البطولات
                </h1>
                <p className="text-xl text-white/90">شارك في أقوى البطولات واحصل على الجوائز</p>
              </div>
            </div>
          </div>
          
          {userRole === 'admin' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-s3m-red to-red-600">
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء بطولة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="gaming-card max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-s3m-red">إنشاء بطولة جديدة</DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">اسم البطولة</Label>
                      <Input
                        value={tournamentForm.title}
                        onChange={(e) => setTournamentForm(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">الوصف</Label>
                      <Textarea
                        value={tournamentForm.description}
                        onChange={(e) => setTournamentForm(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">رابط الصورة</Label>
                      <Input
                        value={tournamentForm.image_url}
                        onChange={(e) => setTournamentForm(prev => ({ ...prev, image_url: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">تاريخ البداية</Label>
                      <Input
                        type="datetime-local"
                        value={tournamentForm.start_date}
                        onChange={(e) => setTournamentForm(prev => ({ ...prev, start_date: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">تاريخ النهاية</Label>
                      <Input
                        type="datetime-local"
                        value={tournamentForm.end_date}
                        onChange={(e) => setTournamentForm(prev => ({ ...prev, end_date: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">آخر موعد للتسجيل</Label>
                      <Input
                        type="datetime-local"
                        value={tournamentForm.registration_deadline}
                        onChange={(e) => setTournamentForm(prev => ({ ...prev, registration_deadline: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">عدد الفرق الأقصى</Label>
                      <Input
                        type="number"
                        value={tournamentForm.max_teams}
                        onChange={(e) => setTournamentForm(prev => ({ ...prev, max_teams: parseInt(e.target.value) }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">شروط المشاركة</Label>
                      <Textarea
                        value={tournamentForm.entry_requirements}
                        onChange={(e) => setTournamentForm(prev => ({ ...prev, entry_requirements: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">معلومات الجوائز</Label>
                      <Textarea
                        value={tournamentForm.prize_info}
                        onChange={(e) => setTournamentForm(prev => ({ ...prev, prize_info: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">القوانين</Label>
                      <Textarea
                        value={tournamentForm.rules}
                        onChange={(e) => setTournamentForm(prev => ({ ...prev, rules: e.target.value }))}
                        className="bg-black/20 border-s3m-red/30 text-white"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => createTournamentMutation.mutate(tournamentForm)}
                    disabled={createTournamentMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-s3m-red to-red-600"
                  >
                    إنشاء البطولة
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-s3m-red/30"
                  >
                    إلغاء
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Tournaments Grid */}
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-white text-xl">جاري تحميل البطولات...</div>
            </div>
          ) : tournaments && tournaments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament) => (
                <Card key={tournament.id} className="gaming-card overflow-hidden hover:scale-[1.02] transition-transform">
                  {tournament.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={tournament.image_url}
                        alt={tournament.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      {getStatusBadge(tournament.status)}
                      <Badge variant="outline" className="border-s3m-red/30 text-s3m-red">
                        <Users className="h-3 w-3 mr-1" />
                        {tournament.max_teams} فريق
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-white">
                      {tournament.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-white/70 line-clamp-2">
                      {tournament.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-white/60">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>البداية: {formatDate(tournament.start_date)}</span>
                      </div>
                      <div className="flex items-center text-white/60">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>التسجيل حتى: {formatDate(tournament.registration_deadline)}</span>
                      </div>
                      {tournament.prize_info && (
                        <div className="flex items-center text-yellow-500">
                          <Gift className="h-4 w-4 mr-2" />
                          <span className="line-clamp-1">{tournament.prize_info}</span>
                        </div>
                      )}
                    </div>
                    
                    {tournament.status === 'registration_open' && user && (
                      <Button 
                        onClick={() => handleRegister(tournament)}
                        className="w-full bg-gradient-to-r from-s3m-red to-red-600"
                      >
                        التسجيل في البطولة
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">
                لا توجد بطولات حالياً
              </h3>
              <p className="text-white/50">
                تابعنا للحصول على آخر البطولات والمنافسات
              </p>
            </div>
          )}
        </div>

        {/* Registration Dialog */}
        <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
          <DialogContent className="gaming-card max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-s3m-red">
                التسجيل في بطولة: {selectedTournament?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">اسم الفريق *</Label>
                  <Input
                    value={registrationForm.team_name}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, team_name: e.target.value }))}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    placeholder="اسم فريقك"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">اللاعب الأول (القائد) *</Label>
                  <Input
                    value={registrationForm.player_1_name}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, player_1_name: e.target.value }))}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    placeholder="اسم اللاعب"
                  />
                  <Input
                    value={registrationForm.player_1_id}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, player_1_id: e.target.value }))}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    placeholder="معرف اللعبة (UID)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">اللاعب الثاني</Label>
                  <Input
                    value={registrationForm.player_2_name}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, player_2_name: e.target.value }))}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    placeholder="اسم اللاعب"
                  />
                  <Input
                    value={registrationForm.player_2_id}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, player_2_id: e.target.value }))}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    placeholder="معرف اللعبة (UID)"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">اللاعب الثالث</Label>
                  <Input
                    value={registrationForm.player_3_name}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, player_3_name: e.target.value }))}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    placeholder="اسم اللاعب"
                  />
                  <Input
                    value={registrationForm.player_3_id}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, player_3_id: e.target.value }))}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    placeholder="معرف اللعبة (UID)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">اللاعب الرابع</Label>
                  <Input
                    value={registrationForm.player_4_name}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, player_4_name: e.target.value }))}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    placeholder="اسم اللاعب"
                  />
                  <Input
                    value={registrationForm.player_4_id}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, player_4_id: e.target.value }))}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    placeholder="معرف اللعبة (UID)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">رقم الهاتف *</Label>
                  <Input
                    value={registrationForm.contact_phone}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    placeholder="رقم الهاتف للتواصل"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">البريد الإلكتروني *</Label>
                  <Input
                    value={registrationForm.contact_email}
                    onChange={(e) => setRegistrationForm(prev => ({ ...prev, contact_email: e.target.value }))}
                    className="bg-black/20 border-s3m-red/30 text-white"
                    placeholder="البريد الإلكتروني"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={submitRegistration}
                disabled={registerTeamMutation.isPending}
                className="flex-1 bg-gradient-to-r from-s3m-red to-red-600"
              >
                تسجيل الفريق
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsRegisterDialogOpen(false)}
                className="border-s3m-red/30"
              >
                إلغاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Tournaments;
