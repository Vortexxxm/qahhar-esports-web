
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Shield, Trophy, Users, Newspaper, Info, Home, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import SmartGreeting from '../SmartGreeting';
import { motion, AnimatePresence } from 'framer-motion';

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
        <motion.div
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant="ghost"
            size="sm"
            className="relative text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-s3m-red/20 hover:to-purple-600/20 rounded-2xl border border-white/20 hover:border-s3m-red/60 transition-all duration-300 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </Button>
        </motion.div>
      </div>

      {/* Mobile Navigation Menu - Full Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed inset-0 z-50 bg-gradient-to-br from-black via-gray-900 to-s3m-red/20 backdrop-blur-xl"
          >
            {/* Header with close button */}
            <div className="flex justify-between items-center p-6 border-b border-s3m-red/30">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-gradient-to-br from-s3m-red via-red-500 to-red-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S3M</span>
                </div>
                <span className="text-white font-bold text-xl">القائمة</span>
              </div>
              <Button
                onClick={closeMenu}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-s3m-red/20 rounded-xl"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* User Greeting */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <SmartGreeting />
                </motion.div>
              )}

              {/* Navigation Links */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Crown className="w-5 h-5 text-s3m-red ml-2" />
                  التنقل
                </h3>
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Link
                        to={link.path}
                        onClick={closeMenu}
                        className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-4 rounded-2xl text-base font-medium transition-all duration-300 group ${
                          isActivePath(link.path)
                            ? 'text-white bg-gradient-to-r from-s3m-red to-red-600 shadow-lg shadow-s3m-red/30'
                            : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-white/10 hover:to-s3m-red/20 border border-transparent hover:border-s3m-red/30'
                        }`}
                      >
                        <Icon className={`w-6 h-6 transition-transform duration-300 ${isActivePath(link.path) ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="flex-1">{link.label}</span>
                        {isActivePath(link.path) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
              
              {/* User Actions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="border-t border-gray-700/50 pt-6"
              >
                {user ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                      <User className="w-5 h-5 text-s3m-red ml-2" />
                      حسابي
                    </h3>
                    
                    {isAdmin && (
                      <Button
                        onClick={handleAdminClick}
                        variant="outline"
                        className="w-full justify-start bg-gradient-to-r from-s3m-red/10 to-red-600/10 border-s3m-red/50 text-s3m-red hover:bg-gradient-to-r hover:from-s3m-red hover:to-red-600 hover:text-white rounded-xl py-3 transition-all duration-300"
                      >
                        <Shield className="w-5 h-5 ml-2" />
                        لوحة الإدارة
                      </Button>
                    )}
                    
                    <Button
                      onClick={handleProfileClick}
                      variant="outline"
                      className="w-full justify-start border-gray-600/50 text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:text-white rounded-xl py-3 transition-all duration-300"
                    >
                      <User className="w-5 h-5 ml-2" />
                      الملف الشخصي
                    </Button>
                    
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full justify-start border-red-600/50 text-red-400 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:text-white rounded-xl py-3 transition-all duration-300"
                    >
                      <LogOut className="w-5 h-5 ml-2" />
                      تسجيل الخروج
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">انضم إلينا</h3>
                    <Button
                      onClick={() => { navigate('/login'); closeMenu(); }}
                      variant="outline"
                      className="w-full justify-center border-gray-600/50 text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:text-white rounded-xl py-3 transition-all duration-300"
                    >
                      دخول
                    </Button>
                    <Button
                      onClick={() => { navigate('/signup'); closeMenu(); }}
                      className="w-full justify-center bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl py-3 shadow-lg shadow-s3m-red/30 transition-all duration-300"
                    >
                      إنشاء حساب
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="p-6 border-t border-s3m-red/30 text-center"
            >
              <p className="text-gray-400 text-sm">
                © 2024 S3M E-Sports - جميع الحقوق محفوظة
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;
