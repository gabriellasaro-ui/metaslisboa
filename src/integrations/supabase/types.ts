export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          client_id: string | null
          created_at: string
          description: string | null
          goal_id: string | null
          id: string
          metadata: Json | null
          squad_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          client_id?: string | null
          created_at?: string
          description?: string | null
          goal_id?: string | null
          id?: string
          metadata?: Json | null
          squad_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          client_id?: string | null
          created_at?: string
          description?: string | null
          goal_id?: string | null
          id?: string
          metadata?: Json | null
          squad_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          call_link: string | null
          call_summary: string | null
          client_id: string | null
          comment: string
          created_at: string
          created_by: string | null
          goal_id: string | null
          id: string
          progress: number
          status: string
          updated_at: string
        }
        Insert: {
          call_link?: string | null
          call_summary?: string | null
          client_id?: string | null
          comment: string
          created_at?: string
          created_by?: string | null
          goal_id?: string | null
          id?: string
          progress: number
          status: string
          updated_at?: string
        }
        Update: {
          call_link?: string | null
          call_summary?: string | null
          client_id?: string | null
          comment?: string
          created_at?: string
          created_by?: string | null
          goal_id?: string | null
          id?: string
          progress?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          archived: boolean
          aviso_previo_date: string | null
          categoria_problema: string | null
          churned_date: string | null
          created_at: string
          health_status: Database["public"]["Enums"]["health_status"] | null
          id: string
          name: string
          notes: string | null
          problema_central: string | null
          squad_id: string
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
        }
        Insert: {
          archived?: boolean
          aviso_previo_date?: string | null
          categoria_problema?: string | null
          churned_date?: string | null
          created_at?: string
          health_status?: Database["public"]["Enums"]["health_status"] | null
          id?: string
          name: string
          notes?: string | null
          problema_central?: string | null
          squad_id: string
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
        }
        Update: {
          archived?: boolean
          aviso_previo_date?: string | null
          categoria_problema?: string | null
          churned_date?: string | null
          created_at?: string
          health_status?: Database["public"]["Enums"]["health_status"] | null
          id?: string
          name?: string
          notes?: string | null
          problema_central?: string | null
          squad_id?: string
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_history: {
        Row: {
          change_type: string
          changed_at: string
          changed_by: string
          created_at: string
          field_name: string
          goal_id: string
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          change_type: string
          changed_at?: string
          changed_by: string
          created_at?: string
          field_name: string
          goal_id: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          change_type?: string
          changed_at?: string
          changed_by?: string
          created_at?: string
          field_name?: string
          goal_id?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_history_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          achievable: string | null
          ai_analysis: string | null
          client_id: string
          completed_date: string | null
          created_at: string
          description: string | null
          final_report: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          goal_value: string
          id: string
          measurable: string | null
          period: Database["public"]["Enums"]["goal_period"]
          progress: number
          relevant: string | null
          specific: string | null
          start_date: string | null
          started_at: string | null
          started_by: string | null
          status: Database["public"]["Enums"]["goal_status"]
          target_date: string | null
          time_bound: string | null
          updated_at: string
        }
        Insert: {
          achievable?: string | null
          ai_analysis?: string | null
          client_id: string
          completed_date?: string | null
          created_at?: string
          description?: string | null
          final_report?: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          goal_value: string
          id?: string
          measurable?: string | null
          period?: Database["public"]["Enums"]["goal_period"]
          progress?: number
          relevant?: string | null
          specific?: string | null
          start_date?: string | null
          started_at?: string | null
          started_by?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          time_bound?: string | null
          updated_at?: string
        }
        Update: {
          achievable?: string | null
          ai_analysis?: string | null
          client_id?: string
          completed_date?: string | null
          created_at?: string
          description?: string | null
          final_report?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          goal_value?: string
          id?: string
          measurable?: string | null
          period?: Database["public"]["Enums"]["goal_period"]
          progress?: number
          relevant?: string | null
          specific?: string | null
          start_date?: string | null
          started_at?: string | null
          started_by?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          time_bound?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      health_score_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          client_id: string
          id: string
          new_categoria_problema: string | null
          new_problema_central: string | null
          new_status: Database["public"]["Enums"]["health_status"] | null
          notes: string | null
          old_categoria_problema: string | null
          old_problema_central: string | null
          old_status: Database["public"]["Enums"]["health_status"] | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          client_id: string
          id?: string
          new_categoria_problema?: string | null
          new_problema_central?: string | null
          new_status?: Database["public"]["Enums"]["health_status"] | null
          notes?: string | null
          old_categoria_problema?: string | null
          old_problema_central?: string | null
          old_status?: Database["public"]["Enums"]["health_status"] | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          client_id?: string
          id?: string
          new_categoria_problema?: string | null
          new_problema_central?: string | null
          new_status?: Database["public"]["Enums"]["health_status"] | null
          notes?: string | null
          old_categoria_problema?: string | null
          old_problema_central?: string | null
          old_status?: Database["public"]["Enums"]["health_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "health_score_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      leaders: {
        Row: {
          avatar: string | null
          created_at: string
          email: string
          id: string
          joined_date: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email: string
          id?: string
          joined_date?: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          joined_date?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          client_at_risk: boolean
          created_at: string
          goal_completed: boolean
          goal_failed: boolean
          health_score_change: boolean
          id: string
          new_check_in: boolean
          sound_enabled: boolean
          squad_goal_progress: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          client_at_risk?: boolean
          created_at?: string
          goal_completed?: boolean
          goal_failed?: boolean
          health_score_change?: boolean
          id?: string
          new_check_in?: boolean
          sound_enabled?: boolean
          squad_goal_progress?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          client_at_risk?: boolean
          created_at?: string
          goal_completed?: boolean
          goal_failed?: boolean
          health_score_change?: boolean
          id?: string
          new_check_in?: boolean
          sound_enabled?: boolean
          squad_goal_progress?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          link: string | null
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          must_change_password: boolean | null
          name: string
          squad_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          must_change_password?: boolean | null
          name: string
          squad_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          must_change_password?: boolean | null
          name?: string
          squad_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      squad_goals: {
        Row: {
          created_at: string
          created_by: string | null
          current_value: number
          description: string | null
          goal_type: Database["public"]["Enums"]["squad_goal_type"]
          id: string
          period: Database["public"]["Enums"]["goal_period"]
          squad_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["squad_goal_status"]
          target_date: string
          target_value: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_value?: number
          description?: string | null
          goal_type?: Database["public"]["Enums"]["squad_goal_type"]
          id?: string
          period?: Database["public"]["Enums"]["goal_period"]
          squad_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["squad_goal_status"]
          target_date: string
          target_value: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_value?: number
          description?: string | null
          goal_type?: Database["public"]["Enums"]["squad_goal_type"]
          id?: string
          period?: Database["public"]["Enums"]["goal_period"]
          squad_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["squad_goal_status"]
          target_date?: string
          target_value?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_goals_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      squads: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          leader_id: string | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          leader_id?: string | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          leader_id?: string | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "squads_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestion_votes: {
        Row: {
          created_at: string
          id: string
          suggestion_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          suggestion_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          suggestion_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string
          description: string
          id: string
          squad_name: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          user_name: string
          user_role: string
          votes_count: number | null
        }
        Insert: {
          admin_response?: string | null
          category?: string
          created_at?: string
          description: string
          id?: string
          squad_name?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          user_name: string
          user_role: string
          votes_count?: number | null
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          squad_name?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          user_name?: string
          user_role?: string
          votes_count?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_squad_members_with_roles: {
        Args: { _squad_id: string }
        Returns: {
          avatar_url: string
          email: string
          id: string
          name: string
          role: string
        }[]
      }
      get_user_squad_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "check_in_created"
        | "check_in_updated"
        | "goal_completed"
        | "goal_failed"
        | "goal_started"
        | "health_score_changed"
        | "client_created"
        | "client_updated"
      app_role: "investidor" | "coordenador" | "supervisor"
      checkin_status: "on_track" | "at_risk" | "delayed" | "completed"
      client_status: "ativo" | "aviso_previo" | "churned"
      goal_period: "mensal" | "trimestral" | "semestral" | "anual"
      goal_status:
        | "nao_definida"
        | "em_andamento"
        | "concluida"
        | "cancelada"
        | "nao_batida"
      goal_type: "Faturamento" | "Leads" | "OUTROS"
      health_status:
        | "safe"
        | "care"
        | "danger"
        | "danger_critico"
        | "onboarding"
        | "e_e"
        | "churn"
        | "aviso_previo"
      notification_type:
        | "health_score_change"
        | "goal_completed"
        | "goal_failed"
        | "new_check_in"
        | "squad_goal_progress"
        | "client_at_risk"
      squad_goal_status:
        | "nao_iniciada"
        | "em_andamento"
        | "concluida"
        | "falhada"
      squad_goal_type:
        | "faturamento"
        | "leads"
        | "clientes"
        | "retencao"
        | "outros"
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
      activity_type: [
        "check_in_created",
        "check_in_updated",
        "goal_completed",
        "goal_failed",
        "goal_started",
        "health_score_changed",
        "client_created",
        "client_updated",
      ],
      app_role: ["investidor", "coordenador", "supervisor"],
      checkin_status: ["on_track", "at_risk", "delayed", "completed"],
      client_status: ["ativo", "aviso_previo", "churned"],
      goal_period: ["mensal", "trimestral", "semestral", "anual"],
      goal_status: [
        "nao_definida",
        "em_andamento",
        "concluida",
        "cancelada",
        "nao_batida",
      ],
      goal_type: ["Faturamento", "Leads", "OUTROS"],
      health_status: [
        "safe",
        "care",
        "danger",
        "danger_critico",
        "onboarding",
        "e_e",
        "churn",
        "aviso_previo",
      ],
      notification_type: [
        "health_score_change",
        "goal_completed",
        "goal_failed",
        "new_check_in",
        "squad_goal_progress",
        "client_at_risk",
      ],
      squad_goal_status: [
        "nao_iniciada",
        "em_andamento",
        "concluida",
        "falhada",
      ],
      squad_goal_type: [
        "faturamento",
        "leads",
        "clientes",
        "retencao",
        "outros",
      ],
    },
  },
} as const
