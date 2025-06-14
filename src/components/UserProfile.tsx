
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Trophy, Target, Gamepad2, Star, Shield, Zap, Award, Crown, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfileData {
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
  } | null;
}

interface UserProfileProps {
  userId: string;
  compact?: boolean;
}

const UserProfile = ({ userId, compact = false }: UserProfileProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    if (user) {
      checkIfLiked();
    }
  }, [userId, user]);

  const fetchUserProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          rank_title,
          total_likes,
          bio
        `)
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard_scores')
        .select(`
          points,
          wins,
          kills,
          deaths
        `)
        .eq('user_id', userId)
        .single();

      const userData: UserProfileData = {
        ...profileData,
        leaderboard_scores: leaderboardError ? null : leaderboardData
      };
      
      setProfileData(userData);
      setLikesCount(userData.total_likes || 0);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('liked_user_id', userId)
        .single();

      setIsLiked(!!data);
    } catch (error) {
      setIsLiked(false);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للتفاعل مع الملفات الشخصية",
        variant: "destructive",
      });
      return;
    }

    if (user.id === userId) {
      toast({
        title: "غير مسموح",
        description: "لا يمكنك الإعجاب بملفك الشخصي",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('liked_user_id', userId);

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from('user_likes')
          .insert({
            user_id: user.id,
            liked_user_id: userId
          });

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التفاعل مع الملف الشخصي",
        variant: "destructive",
      });
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Heroic': return <Crown className="w-5 h-5" />;
      case 'Legend': return <Shield className="w-5 h-5" />;
      case 'Pro': return <Award className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getRankColors = (rank: string) => {
    switch (rank) {
      case 'Heroic':
        return {
          bg: 'from-yellow-500/20 via-orange-500/20 to-red-500/20',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          glow: 'shadow-yellow-500/20',
          badge: 'bg-gradient-to-r from-yellow-500 to-orange-500'
        };
      case 'Legend':
        return {
          bg: 'from-purple-500/20 via-pink-500/20 to-purple-500/20',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          glow: 'shadow-purple-500/20',
          badge: 'bg-gradient-to-r from-purple-500 to-pink-500'
        };
      case 'Pro':
        return {
          bg: 'from-blue-500/20 via-cyan-500/20 to-blue-500/20',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          glow: 'shadow-blue-500/20',
          badge: 'bg-gradient-to-r from-blue-500 to-cyan-500'
        };
      default:
        return {
          bg: 'from-gray-500/20 via-gray-600/20 to-gray-500/20',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          glow: 'shadow-gray-500/20',
          badge: 'bg-gradient-to-r from-gray-500 to-gray-600'
        };
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <Card className="h-80 bg-gradient-to-br from-gray-900 to-black border-gray-800">
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-16 h-16 bg-gray-800 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-800 rounded w-32"></div>
                <div className="h-4 bg-gray-800 rounded w-20"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!profileData) {
    return <div className="text-center text-gray-500">الملف الشخصي غير موجود</div>;
  }

  const { leaderboard_scores } = profileData;
  const stats = leaderboard_scores || { points: 0, wins: 0, kills: 0, deaths: 0 };
  const rankColors = getRankColors(profileData.rank_title);

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Main Card */}
      <Card className={`relative overflow-hidden bg-gradient-to-br ${rankColors.bg} backdrop-blur-sm ${rankColors.border} border-2 ${rankColors.glow} shadow-2xl transition-all duration-500 hover:scale-105 group`}>
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80"></div>
        <div className={`absolute inset-0 bg-gradient-to-r ${rankColors.bg} opacity-50 group-hover:opacity-70 transition-opacity duration-500`}></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-4 left-4 w-2 h-2 ${rankColors.text} rounded-full opacity-60 animate-ping`}></div>
          <div className={`absolute top-8 right-6 w-1 h-1 ${rankColors.text} rounded-full opacity-40 animate-pulse delay-300`}></div>
          <div className={`absolute bottom-6 left-8 w-1.5 h-1.5 ${rankColors.text} rounded-full opacity-50 animate-bounce delay-500`}></div>
          <div className={`absolute bottom-8 right-4 w-1 h-1 ${rankColors.text} rounded-full opacity-60 animate-ping delay-700`}></div>
        </div>

        {/* Header Section */}
        <div className="relative z-10 p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Avatar with Glow */}
              <div className="relative">
                <div className={`absolute -inset-2 ${rankColors.badge} rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-300`}></div>
                <Avatar className={`relative w-16 h-16 ${rankColors.border} border-2 shadow-lg`}>
                  <AvatarImage src={profileData.avatar_url || ""} />
                  <AvatarFallback className={`${rankColors.badge} text-white font-bold text-lg`}>
                    {(profileData.username || profileData.full_name || 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Rank Icon */}
                <div className={`absolute -top-1 -right-1 ${rankColors.badge} rounded-full p-1.5 shadow-lg`}>
                  {getRankIcon(profileData.rank_title)}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate mb-1">
                  {profileData.username || profileData.full_name}
                </h3>
                <Badge className={`${rankColors.badge} text-white text-xs px-2 py-1 font-semibold`}>
                  {getRankIcon(profileData.rank_title)}
                  <span className="mr-1">{profileData.rank_title}</span>
                </Badge>
              </div>
            </div>

            {/* Like Button */}
            <Button
              onClick={toggleLike}
              variant="ghost"
              size="sm"
              className={`relative ${
                isLiked 
                  ? 'text-red-400 hover:text-red-300 bg-red-500/10' 
                  : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
              } rounded-lg transition-all duration-300 group/btn`}
            >
              <div className="flex flex-col items-center space-y-1">
                <Heart className={`h-5 w-5 transition-all duration-300 ${isLiked ? 'fill-current scale-110' : 'group-hover/btn:scale-110'}`} />
                <span className="text-xs font-medium">{likesCount}</span>
              </div>
            </Button>
          </div>

          {/* Bio */}
          {profileData.bio && !compact && (
            <div className="mb-4">
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">{profileData.bio}</p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        {!compact && (
          <div className="relative z-10 px-6 pb-6">
            <div className="grid grid-cols-3 gap-3">
              {/* Points */}
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10 hover:bg-black/40 transition-colors duration-300">
                <Gamepad2 className={`h-4 w-4 ${rankColors.text} mx-auto mb-1`} />
                <div className="text-lg font-bold text-white">{stats.points}</div>
                <div className="text-xs text-gray-400">نقاط</div>
              </div>
              
              {/* Wins */}
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10 hover:bg-black/40 transition-colors duration-300">
                <Trophy className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{stats.wins}</div>
                <div className="text-xs text-gray-400">فوز</div>
              </div>
              
              {/* K/D Ratio */}
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10 hover:bg-black/40 transition-colors duration-300">
                <Target className="h-4 w-4 text-red-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">
                  {stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(1) : stats.kills.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">K/D</div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Glow */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${rankColors.badge} opacity-50`}></div>
      </Card>
    </div>
  );
};

export default UserProfile;
