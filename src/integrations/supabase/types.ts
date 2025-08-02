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
      employees: {
        Row: {
          account_email: string
          created_at: string
          department: string
          email: string | null
          id: string
          name: string
          salary: number | null
        }
        Insert: {
          account_email: string
          created_at?: string
          department: string
          email?: string | null
          id?: string
          name: string
          salary?: number | null
        }
        Update: {
          account_email?: string
          created_at?: string
          department?: string
          email?: string | null
          id?: string
          name?: string
          salary?: number | null
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          account_email: string
          currency_pair: string
          id: string
          rate: number
          updated_at: string
        }
        Insert: {
          account_email: string
          currency_pair: string
          id?: string
          rate: number
          updated_at?: string
        }
        Update: {
          account_email?: string
          currency_pair?: string
          id?: string
          rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          account_email: string
          barcode: string | null
          created_at: string
          id: string
          name: string
          price: number
          stock: number
          updated_at: string
        }
        Insert: {
          account_email: string
          barcode?: string | null
          created_at?: string
          id?: string
          name: string
          price: number
          stock?: number
          updated_at?: string
        }
        Update: {
          account_email?: string
          barcode?: string | null
          created_at?: string
          id?: string
          name?: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_email: string
          amount: number | null
          description: string | null
          id: string
          product_id: string | null
          products: Json | null
          quantity: number
          student_name: string | null
          total_amount: number
          transaction_date: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          account_email: string
          amount?: number | null
          description?: string | null
          id?: string
          product_id?: string | null
          products?: Json | null
          quantity: number
          student_name?: string | null
          total_amount: number
          transaction_date?: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          account_email?: string
          amount?: number | null
          description?: string | null
          id?: string
          product_id?: string | null
          products?: Json | null
          quantity?: number
          student_name?: string | null
          total_amount?: number
          transaction_date?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_email: string
          balance: number
          barcode: string | null
          created_at: string
          email: string | null
          grade: string | null
          id: string
          name: string
          role: string | null
          secret_code: string
          student_id: string
          updated_at: string
        }
        Insert: {
          account_email: string
          balance?: number
          barcode?: string | null
          created_at?: string
          email?: string | null
          grade?: string | null
          id?: string
          name: string
          role?: string | null
          secret_code: string
          student_id: string
          updated_at?: string
        }
        Update: {
          account_email?: string
          balance?: number
          barcode?: string | null
          created_at?: string
          email?: string | null
          grade?: string | null
          id?: string
          name?: string
          role?: string | null
          secret_code?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      workers: {
        Row: {
          account_email: string
          created_at: string
          email: string | null
          hourly_rate: number | null
          id: string
          name: string
          role: string
        }
        Insert: {
          account_email: string
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          name: string
          role: string
        }
        Update: {
          account_email?: string
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          name?: string
          role?: string
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
    Enums: {},
  },
} as const
