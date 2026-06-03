WARN: no SMS provider is enabled. Disabling phone login
Connecting to db 5432
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      articles: {
        Row: {
          content: Json | null
          content_html: string | null
          created_at: string
          id: number
          image_url: string | null
          project_id: number | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          status: Database["public"]["Enums"]["publication_status"]
          summary: string | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          content?: Json | null
          content_html?: string | null
          created_at?: string
          id?: number
          image_url?: string | null
          project_id?: number | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          status?: Database["public"]["Enums"]["publication_status"]
          summary?: string | null
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          content?: Json | null
          content_html?: string | null
          created_at?: string
          id?: number
          image_url?: string | null
          project_id?: number | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["publication_status"]
          summary?: string | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_providers: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          url?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          count: number
          created_at: string
          date: string
          id: number
          path: string
        }
        Insert: {
          count?: number
          created_at?: string
          date?: string
          id?: never
          path: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          id?: never
          path?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string | null
          first_name: string
          id: string
          last_name: string
          skills: string[]
          socials: Json
          title: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          first_name: string
          id: string
          last_name: string
          skills?: string[]
          socials?: Json
          title: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          first_name?: string
          id?: string
          last_name?: string
          skills?: string[]
          socials?: Json
          title?: string
          username?: string
        }
        Relationships: []
      }
      project_techstacks: {
        Row: {
          created_at: string
          project_id: number
          techstack_id: string
        }
        Insert: {
          created_at?: string
          project_id: number
          techstack_id: string
        }
        Update: {
          created_at?: string
          project_id?: number
          techstack_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_techstacks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_techstacks_techstack_id_fkey"
            columns: ["techstack_id"]
            isOneToOne: false
            referencedRelation: "techstacks"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          access_link: string | null
          created_at: string
          description: string
          id: number
          main_image_url: string | null
          project_date: string
          publication_status: Database["public"]["Enums"]["publication_status"]
          published_at: string | null
          slug: string
          state: Database["public"]["Enums"]["project_status"] | null
          tech_stack: string[]
          title: string
          type: Database["public"]["Enums"]["project_type"][]
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          access_link?: string | null
          created_at?: string
          description: string
          id?: number
          main_image_url?: string | null
          project_date: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          published_at?: string | null
          slug: string
          state?: Database["public"]["Enums"]["project_status"] | null
          tech_stack?: string[]
          title: string
          type?: Database["public"]["Enums"]["project_type"][]
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          access_link?: string | null
          created_at?: string
          description?: string
          id?: number
          main_image_url?: string | null
          project_date?: string
          publication_status?: Database["public"]["Enums"]["publication_status"]
          published_at?: string | null
          slug?: string
          state?: Database["public"]["Enums"]["project_status"] | null
          tech_stack?: string[]
          title?: string
          type?: Database["public"]["Enums"]["project_type"][]
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_userId_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_config: {
        Row: {
          created_at: string
          id: number
          seo_description: string | null
          seo_og_image: string | null
          site_tagline: string | null
          site_title: string
          social_links: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          seo_description?: string | null
          seo_og_image?: string | null
          site_tagline?: string | null
          site_title?: string
          social_links?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          seo_description?: string | null
          seo_og_image?: string | null
          site_tagline?: string | null
          site_title?: string
          social_links?: Json
          updated_at?: string
        }
        Relationships: []
      }
      techstacks: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      project_types_view: {
        Row: {
          label: string | null
          value: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      increment_page_view: { Args: { path_param: string }; Returns: undefined }
    }
    Enums: {
      project_status: "ongoing" | "finished" | "production"
      project_type:
        | "web"
        | "mobile"
        | "script"
        | "backend"
        | "infra"
        | "llm"
        | "ai"
        | "desktop"
        | "api"
        | "library"
        | "other"
      publication_status: "draft" | "published" | "archived"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      project_status: ["ongoing", "finished", "production"],
      project_type: [
        "web",
        "mobile",
        "script",
        "backend",
        "infra",
        "llm",
        "ai",
        "desktop",
        "api",
        "library",
        "other",
      ],
      publication_status: ["draft", "published", "archived"],
    },
  },
} as const

A new version of Supabase CLI is available: v2.104.0 (currently installed v2.103.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
