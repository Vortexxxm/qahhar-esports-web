
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import NotificationsPopover from '../NotificationsPopover';
import SmartGreeting from '../SmartGreeting';

const UserActions = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_user_role', { user_uuid: user.id });
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  const isAdmin = userRole === 'admin';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  if (!user) {
    return (
      <div className="hidden lg:flex items-center space-x-3 rtl:space-x-reverse bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/10">
        <Button
          onClick={() => navigate('/login')}
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300"
        >
          دخول
        </Button>
        <Button
          onClick={() => navigate('/signup')}
          className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red text-white rounded-xl shadow-lg shadow-s3m-red/30 transition-all duration-300 hover:scale-105"
          size="sm"
        >
          تسجيل
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block">
        <SmartGreeting />
      </div>
      
      <NotificationsPopover />
      
      <div className="hidden lg:flex items-center space-x-3 rtl:space-x-reverse bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/10">
        {isAdmin && (
          <Button
            onClick={handleAdminClick}
            variant="ghost"
            size="sm"
            className="text-s3m-red hover:text-white hover:bg-s3m-red/20 border border-s3m-red/30 hover:border-s3m-red rounded-xl transition-all duration-300"
          >
            <Shield className="w-4 h-4 ml-1" />
            الإدارة
          </Button>
        )}
        
        <Button
          onClick={handleProfileClick}
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300"
        >
          <User className="w-4 h-4 ml-1" />
          الملف الشخصي
        </Button>
        
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-white hover:bg-red-600/20 border border-red-600/30 hover:border-red-600 rounded-xl transition-all duration-300"
        >
          <LogOut className="w-4 h-4 ml-1" />
          خروج
        </Button>
      </div>
    </>
  );
};

export default UserActions;
