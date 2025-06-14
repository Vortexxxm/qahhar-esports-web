
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Shield, Trophy, Users, Newspaper, Info, Home, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import NotificationsPopover from './NotificationsPopover';
import SmartGreeting from './SmartGreeting';

const Navbar = () => {
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
      <nav className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-sm border-b border-s3m-red/30 sticky top-0 z-50 shadow-lg shadow-s3m-red/10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
              <div className="w-12 h-12 bg-gradient-to-br from-s3m-red via-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-s3m-red/30 group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-bold text-xl">S3M</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-bold text-2xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  S3M E-Sports
                </span>
                <div className="text-xs text-s3m-red font-medium">نادي الرياضات الإلكترونية</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2 rtl:space-x-reverse bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/10">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActivePath(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center space-x-2 rtl:space-x-reverse px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-s3m-red to-red-600 shadow-lg shadow-s3m-red/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="font-medium">{link.label}</span>
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-s3m-red/20 to-red-600/20 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {user ? (
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
              ) : (
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
              )}

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
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
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
      </nav>
    </>
  );
};

export default Navbar;
