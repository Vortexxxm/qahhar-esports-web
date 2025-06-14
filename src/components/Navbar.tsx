
import Logo from './navbar/Logo';
import DesktopNavigation from './navbar/DesktopNavigation';
import UserActions from './navbar/UserActions';
import MobileNavigation from './navbar/MobileNavigation';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-sm border-b border-s3m-red/30 sticky top-0 z-50 shadow-lg shadow-s3m-red/10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <DesktopNavigation />

          {/* User Actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <UserActions />
            <MobileNavigation />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
