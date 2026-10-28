export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "asignaciones": {
                  Row: {
                    "creada_por": string,"creado_en": string,"descripcion": string | null,"fecha_entrega": string,"grupo_id": string,"id": string,"modulo_id": string | null,"reto_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "creada_por": string,"creado_en"?: string,"descripcion"?: string | null,"fecha_entrega": string,"grupo_id": string,"id"?: string,"modulo_id"?: string | null,"reto_id"?: string | null
                  }
                  Update: {
                    "creada_por"?: string,"creado_en"?: string,"descripcion"?: string | null,"fecha_entrega"?: string,"grupo_id"?: string,"id"?: string,"modulo_id"?: string | null,"reto_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "asignaciones_creada_por_fkey"
      columns: ["creada_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "asignaciones_grupo_id_fkey"
      columns: ["grupo_id"]
isOneToOne: false
      referencedRelation: "grupos"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "asignaciones_modulo_id_fkey"
      columns: ["modulo_id"]
isOneToOne: false
      referencedRelation: "modulos"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "asignaciones_reto_id_fkey"
      columns: ["reto_id"]
isOneToOne: false
      referencedRelation: "retos"
      referencedColumns: ["id"]
    }
                  ]
                },"codigos": {
                  Row: {
                    "actualizado_en": string,"codigo": string,"id": string,"pistas_usadas": number,"reto_id": string,"usuario_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "actualizado_en"?: string,"codigo"?: string,"id"?: string,"pistas_usadas"?: number,"reto_id": string,"usuario_id": string
                  }
                  Update: {
                    "actualizado_en"?: string,"codigo"?: string,"id"?: string,"pistas_usadas"?: number,"reto_id"?: string,"usuario_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "codigos_reto_id_fkey"
      columns: ["reto_id"]
isOneToOne: false
      referencedRelation: "retos"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "codigos_usuario_id_fkey"
      columns: ["usuario_id"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"grupos": {
                  Row: {
                    "codigo_inscripcion": string,"creado_en": string,"docente_id": string,"id": string,"nombre": string,"periodo_fin": string | null,"periodo_inicio": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "codigo_inscripcion": string,"creado_en"?: string,"docente_id": string,"id"?: string,"nombre": string,"periodo_fin"?: string | null,"periodo_inicio"?: string | null
                  }
                  Update: {
                    "codigo_inscripcion"?: string,"creado_en"?: string,"docente_id"?: string,"id"?: string,"nombre"?: string,"periodo_fin"?: string | null,"periodo_inicio"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "grupos_docente_id_fkey"
      columns: ["docente_id"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"inscripciones": {
                  Row: {
                    "fecha": string,"grupo_id": string,"id": string,"usuario_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "fecha"?: string,"grupo_id": string,"id"?: string,"usuario_id": string
                  }
                  Update: {
                    "fecha"?: string,"grupo_id"?: string,"id"?: string,"usuario_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "inscripciones_grupo_id_fkey"
      columns: ["grupo_id"]
isOneToOne: false
      referencedRelation: "grupos"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inscripciones_usuario_id_fkey"
      columns: ["usuario_id"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"insignias": {
                  Row: {
                    "descripcion": string | null,"fecha": string,"id": string,"tipo": string,"usuario_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "descripcion"?: string | null,"fecha"?: string,"id"?: string,"tipo": string,"usuario_id": string
                  }
                  Update: {
                    "descripcion"?: string | null,"fecha"?: string,"id"?: string,"tipo"?: string,"usuario_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "insignias_usuario_id_fkey"
      columns: ["usuario_id"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"intentos": {
                  Row: {
                    "acierto": boolean,"codigo_enviado": string | null,"error_detectado": string | null,"fecha": string,"id": string,"puntos_obtenidos": number,"respuesta": string | null,"resultado": NonNullable<Json>,"reto_id": string,"usuario_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "acierto"?: boolean,"codigo_enviado"?: string | null,"error_detectado"?: string | null,"fecha"?: string,"id"?: string,"puntos_obtenidos"?: number,"respuesta"?: string | null,"resultado"?: NonNullable<Json>,"reto_id": string,"usuario_id": string
                  }
                  Update: {
                    "acierto"?: boolean,"codigo_enviado"?: string | null,"error_detectado"?: string | null,"fecha"?: string,"id"?: string,"puntos_obtenidos"?: number,"respuesta"?: string | null,"resultado"?: NonNullable<Json>,"reto_id"?: string,"usuario_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "intentos_reto_id_fkey"
      columns: ["reto_id"]
isOneToOne: false
      referencedRelation: "retos"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "intentos_usuario_id_fkey"
      columns: ["usuario_id"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"lecciones": {
                  Row: {
                    "archivo_contenido": string,"duracion_min": number | null,"id": string,"modulo_id": string,"orden": number,"titulo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "archivo_contenido": string,"duracion_min"?: number | null,"id"?: string,"modulo_id": string,"orden": number,"titulo": string
                  }
                  Update: {
                    "archivo_contenido"?: string,"duracion_min"?: number | null,"id"?: string,"modulo_id"?: string,"orden"?: number,"titulo"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lecciones_modulo_id_fkey"
      columns: ["modulo_id"]
isOneToOne: false
      referencedRelation: "modulos"
      referencedColumns: ["id"]
    }
                  ]
                },"modulos": {
                  Row: {
                    "archivo_contenido": string,"creado_en": string,"descripcion": string | null,"id": string,"orden": number,"titulo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "archivo_contenido": string,"creado_en"?: string,"descripcion"?: string | null,"id"?: string,"orden": number,"titulo": string
                  }
                  Update: {
                    "archivo_contenido"?: string,"creado_en"?: string,"descripcion"?: string | null,"id"?: string,"orden"?: number,"titulo"?: string
                  }
                  Relationships: [
                    
                  ]
                },"perfiles": {
                  Row: {
                    "acepta_privacidad": boolean,"correo": string,"creado_en": string,"fecha_aceptacion": string | null,"id": string,"nombre": string,"rol": Database["public"]['Enums']["rol_usuario"]
                  }
                  ComputedFields: never
                  Insert: {
                    "acepta_privacidad"?: boolean,"correo": string,"creado_en"?: string,"fecha_aceptacion"?: string | null,"id": string,"nombre": string,"rol"?: Database["public"]['Enums']["rol_usuario"]
                  }
                  Update: {
                    "acepta_privacidad"?: boolean,"correo"?: string,"creado_en"?: string,"fecha_aceptacion"?: string | null,"id"?: string,"nombre"?: string,"rol"?: Database["public"]['Enums']["rol_usuario"]
                  }
                  Relationships: [
                    
                  ]
                },"progresos": {
                  Row: {
                    "estado": Database["public"]['Enums']["estado_progreso"],"fecha": string,"id": string,"leccion_id": string,"usuario_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "estado"?: Database["public"]['Enums']["estado_progreso"],"fecha"?: string,"id"?: string,"leccion_id": string,"usuario_id": string
                  }
                  Update: {
                    "estado"?: Database["public"]['Enums']["estado_progreso"],"fecha"?: string,"id"?: string,"leccion_id"?: string,"usuario_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "progresos_leccion_id_fkey"
      columns: ["leccion_id"]
isOneToOne: false
      referencedRelation: "lecciones"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "progresos_usuario_id_fkey"
      columns: ["usuario_id"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"retos": {
                  Row: {
                    "casos": NonNullable<Json>,"creado_en": string,"enunciado": string,"enunciado_detalle": string | null,"id": string,"intentos_maximos": number,"leccion_id": string,"orden": number,"pistas": NonNullable<Json>,"puntos": number,"reglas": NonNullable<Json>,"tipo": Database["public"]['Enums']["tipo_reto"]
                  }
                  ComputedFields: never
                  Insert: {
                    "casos"?: NonNullable<Json>,"creado_en"?: string,"enunciado": string,"enunciado_detalle"?: string | null,"id"?: string,"intentos_maximos"?: number,"leccion_id": string,"orden"?: number,"pistas"?: NonNullable<Json>,"puntos"?: number,"reglas"?: NonNullable<Json>,"tipo": Database["public"]['Enums']["tipo_reto"]
                  }
                  Update: {
                    "casos"?: NonNullable<Json>,"creado_en"?: string,"enunciado"?: string,"enunciado_detalle"?: string | null,"id"?: string,"intentos_maximos"?: number,"leccion_id"?: string,"orden"?: number,"pistas"?: NonNullable<Json>,"puntos"?: number,"reglas"?: NonNullable<Json>,"tipo"?: Database["public"]['Enums']["tipo_reto"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "retos_leccion_id_fkey"
      columns: ["leccion_id"]
isOneToOne: false
      referencedRelation: "lecciones"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "cambiar_rol":
{ Args: { "p_rol": Database["public"]['Enums']["rol_usuario"],"p_usuario": string }; Returns: undefined
                           },
"es_admin":
{ Args: { "usuario": string }; Returns: boolean
                           },
"es_docente_de":
{ Args: { "grupo": string,"usuario": string }; Returns: boolean
                           },
"es_miembro_de":
{ Args: { "grupo": string,"usuario": string }; Returns: boolean
                           },
"fecha_actual":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"unirse_por_codigo":
{ Args: { "codigo": string }; Returns: string
                           }
          }
          Enums: {
            "estado_progreso": "pendiente"|"en_progreso"|"completado"|"atrasado","rol_usuario": "estudiante"|"docente"|"admin","tipo_reto": "seleccion_multiple"|"ordenamiento"|"autocompletado"|"codigo"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "estado_progreso": ["pendiente", "en_progreso", "completado", "atrasado"],"rol_usuario": ["estudiante", "docente", "admin"],"tipo_reto": ["seleccion_multiple", "ordenamiento", "autocompletado", "codigo"]
          }
        }
} as const
