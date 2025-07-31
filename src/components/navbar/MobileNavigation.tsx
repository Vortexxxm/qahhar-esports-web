import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Shield, Trophy, Users, Newspaper, Info, Home, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import SmartGreeting from '../SmartGreeting';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

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
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      return data?.role || 'user';
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const isActivePath = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/home')) {
      return true;
    }
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'الرئيسية', icon: <Home className="h-5 w-5" /> },
    { path: '/leaderboard', label: 'المتصدرين', icon: <Trophy className="h-5 w-5" /> },
    { path: '/tournaments', label: 'البطولات', icon: <Crown className="h-5 w-5" /> },
    { path: '/team', label: 'الفريق', icon: <Users className="h-5 w-5" /> },
    { path: '/news', label: 'الأخبار', icon: <Newspaper className="h-5 w-5" /> },
    { path: '/about', label: 'من نحن', icon: <Info className="h-5 w-5" /> },
  ];

  const userActions = [
    { path: '/profile', label: 'الملف الشخصي', icon: <User className="h-5 w-5" /> },
    ...(userRole === 'admin' ? [{ path: '/admin', label: 'لوحة الإدارة', icon: <Shield className="h-5 w-5" /> }] : []),
  ];

  return (
    <div className="lg:hidden">
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Menu className="h-6 w-6" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-gradient-to-b from-gray-900 to-black border-gray-800 text-white">
          <div className="px-4 py-6 max-h-[80vh] overflow-y-auto">
            {/* User Section */}
            {user && (
              <div className="mb-6 pb-6 border-b border-gray-700">
                <SmartGreeting />
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-4 mb-6">
              {navItems.map((item) => (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg transition-all duration-200 ${
                      isActivePath(item.path)
                        ? 'bg-gradient-to-r from-s3m-red to-red-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </div>
              ))}
            </div>

            {/* User Actions */}
            {user && (
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-700">
                {userActions.map((action) => (
                  <div key={action.path}>
                    <Link
                      to={action.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg transition-all duration-200 ${
                        location.pathname === action.path
                          ? 'bg-gradient-to-r from-s3m-red to-red-600 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {action.icon}
                      <span className="font-medium">{action.label}</span>
                      {action.path === '/admin' && (
                        <div className="mr-auto">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Auth Actions */}
            <div className="space-y-3">
              {user ? (
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full justify-start space-x-3 rtl:space-x-reverse border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                >
                  <LogOut className="h-5 w-5" />
                  <span>تسجيل الخروج</span>
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      navigate('/login');
                      setIsOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red"
                  >
                    تسجيل الدخول
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/signup');
                      setIsOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-white/10"
                  >
                    إنشاء حساب جديد
                  </Button>
                </div>
              )}
            </div>

            {/* Join Us Button for Non-authenticated Users */}
            {!user && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <Button
                  onClick={() => {
                    navigate('/join-us');
                    setIsOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  انضم إلى الفريق
                </Button>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobileNavigation;