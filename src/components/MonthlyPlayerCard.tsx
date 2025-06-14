
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Gamepad2, Star, Crown, Flame, Zap, Sparkles, Award, Shield, Gem } from 'lucide-react';
import LikeButton from '@/components/LikeButton';

interface MonthlyPlayerData {
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

interface MonthlyPlayerCardProps {
  player: MonthlyPlayerData;
  onEdit?: (player: MonthlyPlayerData) => void;
  onToggleVisibility?: (playerId: string, currentVisibility: boolean) => void;
  isAdmin?: boolean;
}

const MonthlyPlayerCard = ({ 
  player, 
  onEdit, 
  onToggleVisibility,
  isAdmin = false 
}: MonthlyPlayerCardProps) => {
  const { user } = useAuth();

  const { leaderboard_scores } = player;
  const stats = leaderboard_scores || { points: 0, wins: 0, kills: 0, deaths: 0, visible_in_leaderboard: false };

  const getKDRatio = (kills: number, deaths: number) => {
    if (deaths === 0) return kills > 0 ? kills.toFixed(1) : "0.0";
    return (kills / deaths).toFixed(1);
  };

  return (
    <div className="relative group mb-8 w-full max-w-md mx-auto">
      {/* Multiple Outer Glow Layers for Depth */}
      <div className="absolute -inset-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition duration-1000 animate-pulse"></div>
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition duration-1000 animate-pulse delay-150"></div>
      <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-300 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse delay-300"></div>
      
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-blue-800 to-cyan-800 border-4 border-purple-300 shadow-2xl transform hover:scale-105 transition-all duration-700">
        {/* Animated Background Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Gems */}
          <div className="absolute top-6 left-6 w-4 h-4 bg-purple-300 rounded-full animate-bounce opacity-70"></div>
          <div className="absolute top-8 right-8 w-3 h-3 bg-blue-300 rounded-full animate-ping delay-300 opacity-60"></div>
          <div className="absolute bottom-10 left-10 w-3.5 h-3.5 bg-cyan-300 rounded-full animate-pulse delay-500 opacity-80"></div>
          <div className="absolute top-1/2 right-6 w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce delay-700 opacity-70"></div>
          <div className="absolute bottom-16 right-16 w-3 h-3 bg-blue-400 rounded-full animate-ping delay-1000 opacity-60"></div>
          
          {/* Rotating Background Elements */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-purple-400/20 rounded-full animate-spin"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-blue-400/20 rounded-full animate-spin animate-reverse"></div>
        </div>

        {/* Animated Background Waves */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/10 to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-blue-300/10 to-transparent animate-pulse delay-500"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-300/10 to-transparent animate-pulse delay-1000"></div>

        {/* Header */}
        <div className="relative pt-16 md:pt-20 pb-6 md:pb-8 px-6 md:px-8 text-center bg-gradient-to-b from-purple-600/30 via-blue-600/20 to-transparent">
          <div className="relative">
            {/* Avatar with Multiple Glow Layers */}
            <div className="relative mx-auto mb-4 md:mb-6">
              <div className="absolute -inset-6 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 rounded-full blur-xl animate-pulse opacity-70"></div>
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 rounded-full blur-lg animate-pulse delay-300 opacity-60"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-200 via-blue-200 to-cyan-200 rounded-full blur animate-pulse delay-600 opacity-50"></div>
              <Avatar className="relative w-28 h-28 md:w-32 md:h-32 border-6 border-purple-200 shadow-2xl mx-auto">
                <AvatarImage src={player.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-600 text-purple-100 text-3xl md:text-4xl font-bold">
                  {(player.username || player.full_name || 'U').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Floating Icons Around Avatar */}
              <div className="absolute -inset-2 rounded-full">
                <Shield className="absolute top-2 left-1/4 w-6 h-6 md:w-7 md:h-7 text-purple-300 animate-bounce" />
                <Award className="absolute top-1/4 right-2 w-5 h-5 md:w-6 md:h-6 text-blue-300 animate-pulse delay-300" />
                <Star className="absolute bottom-1/4 left-2 w-5 h-5 md:w-6 md:h-6 text-cyan-300 animate-bounce delay-500" />
                <Gem className="absolute bottom-2 right-1/4 w-6 h-6 md:w-7 md:h-7 text-purple-200 animate-ping delay-700" />
                <Sparkles className="absolute top-1/2 left-0 w-4 h-4 md:w-5 md:h-5 text-blue-200 animate-pulse delay-900" />
                <Flame className="absolute top-1/2 right-0 w-4 h-4 md:w-5 md:h-5 text-cyan-200 animate-bounce delay-1100" />
              </div>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-purple-100 mb-2 md:mb-3 drop-shadow-2xl">
              {player.username || player.full_name}
            </h3>
            
            <Badge className="bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 text-purple-900 font-bold text-base md:text-lg px-4 md:px-6 py-2 md:py-3 shadow-xl border-2 border-purple-200">
              <Shield className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              لاعب الشهر
              <Star className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            </Badge>
          </div>
        </div>

        {/* Enhanced Stats Section - Mobile Optimized */}
        <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-4 md:space-y-6">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="bg-gradient-to-br from-purple-200/20 via-blue-200/20 to-purple-200/20 backdrop-blur-sm border-2 border-purple-300/50 rounded-xl p-4 md:p-5 text-center group/stat hover:scale-105 transition-transform duration-300">
              <Trophy className="h-6 w-6 md:h-7 md:w-7 text-purple-200 mx-auto mb-2 md:mb-3 group-hover/stat:animate-bounce" />
              <div className="text-2xl md:text-3xl font-bold text-purple-100">{stats.wins}</div>
              <div className="text-xs md:text-sm text-purple-200 font-medium">انتصارات</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-200/20 via-cyan-200/20 to-blue-200/20 backdrop-blur-sm border-2 border-blue-300/50 rounded-xl p-4 md:p-5 text-center group/stat hover:scale-105 transition-transform duration-300">
              <Target className="h-6 w-6 md:h-7 md:w-7 text-blue-200 mx-auto mb-2 md:mb-3 group-hover/stat:animate-bounce" />
              <div className="text-2xl md:text-3xl font-bold text-blue-100">{getKDRatio(stats.kills, stats.deaths)}</div>
              <div className="text-xs md:text-sm text-blue-200 font-medium">K/D</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-200/20 via-purple-200/20 to-cyan-200/20 backdrop-blur-sm border-2 border-cyan-300/50 rounded-xl p-5 md:p-6 text-center group/stat hover:scale-105 transition-transform duration-300">
            <Gamepad2 className="h-7 w-7 md:h-8 md:w-8 text-cyan-200 mx-auto mb-2 md:mb-3 group-hover/stat:animate-bounce" />
            <div className="text-3xl md:text-4xl font-bold text-cyan-100">{stats.points}</div>
            <div className="text-xs md:text-sm text-cyan-200 font-medium">النقاط الإجمالية</div>
          </div>

          {/* Bio Section */}
          {player.bio && (
            <div className="bg-gradient-to-br from-black/40 via-purple-900/30 to-black/40 backdrop-blur-sm border-2 border-purple-400/30 rounded-xl p-4 md:p-5">
              <p className="text-purple-100 text-xs md:text-sm text-center font-medium leading-relaxed">{player.bio}</p>
            </div>
          )}

          {/* Like Button */}
          <div className="flex justify-center pt-2 md:pt-4">
            <LikeButton 
              targetUserId={player.id}
              initialLikes={player.total_likes}
              variant="large"
              className="relative overflow-hidden group/btn transition-all duration-500 text-purple-200 hover:text-purple-100 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl px-6 md:px-8 py-3 md:py-4 border-2 border-purple-400/50 hover:border-purple-300/70"
            />
          </div>
        </div>

        {/* Bottom Magical Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-80"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 animate-pulse delay-300"></div>
      </div>

      {/* Floating Magical Elements Around Card */}
      <div className="absolute -top-6 -left-6 w-8 h-8 md:w-10 md:h-10 bg-purple-400 rounded-full opacity-50 animate-bounce delay-200"></div>
      <div className="absolute -top-4 -right-8 w-6 h-6 md:w-8 md:h-8 bg-blue-400 rounded-full opacity-40 animate-ping delay-500"></div>
      <div className="absolute -bottom-6 -right-6 w-7 h-7 md:w-9 md:h-9 bg-cyan-400 rounded-full opacity-50 animate-pulse delay-800"></div>
      <div className="absolute -bottom-4 -left-8 w-5 h-5 md:w-7 md:h-7 bg-purple-500 rounded-full opacity-40 animate-bounce delay-1000"></div>
      
      {/* Orbiting Elements */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 pointer-events-none">
        <div className="absolute top-0 left-1/2 w-3 h-3 bg-purple-300 rounded-full opacity-60 animate-spin origin-40"></div>
        <div className="absolute bottom-0 right-1/2 w-2 h-2 bg-blue-300 rounded-full opacity-40 animate-spin origin-40 animate-reverse"></div>
      </div>
    </div>
  );
};

export default MonthlyPlayerCard;
