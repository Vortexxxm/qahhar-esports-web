
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users, Trophy, Filter, ArrowUpDown } from 'lucide-react';
import UserProfile from '@/components/UserProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Player {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  rank_title: string;
  total_likes: number;
}

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [sortBy, setSortBy] = useState<'total_likes' | 'rank_title' | 'username'>('total_likes');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterRank, setFilterRank] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (players.length === 0) return;
    
    // Apply filters
    let filtered = [...players];
    
    // Search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(player =>
        player.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Rank filter
    if (filterRank) {
      filtered = filtered.filter(player => player.rank_title === filterRank);
    }
    
    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'total_likes') {
        return sortOrder === 'desc' ? (b.total_likes || 0) - (a.total_likes || 0) : (a.total_likes || 0) - (b.total_likes || 0);
      } else if (sortBy === 'rank_title') {
        const rankOrder = { 'Heroic': 3, 'Pro': 2, 'Rookie': 1 };
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
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, rank_title, total_likes')
        .order('total_likes', { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
      setFilteredPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle sort order or change sort field
  const toggleSort = (field: 'total_likes' | 'rank_title' | 'username') => {
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
    setFilterRank(null);
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
        <Card className="gaming-card mb-8 max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="ابحث عن لاعب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/20 border-s3m-red/30 text-white placeholder-gray-400"
                />
              </div>
              
              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-s3m-red/30 text-white">
                    <Filter className="mr-2 h-4 w-4" />
                    فلتر الرتبة
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>اختر الرتبة</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterRank('Heroic')}>Heroic</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRank('Pro')}>Pro</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRank('Rookie')}>Rookie</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterRank(null)}>عرض الكل</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-s3m-red/30 text-white">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    {sortOrder === 'desc' ? 'تنازلي' : 'تصاعدي'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>ترتيب حسب</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toggleSort('total_likes')}>
                    الإعجابات {sortBy === 'total_likes' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort('rank_title')}>
                    الرتبة {sortBy === 'rank_title' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort('username')}>
                    اسم المستخدم {sortBy === 'username' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Clear Filters */}
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="text-s3m-red hover:text-white hover:bg-s3m-red/20"
              >
                مسح الفلاتر
              </Button>
            </div>
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
              <div className="text-2xl font-bold text-s3m-red">
                {players.reduce((sum, p) => sum + (p.total_likes || 0), 0)}
              </div>
              <div className="text-gray-400">إجمالي الإعجابات</div>
            </CardContent>
          </Card>
        </div>

        {/* Players Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-800 rounded-lg h-64"></div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map((player) => (
                  <UserProfile
                    key={player.id}
                    userId={player.id}
                    compact={false}
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
