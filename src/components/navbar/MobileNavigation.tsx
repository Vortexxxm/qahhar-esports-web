
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Shield, Trophy, Users, Newspaper, Info, Home, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import SmartGreeting from '../SmartGreeting';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  const handleAdminClick = () => {
    navigate('/admin');
    setIsOpen(false);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isActivePath = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/home')) {
      return true;
    }
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'الرئيسية', icon: Home },
    { path: '/about', label: 'من نحن', icon: Info },
    { path: '/leaderboard', label: 'المتصدرون', icon: Trophy },
    { path: '/tournaments', label: 'البطولات', icon: Crown },
    { path: '/team', label: 'الفريق', icon: Users },
    { path: '/news', label: 'الأخبار', icon: Newspaper },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-white hover:bg-white/10 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="lg:hidden bg-black/98 border-t border-s3m-red/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActivePath(link.path)
                      ? 'text-s3m-red bg-s3m-red/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            <div className="border-t border-gray-700 pt-4 mt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="px-3">
                    <SmartGreeting />
                  </div>
                  
                  {isAdmin && (
                    <Button
                      onClick={handleAdminClick}
                      variant="outline"
                      className="w-full justify-start border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white"
                    >
                      <Shield className="w-4 h-4 ml-2" />
                      لوحة الإدارة
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleProfileClick}
                    variant="outline"
                    className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <User className="w-4 h-4 ml-2" />
                    الملف الشخصي
                  </Button>
                  
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full justify-start border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    تسجيل الخروج
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={() => { navigate('/login'); closeMenu(); }}
                    variant="outline"
                    className="w-full justify-center border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    دخول
                  </Button>
                  <Button
                    onClick={() => { navigate('/signup'); closeMenu(); }}
                    className="w-full justify-center bg-s3m-red hover:bg-red-600 text-white"
                  >
                    إنشاء حساب
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
