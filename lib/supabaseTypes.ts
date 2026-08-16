/**
 * Supabase Database Types
 * Supabase CLI로 자동 생성할 수도 있지만, 초기에는 수동 정의합니다.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'student' | 'parent' | 'expert' | 'admin' | 'owner';
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: 'free' | 'premium' | 'pro';
          status: 'active' | 'cancelled' | 'expired' | 'trialing';
          payment_provider: string | null;
          payment_id: string | null;
          starts_at: string;
          expires_at: string | null;
          amount: number;
          currency: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      assessments: {
        Row: {
          id: string;
          user_id: string;
          student_name: string;
          student_info: Json;
          survey_data: Json | null;
          hrv_data: Json | null;
          eeg_data: Json | null;
          protocol_data: Json | null;
          classification_result: Json | null;
          care_type: string | null;
          care_score: number | null;
          study_efficiency_data: Json | null;
          working_memory_result: Json | null;
          cognitive_performance_result: Json | null;
          analysis_text: string | null;
          status: 'draft' | 'survey_only' | 'hrv_added' | 'full' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assessments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['assessments']['Insert']>;
      };
      grades: {
        Row: {
          id: string;
          user_id: string;
          exam_type: string;
          subject: string;
          score: number;
          grade_rank: string | null;
          exam_date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['grades']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['grades']['Insert']>;
      };
      content_queue: {
        Row: {
          id: string;
          type: 'blog' | 'sns' | 'email' | 'notification';
          title: string;
          content: string;
          metadata: Json | null;
          status: 'pending' | 'approved' | 'rejected' | 'published';
          scheduled_at: string | null;
          approved_at: string | null;
          published_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['content_queue']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['content_queue']['Insert']>;
      };
      daily_briefings: {
        Row: {
          id: string;
          date: string;
          metrics: Json;
          pending_approvals: number;
          pending_exceptions: number;
          ai_suggestions: Json;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_briefings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['daily_briefings']['Insert']>;
      };
      exception_queue: {
        Row: {
          id: string;
          type: 'refund' | 'error' | 'complaint' | 'escalation';
          user_id: string | null;
          subject: string;
          description: string;
          ai_recommendation: string | null;
          status: 'pending' | 'resolved' | 'dismissed';
          resolved_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['exception_queue']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['exception_queue']['Insert']>;
      };
      email_sequences: {
        Row: {
          id: string;
          user_id: string;
          sequence_name: string;
          step: number;
          sent_at: string | null;
          status: 'pending' | 'sent' | 'opened' | 'clicked';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['email_sequences']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['email_sequences']['Insert']>;
      };
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          event_data: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['analytics_events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['analytics_events']['Insert']>;
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: 'student' | 'parent' | 'expert' | 'admin' | 'owner';
      subscription_plan: 'free' | 'premium' | 'pro';
      subscription_status: 'active' | 'cancelled' | 'expired' | 'trialing';
      content_type: 'blog' | 'sns' | 'email' | 'notification';
      content_status: 'pending' | 'approved' | 'rejected' | 'published';
    };
  };
}

// 편의 타입 별칭
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Assessment = Database['public']['Tables']['assessments']['Row'];
export type Grade = Database['public']['Tables']['grades']['Row'];
export type ContentQueueItem = Database['public']['Tables']['content_queue']['Row'];
export type DailyBriefing = Database['public']['Tables']['daily_briefings']['Row'];
export type ExceptionQueueItem = Database['public']['Tables']['exception_queue']['Row'];
export type EmailSequence = Database['public']['Tables']['email_sequences']['Row'];
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];
