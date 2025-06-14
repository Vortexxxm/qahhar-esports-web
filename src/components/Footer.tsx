
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-black via-gray-900 to-black border-t border-s3m-red/30 mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-s3m-red to-red-600 bg-clip-text text-transparent">
                S3M
              </div>
            </div>
            <p className="text-white/70 mb-6 max-w-md">
              أقوى فريق في Free Fire. نحن نصنع الأبطال ونحقق الانتصارات. انضم إلينا وكن جزءاً من الأسطورة.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-white/60 hover:text-s3m-red transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-white/60 hover:text-s3m-red transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-white/60 hover:text-s3m-red transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-white/60 hover:text-s3m-red transition-colors">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/70 hover:text-s3m-red transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/70 hover:text-s3m-red transition-colors">
                  عن الفريق
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-white/70 hover:text-s3m-red transition-colors">
                  الفريق
                </Link>
              </li>
              <li>
                <Link to="/tournaments" className="text-white/70 hover:text-s3m-red transition-colors">
                  البطولات
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-white/70 hover:text-s3m-red transition-colors">
                  المتصدرين
                </Link>
              </li>
              <li>
                <Link to="/join-us" className="text-white/70 hover:text-s3m-red transition-colors">
                  انضم إلينا
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 space-x-reverse text-white/70">
                <Mail className="h-5 w-5 text-s3m-red" />
                <span>contact@s3m-team.com</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse text-white/70">
                <Phone className="h-5 w-5 text-s3m-red" />
                <span>+966 50 123 4567</span>
              </li>
              <li className="flex items-start space-x-3 space-x-reverse text-white/70">
                <MapPin className="h-5 w-5 text-s3m-red mt-1" />
                <span>الرياض، المملكة العربية السعودية</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="text-white font-medium mb-2">الصفحات القانونية</h4>
              <ul className="space-y-1">
                <li>
                  <Link to="/terms" className="text-white/60 hover:text-s3m-red transition-colors text-sm">
                    الشروط والأحكام
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-white/60 hover:text-s3m-red transition-colors text-sm">
                    سياسة الخصوصية
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} فريق S3M. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
