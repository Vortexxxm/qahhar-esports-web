import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import { useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Profile = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isFirstVisit = searchParams.get('first_visit') === 'true';

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {isFirstVisit && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-200">
              مرحباً بك! يرجى تعديل معلوماتك الشخصية لإكمال إعداد حسابك.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">الملف الشخصي</h1>
          
          <UserProfile />
        </div>
      </div>
    </div>
  );
};

export default Profile;
