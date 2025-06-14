
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Gamepad2, Star, Crown, Flame, Zap, Sparkles } from 'lucide-react';
import LikeButton from '@/components/LikeButton';

interface WeeklyPlayerData {
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

interface WeeklyPlayerCardProps {
  player: WeeklyPlayerData;
  onEdit?: (player: WeeklyPlayerData) => void;
  onToggleVisibility?: (playerId: string, currentVisibility: boolean) => void;
  isAdmin?: boolean;
}

const WeeklyPlayerCard = ({ 
  player, 
  onEdit, 
  onToggleVisibility,
  isAdmin = false 
}: WeeklyPlayerCardProps) => {
  const { user } = useAuth();

  const { leaderboard_scores } = player;
  const stats = leaderboard_scores || { points: 0, wins: 0, kills: 0, deaths: 0, visible_in_leaderboard: false };

  const getKDRatio = (kills: number, deaths: number) => {
    if (deaths === 0) return kills > 0 ? kills.toFixed(1) : "0.0";
    return (kills / deaths).toFixed(1);
  };

  return (
    <div className="relative group mb-8 w-full max-w-md mx-auto">
      {/* Outer glow effect with fire colors */}
      <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
      <div className="absolute -inset-2 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-1000 animate-pulse delay-75"></div>
      
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500 via-orange-600 to-red-700 border-4 border-yellow-300 shadow-2xl transform hover:scale-105 transition-all duration-500">
        {/* Animated fire particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-300 rounded-full animate-bounce opacity-80"></div>
          <div className="absolute top-6 right-6 w-2 h-2 bg-orange-300 rounded-full animate-ping delay-300"></div>
          <div className="absolute bottom-8 left-8 w-2.5 h-2.5 bg-red-300 rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-1/2 right-4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-12 right-12 w-2 h-2 bg-orange-400 rounded-full animate-ping delay-1000"></div>
        </div>

        {/* Animated background waves */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/10 to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-orange-300/10 to-transparent animate-pulse delay-500"></div>

        {/* Header */}
        <div className="relative pt-16 pb-6 px-6 text-center bg-gradient-to-b from-yellow-600/20 to-transparent">
          <div className="relative">
            {/* Avatar with multiple glow layers */}
            <div className="relative mx-auto mb-4">
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full blur-lg animate-pulse"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full blur animate-pulse delay-300"></div>
              <Avatar className="relative w-24 h-24 md:w-28 md:h-28 border-6 border-yellow-200 shadow-2xl mx-auto">
                <AvatarImage src={player.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-600 text-yellow-100 text-2xl md:text-3xl font-bold">
                  {(player.username || player.full_name || 'U').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Fire effect around avatar */}
              <div className="absolute -inset-1 rounded-full">
                <Flame className="absolute top-0 left-1/4 w-5 h-5 md:w-6 md:h-6 text-orange-400 animate-bounce" />
                <Flame className="absolute top-1/4 right-0 w-4 h-4 md:w-5 md:h-5 text-red-400 animate-pulse delay-300" />
                <Flame className="absolute bottom-1/4 left-0 w-4 h-4 md:w-5 md:h-5 text-yellow-400 animate-bounce delay-500" />
                <Zap className="absolute bottom-0 right-1/4 w-5 h-5 md:w-6 md:h-6 text-yellow-300 animate-ping delay-700" />
              </div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold text-yellow-100 mb-2 drop-shadow-lg">
              {player.username || player.full_name}
            </h3>
            
            <Badge className="bg-gradient-to-r from-yellow-300 to-orange-300 text-orange-900 font-bold text-sm md:text-base px-3 md:px-4 py-1 md:py-2 shadow-lg">
              <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              لاعب الأسبوع
            </Badge>
          </div>
        </div>

        {/* Enhanced Stats Section - Mobile Optimized */}
        <div className="px-4 md:px-6 pb-6 space-y-3 md:space-y-4">
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div className="bg-gradient-to-br from-yellow-200/20 to-orange-200/20 backdrop-blur-sm border-2 border-yellow-300/50 rounded-xl p-3 md:p-4 text-center group/stat hover:scale-105 transition-transform duration-300">
              <Trophy className="h-5 w-5 md:h-6 md:w-6 text-yellow-200 mx-auto mb-1 md:mb-2 group-hover/stat:animate-bounce" />
              <div className="text-xl md:text-2xl font-bold text-yellow-100">{stats.wins}</div>
              <div className="text-xs text-yellow-200 font-medium">انتصارات</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-200/20 to-red-200/20 backdrop-blur-sm border-2 border-orange-300/50 rounded-xl p-3 md:p-4 text-center group/stat hover:scale-105 transition-transform duration-300">
              <Target className="h-5 w-5 md:h-6 md:w-6 text-orange-200 mx-auto mb-1 md:mb-2 group-hover/stat:animate-bounce" />
              <div className="text-xl md:text-2xl font-bold text-orange-100">{getKDRatio(stats.kills, stats.deaths)}</div>
              <div className="text-xs text-orange-200 font-medium">K/D</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-200/20 to-yellow-200/20 backdrop-blur-sm border-2 border-red-300/50 rounded-xl p-4 md:p-4 text-center group/stat hover:scale-105 transition-transform duration-300">
            <Gamepad2 className="h-6 w-6 text-red-200 mx-auto mb-2 group-hover/stat:animate-bounce" />
            <div className="text-2xl md:text-3xl font-bold text-red-100">{stats.points}</div>
            <div className="text-xs text-red-200 font-medium">النقاط الإجمالية</div>
          </div>

          {/* Bio Section */}
          {player.bio && (
            <div className="bg-gradient-to-br from-black/30 to-yellow-900/20 backdrop-blur-sm border-2 border-yellow-400/30 rounded-xl p-3 md:p-4">
              <p className="text-yellow-100 text-xs md:text-sm text-center font-medium">{player.bio}</p>
            </div>
          )}

          {/* Like Button */}
          <div className="flex justify-center pt-2">
            <LikeButton 
              targetUserId={player.id}
              initialLikes={player.total_likes}
              variant="large"
              className="relative overflow-hidden group/btn transition-all duration-300 text-yellow-200 hover:text-yellow-100 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl px-4 md:px-6 py-2 md:py-3 border-2 border-yellow-400/50 hover:border-yellow-300/70"
            />
          </div>
        </div>

        {/* Bottom fire effect */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 opacity-80"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse"></div>
      </div>

      {/* Floating elements around the card */}
      <div className="absolute -top-4 -left-4 w-6 h-6 md:w-8 md:h-8 bg-yellow-400 rounded-full opacity-60 animate-bounce delay-200"></div>
      <div className="absolute -top-2 -right-6 w-4 h-4 md:w-6 md:h-6 bg-orange-400 rounded-full opacity-50 animate-ping delay-500"></div>
      <div className="absolute -bottom-4 -right-4 w-5 h-5 md:w-7 md:h-7 bg-red-400 rounded-full opacity-60 animate-pulse delay-800"></div>
      <div className="absolute -bottom-2 -left-6 w-4 h-4 md:w-5 md:h-5 bg-yellow-500 rounded-full opacity-50 animate-bounce delay-1000"></div>
    </div>
  );
};

export default WeeklyPlayerCard;
