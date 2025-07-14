export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      friends: {
        Row: {
          created_at: string | null
          friend_id: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      join_requests: {
        Row: {
          age: number
          available_hours: string
          created_at: string
          experience: string
          full_name: string
          game_id: string
          id: string
          phone_number: string
          rank: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string | null
          why_join: string
        }
        Insert: {
          age: number
          available_hours: string
          created_at?: string
          experience: string
          full_name: string
          game_id: string
          id?: string
          phone_number: string
          rank: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string | null
          why_join: string
        }
        Update: {
          age?: number
          available_hours?: string
          created_at?: string
          experience?: string
          full_name?: string
          game_id?: string
          id?: string
          phone_number?: string
          rank?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string | null
          why_join?: string
        }
        Relationships: []
      }
      leaderboard_scores: {
        Row: {
          deaths: number
          games_played: number
          id: string
          kills: number
          last_updated: string
          losses: number
          points: number
          rank_position: number | null
          user_id: string
          visible_in_leaderboard: boolean
          wins: number
        }
        Insert: {
          deaths?: number
          games_played?: number
          id?: string
          kills?: number
          last_updated?: string
          losses?: number
          points?: number
          rank_position?: number | null
          user_id: string
          visible_in_leaderboard?: boolean
          wins?: number
        }
        Update: {
          deaths?: number
          games_played?: number
          id?: string
          kills?: number
          last_updated?: string
          losses?: number
          points?: number
          rank_position?: number | null
          user_id?: string
          visible_in_leaderboard?: boolean
          wins?: number
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_score: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          game_id: string | null
          id: string
          is_first_visit: boolean | null
          phone_number: string | null
          rank_title: string | null
          total_likes: number | null
          updated_at: string
          username: string
        }
        Insert: {
          activity_score?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          game_id?: string | null
          id: string
          is_first_visit?: boolean | null
          phone_number?: string | null
          rank_title?: string | null
          total_likes?: number | null
          updated_at?: string
          username: string
        }
        Update: {
          activity_score?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          game_id?: string | null
          id?: string
          is_first_visit?: boolean | null
          phone_number?: string | null
          rank_title?: string | null
          total_likes?: number | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          id: string
          subscription: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      special_players: {
        Row: {
          created_at: string
          created_by: string
          end_date: string | null
          id: string
          is_active: boolean | null
          start_date: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "special_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          name: string
          order_position: number | null
          role: string
          social_links: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name: string
          order_position?: number | null
          role: string
          social_links?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name?: string
          order_position?: number | null
          role?: string
          social_links?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tournament_registrations: {
        Row: {
          contact_email: string
          contact_phone: string
          created_at: string
          id: string
          image_url: string | null
          leader_id: string | null
          notes: string | null
          player_1_id: string
          player_1_name: string
          player_2_id: string | null
          player_2_name: string | null
          player_3_id: string | null
          player_3_name: string | null
          player_4_id: string | null
          player_4_name: string | null
          status: string
          team_name: string
          tournament_id: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email: string
          contact_phone: string
          created_at?: string
          id?: string
          image_url?: string | null
          leader_id?: string | null
          notes?: string | null
          player_1_id: string
          player_1_name: string
          player_2_id?: string | null
          player_2_name?: string | null
          player_3_id?: string | null
          player_3_name?: string | null
          player_4_id?: string | null
          player_4_name?: string | null
          status?: string
          team_name: string
          tournament_id?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string
          contact_phone?: string
          created_at?: string
          id?: string
          image_url?: string | null
          leader_id?: string | null
          notes?: string | null
          player_1_id?: string
          player_1_name?: string
          player_2_id?: string | null
          player_2_name?: string | null
          player_3_id?: string | null
          player_3_name?: string | null
          player_4_id?: string | null
          player_4_name?: string | null
          status?: string
          team_name?: string
          tournament_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          end_date: string
          entry_requirements: string | null
          id: string
          image_url: string | null
          max_teams: number | null
          prize_info: string | null
          registration_deadline: string
          rules: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          end_date: string
          entry_requirements?: string | null
          id?: string
          image_url?: string | null
          max_teams?: number | null
          prize_info?: string | null
          registration_deadline: string
          rules?: string | null
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          end_date?: string
          entry_requirements?: string | null
          id?: string
          image_url?: string | null
          max_teams?: number | null
          prize_info?: string | null
          registration_deadline?: string
          rules?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          created_at: string | null
          id: string
          last_login: string | null
          login_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_login?: string | null
          login_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_login?: string | null
          login_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_likes: {
        Row: {
          created_at: string | null
          id: string
          liked_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          liked_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          liked_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      set_monthly_player: {
        Args: { player_id: string }
        Returns: undefined
      }
      set_weekly_player: {
        Args: { player_id: string }
        Returns: undefined
      }
      update_leaderboard_rankings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_activity: {
        Args: { user_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
