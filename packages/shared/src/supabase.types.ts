export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  cac_auth: {
    Tables: {
      account: {
        Row: {
          access_token: string | null
          access_token_expires_at: string | null
          account_id: string
          created_at: string
          id: string
          id_token: string | null
          password: string | null
          provider_id: string
          refresh_token: string | null
          refresh_token_expires_at: string | null
          scope: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          access_token_expires_at?: string | null
          account_id: string
          created_at?: string
          id: string
          id_token?: string | null
          password?: string | null
          provider_id: string
          refresh_token?: string | null
          refresh_token_expires_at?: string | null
          scope?: string | null
          updated_at: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          access_token_expires_at?: string | null
          account_id?: string
          created_at?: string
          id?: string
          id_token?: string | null
          password?: string | null
          provider_id?: string
          refresh_token?: string | null
          refresh_token_expires_at?: string | null
          scope?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'account_user_id_user_id_fk'
            columns: ['user_id']
            referencedRelation: 'user'
            referencedColumns: ['id']
          },
        ]
      }
      session: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          token: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id: string
          ip_address?: string | null
          token: string
          updated_at: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          token?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'session_user_id_user_id_fk'
            columns: ['user_id']
            referencedRelation: 'user'
            referencedColumns: ['id']
          },
        ]
      }
      user: {
        Row: {
          created_at: string
          email: string
          email_verified: boolean
          id: string
          image: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_verified?: boolean
          id: string
          image?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_verified?: boolean
          id?: string
          image?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      verification: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          identifier: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id: string
          identifier: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          identifier?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  cac_marketing: {
    Tables: {
      customer: {
        Row: {
          created_at: string
          disabled_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          disabled_at?: string | null
          email?: string | null
          first_name: string
          id: string
          last_name: string
          phone_number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          disabled_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          created_at: string
          customerInfo: Json
          date: string
          disabled_at: string | null
          hour: string
          id: string
          is_confirmed: boolean
          is_done: boolean
          note: string | null
          service: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          customerInfo: Json
          date: string
          disabled_at?: string | null
          hour: string
          id: string
          is_confirmed?: boolean
          is_done?: boolean
          note?: string | null
          service: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          customerInfo?: Json
          date?: string
          disabled_at?: string | null
          hour?: string
          id?: string
          is_confirmed?: boolean
          is_done?: boolean
          note?: string | null
          service?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'rsvps_service_services_id_fk'
            columns: ['service']
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string
          disabled_at: string | null
          estimated_time: string
          id: string
          minPrice: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description: string
          disabled_at?: string | null
          estimated_time: string
          id: string
          minPrice: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          disabled_at?: string | null
          estimated_time?: string
          id?: string
          minPrice?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  cac_store: {
    Tables: {
      product: {
        Row: {
          added_by: string
          barcode: string | null
          created_at: string
          description: string | null
          disabled_at: string | null
          id: string
          name: string
          product_type_id: string
          updated_at: string | null
        }
        Insert: {
          added_by: string
          barcode?: string | null
          created_at?: string
          description?: string | null
          disabled_at?: string | null
          id: string
          name: string
          product_type_id: string
          updated_at?: string | null
        }
        Update: {
          added_by?: string
          barcode?: string | null
          created_at?: string
          description?: string | null
          disabled_at?: string | null
          id?: string
          name?: string
          product_type_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'product_product_type_id_product_type_id_fk'
            columns: ['product_type_id']
            referencedRelation: 'product_type'
            referencedColumns: ['id']
          },
        ]
      }
      product_image: {
        Row: {
          alt_text: string | null
          created_at: string
          disabled_at: string | null
          id: string
          image_url: string
          product_id: string
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          disabled_at?: string | null
          id: string
          image_url: string
          product_id: string
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          disabled_at?: string | null
          id?: string
          image_url?: string
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'product_image_product_id_product_id_fk'
            columns: ['product_id']
            referencedRelation: 'product'
            referencedColumns: ['id']
          },
        ]
      }
      product_type: {
        Row: {
          created_at: string
          description: string | null
          disabled_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          disabled_at?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          disabled_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_variant: {
        Row: {
          attributes: Json | null
          created_at: string
          disabled_at: string | null
          id: string
          name: string
          product_id: string
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          attributes?: Json | null
          created_at?: string
          disabled_at?: string | null
          id: string
          name: string
          product_id: string
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          attributes?: Json | null
          created_at?: string
          disabled_at?: string | null
          id?: string
          name?: string
          product_id?: string
          sku?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'product_variant_product_id_product_id_fk'
            columns: ['product_id']
            referencedRelation: 'product'
            referencedColumns: ['id']
          },
        ]
      }
      purchase_batch: {
        Row: {
          batch_note: string | null
          buying_price: number
          created_at: string
          currency: Database['cac_store']['Enums']['currency_enum']
          disabled_at: string | null
          done_by: string
          id: string
          product_id: string
          quantity: number
          quantity_remaining: number
          supplier_name: string | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          batch_note?: string | null
          buying_price: number
          created_at?: string
          currency?: Database['cac_store']['Enums']['currency_enum']
          disabled_at?: string | null
          done_by: string
          id: string
          product_id: string
          quantity: number
          quantity_remaining: number
          supplier_name?: string | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          batch_note?: string | null
          buying_price?: number
          created_at?: string
          currency?: Database['cac_store']['Enums']['currency_enum']
          disabled_at?: string | null
          done_by?: string
          id?: string
          product_id?: string
          quantity?: number
          quantity_remaining?: number
          supplier_name?: string | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'purchase_batch_product_id_product_id_fk'
            columns: ['product_id']
            referencedRelation: 'product'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'purchase_batch_variant_id_product_variant_id_fk'
            columns: ['variant_id']
            referencedRelation: 'product_variant'
            referencedColumns: ['id']
          },
        ]
      }
      sale: {
        Row: {
          buying_price: number
          created_at: string
          currency: Database['cac_store']['Enums']['currency_enum']
          customer_name: string | null
          disabled_at: string | null
          done_by: string
          id: string
          product_id: string
          profit: number
          quantity: number
          sale_note: string | null
          selling_price: number
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          buying_price: number
          created_at?: string
          currency?: Database['cac_store']['Enums']['currency_enum']
          customer_name?: string | null
          disabled_at?: string | null
          done_by: string
          id: string
          product_id: string
          profit: number
          quantity: number
          sale_note?: string | null
          selling_price: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          buying_price?: number
          created_at?: string
          currency?: Database['cac_store']['Enums']['currency_enum']
          customer_name?: string | null
          disabled_at?: string | null
          done_by?: string
          id?: string
          product_id?: string
          profit?: number
          quantity?: number
          sale_note?: string | null
          selling_price?: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'sale_product_id_product_id_fk'
            columns: ['product_id']
            referencedRelation: 'product'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sale_variant_id_product_variant_id_fk'
            columns: ['variant_id']
            referencedRelation: 'product_variant'
            referencedColumns: ['id']
          },
        ]
      }
      sale_batch_link: {
        Row: {
          batch_id: string
          created_at: string
          disabled_at: string | null
          id: string
          quantity: number
          sale_id: string
          updated_at: string | null
        }
        Insert: {
          batch_id: string
          created_at?: string
          disabled_at?: string | null
          id: string
          quantity: number
          sale_id: string
          updated_at?: string | null
        }
        Update: {
          batch_id?: string
          created_at?: string
          disabled_at?: string | null
          id?: string
          quantity?: number
          sale_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'sale_batch_link_batch_id_purchase_batch_id_fk'
            columns: ['batch_id']
            referencedRelation: 'purchase_batch'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sale_batch_link_sale_id_sale_id_fk'
            columns: ['sale_id']
            referencedRelation: 'sale'
            referencedColumns: ['id']
          },
        ]
      }
      selling_price: {
        Row: {
          created_at: string
          currency: Database['cac_store']['Enums']['currency_enum']
          disabled_at: string | null
          id: string
          is_active: boolean | null
          price_cents: number
          price_type: string
          product_id: string
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: Database['cac_store']['Enums']['currency_enum']
          disabled_at?: string | null
          id: string
          is_active?: boolean | null
          price_cents: number
          price_type: string
          product_id: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: Database['cac_store']['Enums']['currency_enum']
          disabled_at?: string | null
          id?: string
          is_active?: boolean | null
          price_cents?: number
          price_type?: string
          product_id?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'selling_price_product_id_product_id_fk'
            columns: ['product_id']
            referencedRelation: 'product'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'selling_price_variant_id_product_variant_id_fk'
            columns: ['variant_id']
            referencedRelation: 'product_variant'
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
      currency_enum: 'XOF' | 'USD' | 'EUR'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  chris_test: {
    Tables: {
      message: {
        Row: {
          content: string
          created_at: string
          id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  degarde: {
    Tables: {
      daily_metrics: {
        Row: {
          date: string
          updated_at: string | null
          visit_count: number
        }
        Insert: {
          date: string
          updated_at?: string | null
          visit_count?: number
        }
        Update: {
          date?: string
          updated_at?: string | null
          visit_count?: number
        }
        Relationships: []
      }
      duty_periods: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          start_date?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string | null
          id: string
          idea: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          idea: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          idea?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      insurances: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      pharmacies: {
        Row: {
          base_address: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          base_address: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          base_address?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      pharmacies_to_insurances: {
        Row: {
          insurance_id: string
          pharmacy_id: string
        }
        Insert: {
          insurance_id: string
          pharmacy_id: string
        }
        Update: {
          insurance_id?: string
          pharmacy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pharmacies_to_insurances_insurance_id_insurances_id_fk'
            columns: ['insurance_id']
            referencedRelation: 'insurances'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pharmacies_to_insurances_pharmacy_id_pharmacies_id_fk'
            columns: ['pharmacy_id']
            referencedRelation: 'pharmacies'
            referencedColumns: ['id']
          },
        ]
      }
      pharmacy_duties: {
        Row: {
          duty_period_id: string
          id: string
          pharmacy_id: string
          phones: string
        }
        Insert: {
          duty_period_id: string
          id?: string
          pharmacy_id: string
          phones: string
        }
        Update: {
          duty_period_id?: string
          id?: string
          pharmacy_id?: string
          phones?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pharmacy_duties_duty_period_id_duty_periods_id_fk'
            columns: ['duty_period_id']
            referencedRelation: 'duty_periods'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pharmacy_duties_pharmacy_id_pharmacies_id_fk'
            columns: ['pharmacy_id']
            referencedRelation: 'pharmacies'
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  drizzle: {
    Tables: {
      __drizzle_migrations: {
        Row: {
          created_at: number | null
          hash: string
          id: number
        }
        Insert: {
          created_at?: number | null
          hash: string
          id?: number
        }
        Update: {
          created_at?: number | null
          hash?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
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
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: { p_usename: string }
        Returns: {
          password: string
          username: string
        }[]
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
            foreignKeyName: 'articles_project_id_fkey'
            columns: ['project_id']
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'articles_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
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
            foreignKeyName: 'project_techstacks_project_id_fkey'
            columns: ['project_id']
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_techstacks_techstack_id_fkey'
            columns: ['techstack_id']
            referencedRelation: 'techstacks'
            referencedColumns: ['id']
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
          publication_status: Database['public']['Enums']['publication_status']
          published_at: string | null
          slug: string
          state: Database['public']['Enums']['project_status'] | null
          tech_stack: string[]
          title: string
          type: Database['public']['Enums']['project_type'][]
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
          publication_status?: Database['public']['Enums']['publication_status']
          published_at?: string | null
          slug: string
          state?: Database['public']['Enums']['project_status'] | null
          tech_stack?: string[]
          title: string
          type?: Database['public']['Enums']['project_type'][]
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
          publication_status?: Database['public']['Enums']['publication_status']
          published_at?: string | null
          slug?: string
          state?: Database['public']['Enums']['project_status'] | null
          tech_stack?: string[]
          title?: string
          type?: Database['public']['Enums']['project_type'][]
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'projects_userId_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
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
          use_avatar_as_og_image: boolean
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
          use_avatar_as_og_image?: boolean
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
          use_avatar_as_og_image?: boolean
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
      project_status: 'ongoing' | 'finished' | 'production'
      project_type:
        | 'web'
        | 'mobile'
        | 'script'
        | 'backend'
        | 'infra'
        | 'llm'
        | 'ai'
        | 'desktop'
        | 'api'
        | 'library'
        | 'other'
      publication_status: 'draft' | 'published' | 'archived'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database['storage']['Enums']['buckettype']
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database['storage']['Enums']['buckettype']
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database['storage']['Enums']['buckettype']
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database['storage']['Enums']['buckettype']
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database['storage']['Enums']['buckettype']
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database['storage']['Enums']['buckettype']
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database['storage']['Enums']['buckettype']
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database['storage']['Enums']['buckettype']
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database['storage']['Enums']['buckettype']
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'iceberg_namespaces_catalog_id_fkey'
            columns: ['catalog_id']
            referencedRelation: 'buckets_analytics'
            referencedColumns: ['id']
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          remote_table_id: string | null
          shard_id: string | null
          shard_key: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'iceberg_tables_catalog_id_fkey'
            columns: ['catalog_id']
            referencedRelation: 'buckets_analytics'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'iceberg_tables_namespace_id_fkey'
            columns: ['namespace_id']
            referencedRelation: 'iceberg_namespaces'
            referencedColumns: ['id']
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey'
            columns: ['bucket_id']
            referencedRelation: 'buckets'
            referencedColumns: ['id']
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_bucket_id_fkey'
            columns: ['bucket_id']
            referencedRelation: 'buckets'
            referencedColumns: ['id']
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey'
            columns: ['bucket_id']
            referencedRelation: 'buckets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey'
            columns: ['upload_id']
            referencedRelation: 's3_multipart_uploads'
            referencedColumns: ['id']
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'vector_indexes_bucket_id_fkey'
            columns: ['bucket_id']
            referencedRelation: 'buckets_vectors'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: 'STANDARD' | 'ANALYTICS' | 'VECTOR'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  'taaseekpaye-dev': {
    Tables: {
      language: {
        Row: {
          created_at: string
          icon_url_id: number | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon_url_id?: number | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon_url_id?: number | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'language_icon_url_id_media_id_fk'
            columns: ['icon_url_id']
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
        ]
      }
      media: {
        Row: {
          alt: string
          created_at: string
          filename: string | null
          filesize: number | null
          focal_x: number | null
          focal_y: number | null
          height: number | null
          id: number
          mime_type: string | null
          thumbnail_u_r_l: string | null
          updated_at: string
          url: string | null
          width: number | null
        }
        Insert: {
          alt: string
          created_at?: string
          filename?: string | null
          filesize?: number | null
          focal_x?: number | null
          focal_y?: number | null
          height?: number | null
          id?: number
          mime_type?: string | null
          thumbnail_u_r_l?: string | null
          updated_at?: string
          url?: string | null
          width?: number | null
        }
        Update: {
          alt?: string
          created_at?: string
          filename?: string | null
          filesize?: number | null
          focal_x?: number | null
          focal_y?: number | null
          height?: number | null
          id?: number
          mime_type?: string | null
          thumbnail_u_r_l?: string | null
          updated_at?: string
          url?: string | null
          width?: number | null
        }
        Relationships: []
      }
      owner: {
        Row: {
          bio: Json | null
          created_at: string | null
          first_name: string
          id: number
          last_name: string
          profile_pic_id: number
          title: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: Json | null
          created_at?: string | null
          first_name: string
          id?: number
          last_name: string
          profile_pic_id: number
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: Json | null
          created_at?: string | null
          first_name?: string
          id?: number
          last_name?: string
          profile_pic_id?: number
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'owner_profile_pic_id_media_id_fk'
            columns: ['profile_pic_id']
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
        ]
      }
      owner_contacts: {
        Row: {
          _order: number
          _parent_id: number
          id: string
          provider_id: number | null
          url: string | null
        }
        Insert: {
          _order: number
          _parent_id: number
          id: string
          provider_id?: number | null
          url?: string | null
        }
        Update: {
          _order?: number
          _parent_id?: number
          id?: string
          provider_id?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'owner_contacts_parent_id_fk'
            columns: ['_parent_id']
            referencedRelation: 'owner'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'owner_contacts_provider_id_provider_id_fk'
            columns: ['provider_id']
            referencedRelation: 'provider'
            referencedColumns: ['id']
          },
        ]
      }
      payload_kv: {
        Row: {
          data: Json
          id: number
          key: string
        }
        Insert: {
          data: Json
          id?: number
          key: string
        }
        Update: {
          data?: Json
          id?: number
          key?: string
        }
        Relationships: []
      }
      payload_locked_documents: {
        Row: {
          created_at: string
          global_slug: string | null
          id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          global_slug?: string | null
          id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          global_slug?: string | null
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      payload_locked_documents_rels: {
        Row: {
          id: number
          language_id: number | null
          media_id: number | null
          order: number | null
          parent_id: number
          path: string
          project_id: number | null
          provider_id: number | null
          tech_id: number | null
          users_id: number | null
        }
        Insert: {
          id?: number
          language_id?: number | null
          media_id?: number | null
          order?: number | null
          parent_id: number
          path: string
          project_id?: number | null
          provider_id?: number | null
          tech_id?: number | null
          users_id?: number | null
        }
        Update: {
          id?: number
          language_id?: number | null
          media_id?: number | null
          order?: number | null
          parent_id?: number
          path?: string
          project_id?: number | null
          provider_id?: number | null
          tech_id?: number | null
          users_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'payload_locked_documents_rels_language_fk'
            columns: ['language_id']
            referencedRelation: 'language'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_media_fk'
            columns: ['media_id']
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_parent_fk'
            columns: ['parent_id']
            referencedRelation: 'payload_locked_documents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_project_fk'
            columns: ['project_id']
            referencedRelation: 'project'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_provider_fk'
            columns: ['provider_id']
            referencedRelation: 'provider'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_tech_fk'
            columns: ['tech_id']
            referencedRelation: 'tech'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_users_fk'
            columns: ['users_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      payload_migrations: {
        Row: {
          batch: number | null
          created_at: string
          id: number
          name: string | null
          updated_at: string
        }
        Insert: {
          batch?: number | null
          created_at?: string
          id?: number
          name?: string | null
          updated_at?: string
        }
        Update: {
          batch?: number | null
          created_at?: string
          id?: number
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payload_preferences: {
        Row: {
          created_at: string
          id: number
          key: string | null
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: number
          key?: string | null
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: number
          key?: string | null
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      payload_preferences_rels: {
        Row: {
          id: number
          order: number | null
          parent_id: number
          path: string
          users_id: number | null
        }
        Insert: {
          id?: number
          order?: number | null
          parent_id: number
          path: string
          users_id?: number | null
        }
        Update: {
          id?: number
          order?: number | null
          parent_id?: number
          path?: string
          users_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'payload_preferences_rels_parent_fk'
            columns: ['parent_id']
            referencedRelation: 'payload_preferences'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payload_preferences_rels_users_fk'
            columns: ['users_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      project: {
        Row: {
          created_at: string
          description: Json | null
          id: number
          link: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: Json | null
          id?: number
          link?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: Json | null
          id?: number
          link?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_photos: {
        Row: {
          _order: number
          _parent_id: number
          id: string
          is_main: boolean | null
          media_id: number | null
        }
        Insert: {
          _order: number
          _parent_id: number
          id: string
          is_main?: boolean | null
          media_id?: number | null
        }
        Update: {
          _order?: number
          _parent_id?: number
          id?: string
          is_main?: boolean | null
          media_id?: number | null
        }
        Relationships: []
      }
      project_tech_used: {
        Row: {
          _order: number
          _parent_id: number
          id: string
          techs_id: number | null
        }
        Insert: {
          _order: number
          _parent_id: number
          id: string
          techs_id?: number | null
        }
        Update: {
          _order?: number
          _parent_id?: number
          id?: string
          techs_id?: number | null
        }
        Relationships: []
      }
      project_types: {
        Row: {
          id: number
          order: number
          parent_id: number
          value: Database['taaseekpaye-dev']['Enums']['enum_project_types'] | null
        }
        Insert: {
          id?: number
          order: number
          parent_id: number
          value?: Database['taaseekpaye-dev']['Enums']['enum_project_types'] | null
        }
        Update: {
          id?: number
          order?: number
          parent_id?: number
          value?: Database['taaseekpaye-dev']['Enums']['enum_project_types'] | null
        }
        Relationships: []
      }
      provider: {
        Row: {
          created_at: string
          icon_id: number | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon_id?: number | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon_id?: number | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'provider_icon_id_media_id_fk'
            columns: ['icon_id']
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
        ]
      }
      tech: {
        Row: {
          created_at: string
          icon_url_id: number | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon_url_id?: number | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon_url_id?: number | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tech_icon_url_id_media_id_fk'
            columns: ['icon_url_id']
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          hash: string | null
          id: number
          lock_until: string | null
          login_attempts: number | null
          reset_password_expiration: string | null
          reset_password_token: string | null
          salt: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          hash?: string | null
          id?: number
          lock_until?: string | null
          login_attempts?: number | null
          reset_password_expiration?: string | null
          reset_password_token?: string | null
          salt?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          hash?: string | null
          id?: number
          lock_until?: string | null
          login_attempts?: number | null
          reset_password_expiration?: string | null
          reset_password_token?: string | null
          salt?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      users_sessions: {
        Row: {
          _order: number
          _parent_id: number
          created_at: string | null
          expires_at: string
          id: string
        }
        Insert: {
          _order: number
          _parent_id: number
          created_at?: string | null
          expires_at: string
          id: string
        }
        Update: {
          _order?: number
          _parent_id?: number
          created_at?: string | null
          expires_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_sessions_parent_id_fk'
            columns: ['_parent_id']
            referencedRelation: 'users'
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
      enum_project_types: 'backend' | 'mobile' | 'scripts' | 'web' | 'infra' | 'ai'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  'taasekpaye-cms': {
    Tables: {
      media: {
        Row: {
          alt: string
          created_at: string
          filename: string | null
          filesize: number | null
          focal_x: number | null
          focal_y: number | null
          height: number | null
          id: number
          mime_type: string | null
          thumbnail_u_r_l: string | null
          updated_at: string
          url: string | null
          width: number | null
        }
        Insert: {
          alt: string
          created_at?: string
          filename?: string | null
          filesize?: number | null
          focal_x?: number | null
          focal_y?: number | null
          height?: number | null
          id?: number
          mime_type?: string | null
          thumbnail_u_r_l?: string | null
          updated_at?: string
          url?: string | null
          width?: number | null
        }
        Update: {
          alt?: string
          created_at?: string
          filename?: string | null
          filesize?: number | null
          focal_x?: number | null
          focal_y?: number | null
          height?: number | null
          id?: number
          mime_type?: string | null
          thumbnail_u_r_l?: string | null
          updated_at?: string
          url?: string | null
          width?: number | null
        }
        Relationships: []
      }
      payload_kv: {
        Row: {
          data: Json
          id: number
          key: string
        }
        Insert: {
          data: Json
          id?: number
          key: string
        }
        Update: {
          data?: Json
          id?: number
          key?: string
        }
        Relationships: []
      }
      payload_locked_documents: {
        Row: {
          created_at: string
          global_slug: string | null
          id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          global_slug?: string | null
          id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          global_slug?: string | null
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      payload_locked_documents_rels: {
        Row: {
          id: number
          media_id: number | null
          order: number | null
          parent_id: number
          path: string
          users_id: number | null
        }
        Insert: {
          id?: number
          media_id?: number | null
          order?: number | null
          parent_id: number
          path: string
          users_id?: number | null
        }
        Update: {
          id?: number
          media_id?: number | null
          order?: number | null
          parent_id?: number
          path?: string
          users_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'payload_locked_documents_rels_media_fk'
            columns: ['media_id']
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_parent_fk'
            columns: ['parent_id']
            referencedRelation: 'payload_locked_documents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payload_locked_documents_rels_users_fk'
            columns: ['users_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      payload_migrations: {
        Row: {
          batch: number | null
          created_at: string
          id: number
          name: string | null
          updated_at: string
        }
        Insert: {
          batch?: number | null
          created_at?: string
          id?: number
          name?: string | null
          updated_at?: string
        }
        Update: {
          batch?: number | null
          created_at?: string
          id?: number
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payload_preferences: {
        Row: {
          created_at: string
          id: number
          key: string | null
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: number
          key?: string | null
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: number
          key?: string | null
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      payload_preferences_rels: {
        Row: {
          id: number
          order: number | null
          parent_id: number
          path: string
          users_id: number | null
        }
        Insert: {
          id?: number
          order?: number | null
          parent_id: number
          path: string
          users_id?: number | null
        }
        Update: {
          id?: number
          order?: number | null
          parent_id?: number
          path?: string
          users_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'payload_preferences_rels_parent_fk'
            columns: ['parent_id']
            referencedRelation: 'payload_preferences'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payload_preferences_rels_users_fk'
            columns: ['users_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          hash: string | null
          id: number
          lock_until: string | null
          login_attempts: number | null
          reset_password_expiration: string | null
          reset_password_token: string | null
          salt: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          hash?: string | null
          id?: number
          lock_until?: string | null
          login_attempts?: number | null
          reset_password_expiration?: string | null
          reset_password_token?: string | null
          salt?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          hash?: string | null
          id?: number
          lock_until?: string | null
          login_attempts?: number | null
          reset_password_expiration?: string | null
          reset_password_token?: string | null
          salt?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      users_sessions: {
        Row: {
          _order: number
          _parent_id: number
          created_at: string | null
          expires_at: string
          id: string
        }
        Insert: {
          _order: number
          _parent_id: number
          created_at?: string | null
          expires_at: string
          id: string
        }
        Update: {
          _order?: number
          _parent_id?: number
          created_at?: string | null
          expires_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_sessions_parent_id_fk'
            columns: ['_parent_id']
            referencedRelation: 'users'
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  cac_auth: {
    Enums: {},
  },
  cac_marketing: {
    Enums: {},
  },
  cac_store: {
    Enums: {
      currency_enum: ['XOF', 'USD', 'EUR'],
    },
  },
  chris_test: {
    Enums: {},
  },
  degarde: {
    Enums: {},
  },
  drizzle: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  pgbouncer: {
    Enums: {},
  },
  public: {
    Enums: {
      project_status: ['ongoing', 'finished', 'production'],
      project_type: [
        'web',
        'mobile',
        'script',
        'backend',
        'infra',
        'llm',
        'ai',
        'desktop',
        'api',
        'library',
        'other',
      ],
      publication_status: ['draft', 'published', 'archived'],
    },
  },
  storage: {
    Enums: {
      buckettype: ['STANDARD', 'ANALYTICS', 'VECTOR'],
    },
  },
  'taaseekpaye-dev': {
    Enums: {
      enum_project_types: ['backend', 'mobile', 'scripts', 'web', 'infra', 'ai'],
    },
  },
  'taasekpaye-cms': {
    Enums: {},
  },
} as const
