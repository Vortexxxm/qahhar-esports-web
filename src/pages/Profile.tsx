
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";

const Profile = () => {
  const { user, loading } = useAuth();

  console.log("Profile page rendered, user:", user?.id, "loading:", loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-s3m-red mx-auto mb-4"></div>
          <div className="text-white text-lg">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-6">
          <Link to="/edit-profile">
            <Button 
              className="bg-s3m-red hover:bg-red-600 text-white"
              size="sm"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              تحرير الملف الشخصي
            </Button>
          </Link>
        </div>
        <div className="flex justify-center">
          <UserProfile userId={user.id} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
