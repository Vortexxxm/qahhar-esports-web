
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-black via-gray-900 to-black border-t border-s3m-red/30 mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description - First Column */}
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end space-x-3 space-x-reverse mb-4">
              <img 
                src="/lovable-uploads/876694d5-ec41-469d-9b93-b1c067364893.png" 
                alt="S3M Logo" 
                className="h-12 w-12"
              />
              <div className="text-2xl font-bold text-white">
                S3M E-Sports
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              منصة رياضات إلكترونية متخصصة تهدف إلى تطوير
              <br />
              المواهب العربية وتنظيم البطولات الاحترافية.
            </p>
          </div>

          {/* Quick Links - Second Column */}
          <div className="text-center md:text-right">
            <h3 className="text-s3m-red font-semibold mb-6">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-white/70 hover:text-s3m-red transition-colors text-sm">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-white/70 hover:text-s3m-red transition-colors text-sm">
                  الأخبار
                </Link>
              </li>
              <li>
                <Link to="/tournaments" className="text-white/70 hover:text-s3m-red transition-colors text-sm">
                  البطولات
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/70 hover:text-s3m-red transition-colors text-sm">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-white/70 hover:text-s3m-red transition-colors text-sm">
                  المتصدرين
                </Link>
              </li>
              <li>
                <Link to="/join-us" className="text-white/70 hover:text-s3m-red transition-colors text-sm">
                  انضم إلينا
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links - Third Column */}
          <div className="text-center md:text-right">
            <h3 className="text-s3m-red font-semibold mb-6">قانوني</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-white/70 hover:text-s3m-red transition-colors text-sm">
                  الشروط والأحكام
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/70 hover:text-s3m-red transition-colors text-sm">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media - Fourth Column */}
          <div className="text-center md:text-right">
            <h3 className="text-s3m-red font-semibold mb-6">تواصل معنا</h3>
            <div className="flex justify-center">
              <a 
                href="https://www.instagram.com/s3m_esports/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-s3m-red transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="text-white/60 text-sm">
            © S3M E-Sports 2025 جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
