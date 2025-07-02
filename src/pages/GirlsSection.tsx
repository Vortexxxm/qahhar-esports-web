
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Users, Trophy, Calendar, MessageSquare, Image, Award, FileText, UserPlus, Megaphone } from "lucide-react";
import GirlsProfiles from "@/components/girls/GirlsProfiles";
import GirlsWeeklyRankings from "@/components/girls/GirlsWeeklyRankings";
import GirlsHighlights from "@/components/girls/GirlsHighlights";
import GirlsBlog from "@/components/girls/GirlsBlog";
import GirlsSuggestions from "@/components/girls/GirlsSuggestions";
import GirlsTrainingSchedule from "@/components/girls/GirlsTrainingSchedule";
import GirlsAwards from "@/components/girls/GirlsAwards";
import GirlsGallery from "@/components/girls/GirlsGallery";
import GirlsAnnouncements from "@/components/girls/GirlsAnnouncements";
import GirlsJoinForm from "@/components/girls/GirlsJoinForm";

const GirlsSection = () => {
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState("profiles");

  const tabs = [
    { id: "profiles", label: "القائدة والسكواد", icon: Crown, component: GirlsProfiles },
    { id: "rankings", label: "التقييم الأسبوعي", icon: Trophy, component: GirlsWeeklyRankings },
    { id: "highlights", label: "لقطات البنات", icon: Users, component: GirlsHighlights },
    { id: "blog", label: "المدونة", icon: FileText, component: GirlsBlog },
    { id: "suggestions", label: "صندوق الأفكار", icon: MessageSquare, component: GirlsSuggestions },
    { id: "schedule", label: "جدول التدريبات", icon: Calendar, component: GirlsTrainingSchedule },
    { id: "awards", label: "الجوائز والتكريمات", icon: Award, component: GirlsAwards },
    { id: "gallery", label: "جاليري الصور", icon: Image, component: GirlsGallery },
    { id: "announcements", label: "الإعلانات", icon: Megaphone, component: GirlsAnnouncements },
    { id: "join", label: "انضمي إلينا", icon: UserPlus, component: GirlsJoinForm }
  ];

  return (
    <div className="min-h-screen py-6 px-4 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-red-900/20">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-600 bg-clip-text text-transparent">
            S3M Girls E-Sports
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            قسم مخصص لفريق البنات في S3M E-Sports - مكان لعرض المواهب والإنجازات والتواصل
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 bg-black/30 p-2 rounded-xl mb-8 h-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300 hover:bg-white/10"
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-xs font-medium">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <tab.component />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default GirlsSection;
