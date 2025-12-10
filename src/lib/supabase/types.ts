export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          slug: string
          description: string | null
          thumbnail_url: string | null
          is_published: boolean
          published_url: string | null
          custom_domain: string | null
          plan: 'free' | 'pro' | 'business'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          slug: string
          description?: string | null
          thumbnail_url?: string | null
          is_published?: boolean
          published_url?: string | null
          custom_domain?: string | null
          plan?: 'free' | 'pro' | 'business'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          slug?: string
          description?: string | null
          thumbnail_url?: string | null
          is_published?: boolean
          published_url?: string | null
          custom_domain?: string | null
          plan?: 'free' | 'pro' | 'business'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_content: {
        Row: {
          id: string
          project_id: string
          blocks: Json
          page_settings: Json
          translations: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          blocks?: Json
          page_settings?: Json
          translations?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          blocks?: Json
          page_settings?: Json
          translations?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_integrations: {
        Row: {
          id: string
          project_id: string
          provider: string
          config: Json
          is_connected: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          provider: string
          config?: Json
          is_connected?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          provider?: string
          config?: Json
          is_connected?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      collaborators: {
        Row: {
          id: string
          project_id: string
          user_id: string
          email: string
          name: string | null
          avatar_url: string | null
          role: 'admin' | 'editor'
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'editor'
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'editor'
          joined_at?: string
        }
        Relationships: []
      }
      integration_connections: {
        Row: {
          id: string
          project_id: string
          provider: string
          provider_id: string
          access_token: string | null
          refresh_token: string | null
          config: Record<string, unknown>
          settings: Record<string, unknown>
          account_info: Record<string, unknown> | null
          is_connected: boolean
          connected_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          provider: string
          provider_id?: string
          access_token?: string | null
          refresh_token?: string | null
          config?: Record<string, unknown>
          settings?: Record<string, unknown>
          account_info?: Record<string, unknown> | null
          is_connected?: boolean
          connected_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          provider?: string
          provider_id?: string
          access_token?: string | null
          refresh_token?: string | null
          config?: Record<string, unknown>
          settings?: Record<string, unknown>
          account_info?: Record<string, unknown> | null
          is_connected?: boolean
          connected_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      collaborator_invites: {
        Row: {
          id: string
          project_id: string
          email: string
          role: 'admin' | 'editor'
          status: 'pending' | 'accepted' | 'declined' | 'expired'
          invited_by: string
          invited_by_name: string | null
          token: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          project_id: string
          email: string
          role?: 'admin' | 'editor'
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          invited_by: string
          invited_by_name?: string | null
          token?: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          email?: string
          role?: 'admin' | 'editor'
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          invited_by?: string
          invited_by_name?: string | null
          token?: string
          created_at?: string
          expires_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: 'light' | 'dark' | 'system'
          email_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          email_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: 'light' | 'dark' | 'system'
          email_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_settings: {
        Row: {
          id: string
          project_id: string
          seo_title: string | null
          seo_description: string | null
          seo_image: string | null
          // Alternative column names for backwards compatibility
          meta_title: string | null
          meta_description: string | null
          keywords: string | null
          og_image: string | null
          favicon: string | null
          visibility: 'public' | 'private' | 'password'
          password: string | null
          published_at: string | null
          umami_site_id: string | null
          umami_enabled: boolean
          google_analytics_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          seo_title?: string | null
          seo_description?: string | null
          seo_image?: string | null
          meta_title?: string | null
          meta_description?: string | null
          keywords?: string | null
          og_image?: string | null
          favicon?: string | null
          visibility?: 'public' | 'private' | 'password'
          password?: string | null
          published_at?: string | null
          umami_site_id?: string | null
          umami_enabled?: boolean
          google_analytics_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          seo_title?: string | null
          seo_description?: string | null
          seo_image?: string | null
          meta_title?: string | null
          meta_description?: string | null
          keywords?: string | null
          og_image?: string | null
          favicon?: string | null
          visibility?: 'public' | 'private' | 'password'
          password?: string | null
          published_at?: string | null
          umami_site_id?: string | null
          umami_enabled?: boolean
          google_analytics_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_invite_info: {
        Args: { p_token: string }
        Returns: {
          success: boolean
          error?: string
          project_title?: string
          project_id?: string
          inviter_name?: string
          role?: string
          email?: string
          invited_by?: string
          expires_at?: string
        }
      }
      accept_invite_by_token: {
        Args: { p_token: string }
        Returns: {
          success: boolean
          error?: string
          project_id?: string
        }
      }
      create_project_invite: {
        Args: {
          p_project_id: string
          p_email: string
          p_role: string
          p_invited_by: string
          p_invited_by_name: string
          p_expires_at: string
        }
        Returns: {
          id: string
          token: string
          created_at: string
          expires_at: string
        }
      }
      get_project_invites: {
        Args: { p_project_id: string }
        Returns: {
          id: string
          project_id: string
          email: string
          role: string
          status: string
          token: string
          invited_by: string
          invited_by_name: string | null
          created_at: string
          expires_at: string
        }[]
      }
    }
    Enums: {
      project_plan: 'free' | 'pro' | 'business'
      collaborator_role: 'admin' | 'editor'
      invite_status: 'pending' | 'accepted' | 'declined' | 'expired'
      theme_preference: 'light' | 'dark' | 'system'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
