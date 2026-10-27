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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      barberias: {
        Row: {
          creado_en: string
          fila_remota_activa: boolean
          id: string
          max_fila: number
          nombre: string
          slug: string
          tolerancia_min: number
          zona: string | null
          zona_horaria: string
        }
        Insert: {
          creado_en?: string
          fila_remota_activa?: boolean
          id?: string
          max_fila?: number
          nombre: string
          slug: string
          tolerancia_min?: number
          zona?: string | null
          zona_horaria?: string
        }
        Update: {
          creado_en?: string
          fila_remota_activa?: boolean
          id?: string
          max_fila?: number
          nombre?: string
          slug?: string
          tolerancia_min?: number
          zona?: string | null
          zona_horaria?: string
        }
        Relationships: []
      }
      barberos: {
        Row: {
          activo: boolean
          apodo: string | null
          barberia_id: string
          en_pausa: boolean
          id: string
          nombre: string
          silla: number | null
          user_id: string | null
        }
        Insert: {
          activo?: boolean
          apodo?: string | null
          barberia_id: string
          en_pausa?: boolean
          id?: string
          nombre: string
          silla?: number | null
          user_id?: string | null
        }
        Update: {
          activo?: boolean
          apodo?: string | null
          barberia_id?: string
          en_pausa?: boolean
          id?: string
          nombre?: string
          silla?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barberos_barberia_id_fkey"
            columns: ["barberia_id"]
            isOneToOne: false
            referencedRelation: "barberias"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_turno: {
        Row: {
          accion: string
          actor: string | null
          barberia_id: string
          detalle: Json
          fecha: string
          id: number
          turno_id: string
        }
        Insert: {
          accion: string
          actor?: string | null
          barberia_id: string
          detalle?: Json
          fecha?: string
          id?: never
          turno_id: string
        }
        Update: {
          accion?: string
          actor?: string | null
          barberia_id?: string
          detalle?: Json
          fecha?: string
          id?: never
          turno_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_turno_barberia_id_fkey"
            columns: ["barberia_id"]
            isOneToOne: false
            referencedRelation: "barberias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_turno_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: false
            referencedRelation: "turnos"
            referencedColumns: ["id"]
          },
        ]
      }
      miembros: {
        Row: {
          barberia_id: string
          rol: Database["public"]["Enums"]["rol_miembro"]
          user_id: string
        }
        Insert: {
          barberia_id: string
          rol: Database["public"]["Enums"]["rol_miembro"]
          user_id: string
        }
        Update: {
          barberia_id?: string
          rol?: Database["public"]["Enums"]["rol_miembro"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "miembros_barberia_id_fkey"
            columns: ["barberia_id"]
            isOneToOne: false
            referencedRelation: "barberias"
            referencedColumns: ["id"]
          },
        ]
      }
      servicios: {
        Row: {
          activo: boolean
          barberia_id: string
          duracion_min: number
          id: string
          nombre: string
          precio_ref: number
        }
        Insert: {
          activo?: boolean
          barberia_id: string
          duracion_min: number
          id?: string
          nombre: string
          precio_ref?: number
        }
        Update: {
          activo?: boolean
          barberia_id?: string
          duracion_min?: number
          id?: string
          nombre?: string
          precio_ref?: number
        }
        Relationships: [
          {
            foreignKeyName: "servicios_barberia_id_fkey"
            columns: ["barberia_id"]
            isOneToOne: false
            referencedRelation: "barberias"
            referencedColumns: ["id"]
          },
        ]
      }
      suscripciones_push: {
        Row: {
          auth: string
          creado_en: string
          endpoint: string
          p256dh: string
          turno_id: string
        }
        Insert: {
          auth: string
          creado_en?: string
          endpoint: string
          p256dh: string
          turno_id: string
        }
        Update: {
          auth?: string
          creado_en?: string
          endpoint?: string
          p256dh?: string
          turno_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_push_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: true
            referencedRelation: "turnos"
            referencedColumns: ["id"]
          },
        ]
      }
      turnos: {
        Row: {
          barberia_id: string
          barbero_id: string | null
          clave_idempotencia: string | null
          codigo_publico: string
          creado_en: string
          dia: string
          estado: Database["public"]["Enums"]["estado_turno"]
          estimado_min: number | null
          fin_en: string | null
          id: string
          inicio_en: string | null
          ip_hash: string | null
          llamado_en: string | null
          metodo_pago: Database["public"]["Enums"]["metodo_pago"] | null
          monto: number | null
          nombre: string
          numero: number
          oculto: boolean
          origen: Database["public"]["Enums"]["origen_turno"]
          secreto_hash: string
          servicio_id: string
          telefono: string | null
        }
        Insert: {
          barberia_id: string
          barbero_id?: string | null
          clave_idempotencia?: string | null
          codigo_publico: string
          creado_en?: string
          dia: string
          estado?: Database["public"]["Enums"]["estado_turno"]
          estimado_min?: number | null
          fin_en?: string | null
          id?: string
          inicio_en?: string | null
          ip_hash?: string | null
          llamado_en?: string | null
          metodo_pago?: Database["public"]["Enums"]["metodo_pago"] | null
          monto?: number | null
          nombre: string
          numero: number
          oculto?: boolean
          origen?: Database["public"]["Enums"]["origen_turno"]
          secreto_hash: string
          servicio_id: string
          telefono?: string | null
        }
        Update: {
          barberia_id?: string
          barbero_id?: string | null
          clave_idempotencia?: string | null
          codigo_publico?: string
          creado_en?: string
          dia?: string
          estado?: Database["public"]["Enums"]["estado_turno"]
          estimado_min?: number | null
          fin_en?: string | null
          id?: string
          inicio_en?: string | null
          ip_hash?: string | null
          llamado_en?: string | null
          metodo_pago?: Database["public"]["Enums"]["metodo_pago"] | null
          monto?: number | null
          nombre?: string
          numero?: number
          oculto?: boolean
          origen?: Database["public"]["Enums"]["origen_turno"]
          secreto_hash?: string
          servicio_id?: string
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turnos_barberia_id_fkey"
            columns: ["barberia_id"]
            isOneToOne: false
            referencedRelation: "barberias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turnos_barbero_id_barberia_id_fkey"
            columns: ["barbero_id", "barberia_id"]
            isOneToOne: false
            referencedRelation: "barberos"
            referencedColumns: ["id", "barberia_id"]
          },
          {
            foreignKeyName: "turnos_servicio_id_barberia_id_fkey"
            columns: ["servicio_id", "barberia_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id", "barberia_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      borrar_telefonos_viejos: { Args: { p_dias?: number }; Returns: number }
      cancelar_turno: {
        Args: { p_codigo: string; p_secreto: string }
        Returns: boolean
      }
      cerrar_dia: { Args: never; Returns: number }
      empezar_turno: { Args: { p_turno_id: string }; Returns: Json }
      fila_publica: { Args: { p_slug: string }; Returns: Json }
      llamar_siguiente: { Args: { p_barbero_id: string }; Returns: Json }
      marcar_no_llego: { Args: { p_turno_id: string }; Returns: Json }
      ocultar_turno: {
        Args: { p_oculto: boolean; p_turno_id: string }
        Returns: boolean
      }
      pausar_barbero: {
        Args: { p_barbero_id: string; p_en_pausa: boolean }
        Returns: boolean
      }
      pausar_fila_remota: {
        Args: { p_barberia_id: string; p_pausada: boolean }
        Returns: boolean
      }
      renombrar_turno: {
        Args: { p_nombre: string; p_turno_id: string }
        Returns: boolean
      }
      reporte_dia: {
        Args: { p_barberia_id: string; p_fecha?: string }
        Returns: Json
      }
      suscribir_push: {
        Args: { p_codigo: string; p_secreto: string; p_suscripcion: Json }
        Returns: boolean
      }
      terminar_turno: {
        Args: {
          p_metodo_pago: Database["public"]["Enums"]["metodo_pago"]
          p_monto: number
          p_servicio_id?: string
          p_turno_id: string
        }
        Returns: Json
      }
      unirse_a_fila: {
        Args: {
          p_barberia_id: string
          p_barbero_id?: string
          p_clave?: string
          p_estimado_min?: number
          p_ip_hash?: string
          p_nombre: string
          p_origen?: Database["public"]["Enums"]["origen_turno"]
          p_secreto: string
          p_servicio_id: string
          p_telefono?: string
        }
        Returns: Json
      }
      vencer_tolerancia: { Args: never; Returns: number }
      ver_turno: { Args: { p_codigo: string }; Returns: Json }
    }
    Enums: {
      estado_turno:
        | "esperando"
        | "llamado"
        | "en_silla"
        | "atendido"
        | "cancelado"
        | "abandono"
        | "no_llego"
      metodo_pago: "efectivo" | "transferencia" | "tarjeta"
      origen_turno: "local" | "remoto"
      rol_miembro: "dueno" | "barbero"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      estado_turno: [
        "esperando",
        "llamado",
        "en_silla",
        "atendido",
        "cancelado",
        "abandono",
        "no_llego",
      ],
      metodo_pago: ["efectivo", "transferencia", "tarjeta"],
      origen_turno: ["local", "remoto"],
      rol_miembro: ["dueno", "barbero"],
    },
  },
} as const
