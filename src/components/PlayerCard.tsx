
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Gamepad2, Crown, Medal, Award, Star, Calendar, Edit, Eye, EyeOff } from 'lucide-react';
import LikeButton from '@/components/LikeButton';

interface PlayerCardData {
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

interface PlayerCardProps {
  player: PlayerCardData;
  cardStyle?: 'classic' | 'hero' | 'legend' | 'champion' | 'elite' | 'weekly' | 'monthly';
  onEdit?: (player: PlayerCardData) => void;
  onToggleVisibility?: (playerId: string, currentVisibility: boolean) => void;
  onSetWeeklyPlayer?: (playerId: string) => void;
  onSetMonthlyPlayer?: (playerId: string) => void;
  isAdmin?: boolean;
}

const PlayerCard = ({ 
  player, 
  cardStyle = 'classic', 
  onEdit, 
  onToggleVisibility,
  onSetWeeklyPlayer,
  onSetMonthlyPlayer,
  isAdmin = false 
}: PlayerCardProps) => {
  const { user } = useAuth();

  const getCardStyles = () => {
    switch (cardStyle) {
      case 'weekly':
        return {
          containerClass: "relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-600 border-4 border-yellow-300",
          headerGradient: "bg-gradient-to-r from-yellow-600 to-orange-700",
          accentColor: "text-yellow-100",
          glowEffect: "shadow-yellow-500/50",
          specialEffect: "animate-pulse"
        };
      case 'monthly':
        return {
          containerClass: "relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-purple-400 via-purple-500 to-pink-600 border-4 border-purple-300",
          headerGradient: "bg-gradient-to-r from-purple-600 to-pink-700",
          accentColor: "text-purple-100",
          glowEffect: "shadow-purple-500/50",
          specialEffect: "animate-pulse"
        };
      case 'hero':
        return {
          containerClass: "relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-red-600 via-red-700 to-red-800 border-4 border-red-400",
          headerGradient: "bg-gradient-to-r from-red-700 to-red-900",
          accentColor: "text-red-100",
          glowEffect: "shadow-red-500/50",
          specialEffect: ""
        };
      case 'legend':
        return {
          containerClass: "relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 border-4 border-purple-400",
          headerGradient: "bg-gradient-to-r from-purple-700 to-purple-900",
          accentColor: "text-purple-100",
          glowEffect: "shadow-purple-500/50",
          specialEffect: ""
        };
      case 'champion':
        return {
          containerClass: "relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 border-4 border-blue-400",
          headerGradient: "bg-gradient-to-r from-blue-700 to-blue-900",
          accentColor: "text-blue-100",
          glowEffect: "shadow-blue-500/50",
          specialEffect: ""
        };
      case 'elite':
        return {
          containerClass: "relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-green-600 via-green-700 to-green-900 border-4 border-green-400",
          headerGradient: "bg-gradient-to-r from-green-700 to-green-900",
          accentColor: "text-green-100",
          glowEffect: "shadow-green-500/50",
          specialEffect: ""
        };
      default: // classic
        return {
          containerClass: "relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-gray-800 via-gray-900 to-black border-4 border-gray-600",
          headerGradient: "bg-gradient-to-r from-gray-700 to-gray-900",
          accentColor: "text-gray-100",
          glowEffect: "shadow-gray-500/30",
          specialEffect: ""
        };
    }
  };

  const styles = getCardStyles();
  const { leaderboard_scores } = player;
  const stats = leaderboard_scores || { points: 0, wins: 0, kills: 0, deaths: 0, visible_in_leaderboard: false };

  const getKDRatio = (kills: number, deaths: number) => {
    if (deaths === 0) return kills > 0 ? kills.toFixed(1) : "0.0";
    return (kills / deaths).toFixed(1);
  };

  return (
    <div className={`${styles.containerClass} ${styles.glowEffect} ${styles.specialEffect} w-full max-w-sm mx-auto`}>
      {/* Special Effects for weekly and monthly players */}
      {cardStyle === 'weekly' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent animate-pulse"></div>
          <div className="absolute top-4 right-4">
            <Crown className="h-8 w-8 text-yellow-200 animate-bounce" />
          </div>
          <div className="absolute top-4 left-4">
            <Star className="h-6 w-6 text-yellow-200 animate-pulse" />
          </div>
        </>
      )}

      {cardStyle === 'monthly' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/20 to-transparent animate-pulse"></div>
          <div className="absolute top-4 right-4">
            <Calendar className="h-8 w-8 text-purple-200 animate-bounce" />
          </div>
          <div className="absolute top-4 left-4">
            <Star className="h-6 w-6 text-purple-200 animate-pulse" />
          </div>
        </>
      )}

