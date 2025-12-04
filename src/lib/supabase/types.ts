export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
      }
      project_content: {
        Row: {
          id: string
          project_id: string
          blocks: Json
          page_settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          blocks?: Json
          page_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          blocks?: Json
          page_settings?: Json
          created_at?: string
          updated_at?: string
        }
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
          created_at?: string
          expires_at?: string
        }
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
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_plan: 'free' | 'pro' | 'business'
      collaborator_role: 'admin' | 'editor'
      invite_status: 'pending' | 'accepted' | 'declined' | 'expired'
      theme_preference: 'light' | 'dark' | 'system'
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
