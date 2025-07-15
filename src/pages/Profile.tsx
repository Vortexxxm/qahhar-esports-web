
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import { Navigate } from "react-router-dom";

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
      <UserProfile userId={user.id} />
    </div>
  );
};

export default Profile;
