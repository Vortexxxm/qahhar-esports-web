
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-s3m-red to-red-600 mx-auto mb-6"></div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          الصفحة غير موجودة
        </h2>
        
        <p className="text-xl text-white/70 mb-8 leading-relaxed">
          يبدو أنك تبحث عن صفحة غير موجودة أو تم حذفها من موقع S3M E-Sports
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="bg-gradient-to-r from-s3m-red to-red-600 hover:from-red-600 hover:to-s3m-red text-white px-6 py-3 text-lg w-full sm:w-auto">
              <Home className="mr-2 h-5 w-5" />
              العودة للرئيسية
            </Button>
          </Link>
          
          <Link to="/players">
            <Button 
              variant="outline" 
              className="border-s3m-red text-s3m-red hover:bg-s3m-red hover:text-white px-6 py-3 text-lg w-full sm:w-auto"
            >
              <Search className="mr-2 h-5 w-5" />
              تصفح اللاعبين
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 text-white/50 text-sm">
          <p>تحتاج مساعدة؟ تواصل معنا عبر فريق الدعم</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