      {/* Header */}
      <div className={`${styles.headerGradient} p-4 text-center relative`}>
        {cardStyle === 'weekly' && (
          <Badge className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-yellow-200 text-yellow-900 font-bold text-xs">
            لاعب الأسبوع ⭐
          </Badge>
        )}
        
        {cardStyle === 'monthly' && (
          <Badge className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-purple-200 text-purple-900 font-bold text-xs">
            لاعب الشهر 👑
          </Badge>
        )}
        
        <div className="mt-4">
          <Avatar className="w-24 h-24 mx-auto border-4 border-white/30 shadow-xl">
            <AvatarImage src={player.avatar_url || ""} />
            <AvatarFallback className={`${styles.accentColor} text-2xl font-bold`}>
              {(player.username || player.full_name || 'U').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h3 className={`${styles.accentColor} text-xl font-bold mt-3 truncate`}>
            {player.username || player.full_name}
          </h3>
          
          <Badge className={`mt-2 ${
            player.rank_title === 'Heroic' ? 'bg-gradient-to-r from-yellow-500 to-red-500' :
            player.rank_title === 'Legend' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
            player.rank_title === 'Pro' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
            'bg-gradient-to-r from-gray-500 to-gray-600'
          } text-white font-bold`}>
            {player.rank_title}
          </Badge>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-black/30 rounded-lg p-3">
            <Trophy className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{stats.wins}</div>
            <div className="text-xs text-gray-400">انتصارات</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3">
            <Target className="h-5 w-5 text-red-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-white">{getKDRatio(stats.kills, stats.deaths)}</div>
            <div className="text-xs text-gray-400">K/D</div>
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-3 text-center">
          <Gamepad2 className="h-5 w-5 text-blue-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-white">{stats.points}</div>
          <div className="text-xs text-gray-400">النقاط الإجمالية</div>
        </div>

        {/* Bio Section */}
        {player.bio && (
          <div className="bg-black/20 rounded-lg p-3">
            <p className="text-gray-300 text-sm text-center">{player.bio}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          <LikeButton 
            targetUserId={player.id}
            initialLikes={player.total_likes}
            variant="card"
          />

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex space-x-2">
              {onSetWeeklyPlayer && cardStyle !== 'weekly' && (
                <Button
                  onClick={() => onSetWeeklyPlayer(player.id)}
                  variant="ghost"
                  size="sm"
                  className="text-yellow-400 hover:text-yellow-300"
                  title="تحديد كلاعب أسبوع"
                >
                  <Crown className="h-4 w-4" />
                </Button>
              )}
              
              {onSetMonthlyPlayer && cardStyle !== 'monthly' && (
                <Button
                  onClick={() => onSetMonthlyPlayer(player.id)}
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-purple-300"
                  title="تحديد كلاعب شهر"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                onClick={() => onEdit?.(player)}
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:text-blue-300"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={() => onToggleVisibility?.(player.id, stats.visible_in_leaderboard)}
                variant="ghost"
                size="sm"
                className={`${
                  stats.visible_in_leaderboard 
                    ? 'text-green-400 hover:text-green-300' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {stats.visible_in_leaderboard ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Special footers for weekly and monthly cards */}
      {cardStyle === 'weekly' && (
        <div className="bg-gradient-to-r from-yellow-600 to-orange-700 p-2 text-center">
          <p className="text-yellow-100 text-xs font-bold">⭐ متميز هذا الأسبوع ⭐</p>
        </div>
      )}

      {cardStyle === 'monthly' && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-700 p-2 text-center">
          <p className="text-purple-100 text-xs font-bold">👑 متميز هذا الشهر 👑</p>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
