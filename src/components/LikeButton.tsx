
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LikeButtonProps {
  targetUserId: string;
  initialLikes: number;
  variant?: 'default' | 'card' | 'large';
  className?: string;
}

const LikeButton = ({ 
  targetUserId, 
  initialLikes, 
  variant = 'default',
  className = ""
}: LikeButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [targetUserId, user]);

  const checkIfLiked = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('liked_user_id', targetUserId)
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

    if (user.id === targetUserId) {
      toast({
        title: "غير مسموح",
        description: "لا يمكنك الإعجاب بملفك الشخصي",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLiked) {
        // حذف اللايك
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('liked_user_id', targetUserId);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // إضافة لايك
        const { error } = await supabase
          .from('user_likes')
          .insert({
            user_id: user.id,
            liked_user_id: targetUserId
          });

        if (error) throw error;

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
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (variant) {
      case 'large':
        return 'lg';
      case 'card':
        return 'sm';
      default:
        return 'default';
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'large':
        return 'h-6 w-6';
      case 'card':
        return 'h-4 w-4';
      default:
        return 'h-5 w-5';
    }
  };

  return (
    <Button
      onClick={toggleLike}
      variant="ghost"
      size={getButtonSize()}
      disabled={isLoading}
      className={`flex items-center space-x-2 ${
        isLiked ? 'text-red-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
      } ${className}`}
    >
      <Heart className={`${getIconSize()} ${isLiked ? 'fill-current' : ''} transition-all duration-200`} />
      <span className="font-semibold">{likesCount}</span>
    </Button>
  );
};

export default LikeButton;
