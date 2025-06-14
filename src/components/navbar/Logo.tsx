
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
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
  );
};

export default Logo;
