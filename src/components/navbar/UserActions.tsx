
import { Button } from '@/components/ui/button';
import { LogIn, User, LogOut, Settings, Crown, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import NotificationsPopover from '@/components/NotificationsPopover';
import { motion } from 'framer-motion';

const UserActions = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/');
    }
  };

  if (!user) {
    return (
      <motion.div 
        className="flex items-center space-x-3 rtl:space-x-reverse"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          onClick={() => navigate('/login')}
          variant="ghost"
          className="text-white hover:text-s3m-red hover:bg-white/10 border border-transparent hover:border-s3m-red/30 rounded-xl transition-all duration-300 px-6 py-2 font-medium"
        >
          <LogIn className="w-4 h-4 ml-2" />
          دخول
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex items-center space-x-4 rtl:space-x-reverse"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Notifications */}
      <NotificationsPopover />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-transparent hover:border-s3m-red/50 transition-all duration-300">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
              <AvatarFallback className="bg-gradient-to-br from-s3m-red to-red-600 text-white font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {userRole === 'admin' && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs flex items-center justify-center">
                <Crown className="h-3 w-3" />
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-900/95 border-gray-700 backdrop-blur-sm" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-white">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs leading-none text-gray-400">
                {user.email}
              </p>
              {userRole && (
                <Badge className="w-fit bg-gradient-to-r from-s3m-red to-red-600 text-white text-xs">
                  {userRole === 'admin' ? 'مدير' : 'عضو'}
                </Badge>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => navigate('/profile')}
              className="text-white hover:bg-gray-800 cursor-pointer"
            >
              <User className="ml-2 h-4 w-4" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
            {userRole === 'admin' && (
              <DropdownMenuItem 
                onClick={() => navigate('/admin')}
                className="text-white hover:bg-gray-800 cursor-pointer"
              >
                <Settings className="ml-2 h-4 w-4" />
                <span>لوحة الإدارة</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="text-red-400 hover:bg-gray-800 cursor-pointer"
          >
            <LogOut className="ml-2 h-4 w-4" />
            <span>تسجيل الخروج</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

export default UserActions;
