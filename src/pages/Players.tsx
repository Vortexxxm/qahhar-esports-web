
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users, Trophy, Filter, ArrowUpDown, Settings, Crown } from 'lucide-react';
import PlayerCard from '@/components/PlayerCard';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Player {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  rank_title: string;
  total_likes: number;
  bio: string;
  leaderboard_scores?: {
    points: number;
    wins: number;
    kills: number;
    deaths: number;
    visible_in_leaderboard: boolean;
  } | null;
}

const Players = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [sortBy, setSortBy] = useState<'total_likes' | 'rank_title' | 'username' | 'points'>('total_likes');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterRank, setFilterRank] = useState<string>('all');
  const [cardStyleFilter, setCardStyleFilter] = useState<string>('all');
  const [weeklyPlayer, setWeeklyPlayer] = useState<string | null>(null);

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    fetchPlayers();
    if (isAdmin) {
      fetchWeeklyPlayer();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (players.length === 0) return;
    
    let filtered = [...players];
    
    // Search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(player =>
        player.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Rank filter
    if (filterRank && filterRank !== 'all') {
      filtered = filtered.filter(player => player.rank_title === filterRank);
    }
    
    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'total_likes') {
        return sortOrder === 'desc' ? (b.total_likes || 0) - (a.total_likes || 0) : (a.total_likes || 0) - (b.total_likes || 0);
      } else if (sortBy === 'points') {
        const pointsA = a.leaderboard_scores?.points || 0;
        const pointsB = b.leaderboard_scores?.points || 0;
        return sortOrder === 'desc' ? pointsB - pointsA : pointsA - pointsB;
      } else if (sortBy === 'rank_title') {
        const rankOrder = { 'Heroic': 4, 'Legend': 3, 'Pro': 2, 'Rookie': 1 };
        const rankA = rankOrder[a.rank_title as keyof typeof rankOrder] || 0;
        const rankB = rankOrder[b.rank_title as keyof typeof rankOrder] || 0;
        return sortOrder === 'desc' ? rankB - rankA : rankA - rankB;
      } else {
        return sortOrder === 'desc' 
          ? (b.username || '').localeCompare(a.username || '') 
          : (a.username || '').localeCompare(b.username || '');
      }
    });
    
    setFilteredPlayers(filtered);
  }, [searchTerm, players, sortBy, sortOrder, filterRank]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, rank_title, total_likes, bio');

      if (profilesError) throw profilesError;

      // Fetch leaderboard scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('leaderboard_scores')
        .select('user_id, points, wins, kills, deaths, visible_in_leaderboard');

      if (scoresError) throw scoresError;

      // Combine data
      const combinedData = profilesData.map(profile => ({
        ...profile,
        leaderboard_scores: scoresData.find(score => score.user_id === profile.id) || null
      }));

      setPlayers(combinedData);
      setFilteredPlayers(combinedData);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyPlayer = async () => {
    try {
      // In a real app, you'd have a separate table for weekly players
      // For now, we'll use a simple approach
      const savedWeeklyPlayer = localStorage.getItem('weeklyPlayer');
      setWeeklyPlayer(savedWeeklyPlayer);
    } catch (error) {
      console.error('Error fetching weekly player:', error);
    }
  };

  const setWeeklyPlayerMutation = useMutation({
    mutationFn: async (playerId: string) => {
      // In a real app, you'd update this in the database
      if (playerId === 'none') {
        localStorage.removeItem('weeklyPlayer');
        setWeeklyPlayer(null);
      } else {
        localStorage.setItem('weeklyPlayer', playerId);
        setWeeklyPlayer(playerId);
      }
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديد لاعب الأسبوع بنجاح",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ playerId, visibility }: { playerId: string; visibility: boolean }) => {
      const { error } = await supabase
        .from('leaderboard_scores')
        .update({ 
          visible_in_leaderboard: visibility,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', playerId);

      if (error) throw error;
    },
    onSuccess: (_, { visibility }) => {
      fetchPlayers(); // Refresh data
      toast({
        title: "تم التحديث",
        description: visibility ? "تم إظهار اللاعب في المتصدرين" : "تم إخفاء اللاعب من المتصدرين",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCardStyle = (player: Player) => {
    if (weeklyPlayer === player.id) return 'weekly';
    
    const points = player.leaderboard_scores?.points || 0;
    
    if (points >= 10000) return 'legend';
    if (points >= 5000) return 'hero';
    if (points >= 2000) return 'champion';
    if (points >= 1000) return 'elite';
    return 'classic';
  };

  const toggleSort = (field: 'total_likes' | 'rank_title' | 'username' | 'points') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('total_likes');
    setSortOrder('desc');
    setFilterRank('all');
    setCardStyleFilter('all');
  };

  const handleToggleVisibility = (playerId: string, currentVisibility: boolean) => {
    toggleVisibilityMutation.mutate({ playerId, visibility: !currentVisibility });
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-s3m-red mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
              لاعبي الفريق
            </h1>
          </div>
          <p className="text-xl text-white/80">اكتشف أفضل اللاعبين وتفاعل معهم</p>
        </div>

        {/* Search and Filters */}
        <Card className="gaming-card mb-8 max-w-6xl mx-auto">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="ابحث عن لاعب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-s3m-red/30 text-white placeholder-gray-400"
                />
              </div>
              
              <Select value={filterRank} onValueChange={setFilterRank}>
                <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
                  <SelectValue placeholder="فلتر الرتبة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الرتب</SelectItem>
                  <SelectItem value="Heroic">Heroic</SelectItem>
                  <SelectItem value="Legend">Legend</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Rookie">Rookie</SelectItem>
                </SelectContent>
              </Select>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-s3m-red/30 text-white">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    ترتيب حسب
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>ترتيب حسب</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toggleSort('total_likes')}>
                    الإعجابات {sortBy === 'total_likes' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort('points')}>
                    النقاط {sortBy === 'points' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort('rank_title')}>
                    الرتبة {sortBy === 'rank_title' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort('username')}>
                    اسم المستخدم {sortBy === 'username' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="text-s3m-red hover:text-white hover:bg-s3m-red/20"
              >
                مسح الفلاتر
              </Button>
            </div>

            {/* Admin Controls */}
            {isAdmin && (
              <div className="border-t border-s3m-red/20 pt-4">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  إعدادات الإدارة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/80 text-sm block mb-2">تحديد لاعب الأسبوع:</label>
                    <Select value={weeklyPlayer || "none"} onValueChange={(value) => setWeeklyPlayerMutation.mutate(value)}>
                      <SelectTrigger className="bg-black/20 border-s3m-red/30 text-white">
                        <SelectValue placeholder="اختر لاعب الأسبوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون لاعب أسبوع</SelectItem>
                        {players.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.username || player.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="gaming-card">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-s3m-red mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{players.length}</div>
              <div className="text-gray-400">إجمالي اللاعبين</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {players.filter(p => p.rank_title === 'Heroic').length}
              </div>
              <div className="text-gray-400">أبطال مميزون</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card">
            <CardContent className="p-6 text-center">
              <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {weeklyPlayer ? '1' : '0'}
              </div>
              <div className="text-gray-400">لاعب الأسبوع</div>
            </CardContent>
          </Card>
        </div>

        {/* Players Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-800 rounded-lg h-96"></div>
            ))}
          </div>
        ) : (
          <>
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  لا توجد نتائج
                </h3>
                <p className="text-gray-400">
                  جرب البحث بكلمات مختلفة أو تغيير الفلاتر
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    cardStyle={getCardStyle(player)}
                    isAdmin={isAdmin}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Players;
