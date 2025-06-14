
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, Trophy, Crown, Users, Newspaper } from 'lucide-react';

const DesktopNavigation = () => {
  const location = useLocation();

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
  );
};

export default DesktopNavigation;
