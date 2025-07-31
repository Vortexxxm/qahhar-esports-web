import { Link, useLocation } from 'react-router-dom';

const DesktopNavigation = () => {
  const location = useLocation();

  const isActivePath = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/home')) {
      return true;
    }
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'الرئيسية' },
    { path: '/leaderboard', label: 'المتصدرين' },
    { path: '/tournaments', label: 'البطولات' },
    { path: '/team', label: 'الفريق' },
    { path: '/news', label: 'الأخبار' },
    { path: '/join-us', label: 'انضم إلينا' },
  ];

  return (
    <div className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse">
      {navItems.map((item) => (
        <div key={item.path}>
          <Link
            to={item.path}
            className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              isActivePath(item.path)
                ? 'text-white bg-gradient-to-r from-s3m-red to-red-600 shadow-lg shadow-s3m-red/30'
                : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-white/10 hover:to-s3m-red/20 border border-transparent hover:border-s3m-red/30'
            }`}
          >
            {item.label}
            {isActivePath(item.path) && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default DesktopNavigation;