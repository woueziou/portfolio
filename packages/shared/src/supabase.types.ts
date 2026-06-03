export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
          status: Database['public']['Enums']['publication_status']
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
          status?: Database['public']['Enums']['publication_status']
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
          status?: Database['public']['Enums']['publication_status']
          summary?: string | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'articles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'articles_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
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
      projects: {
        Row: {
          access_link: string | null
          created_at: string
          description: string | null
          id: number
          main_image_url: string | null
          project_date: string
          publication_status: Database['public']['Enums']['publication_status']
          published_at: string | null
          slug: string
          state: Database['public']['Enums']['project_status'] | null
          tech_stack: string[]
          title: string | null
          type: Database['public']['Enums']['project_type'][]
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          access_link?: string | null
          created_at?: string
          description?: string | null
          id?: number
          main_image_url?: string | null
          project_date: string
          publication_status?: Database['public']['Enums']['publication_status']
          published_at?: string | null
          slug: string
          state?: Database['public']['Enums']['project_status'] | null
          tech_stack?: string[]
          title?: string | null
          type?: Database['public']['Enums']['project_type'][]
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          access_link?: string | null
          created_at?: string
          description?: string | null
          id?: number
          main_image_url?: string | null
          project_date?: string
          publication_status?: Database['public']['Enums']['publication_status']
          published_at?: string | null
          slug?: string
          state?: Database['public']['Enums']['project_status'] | null
          tech_stack?: string[]
          title?: string | null
          type?: Database['public']['Enums']['project_type'][]
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'projects_userId_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status: 'ongoing' | 'finished' | 'production'
      project_type: 'web' | 'mobile' | 'script' | 'backend' | 'infra'
      publication_status: 'draft' | 'published' | 'archived'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never
