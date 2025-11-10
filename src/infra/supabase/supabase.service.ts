import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define your Supabase schema types here for strong typing
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          email: string;
          created_at: string;
        };
        Update: {
          email: string;
          created_at: string;
        };
      };
      // NOTE: You will add 'rides', 'bookings', and 'otp_codes' tables here later
    };
  };
};

@Injectable()
export class SupabaseService {
  // Using SupabaseClient<Database> for strong type checking against your schema
  private supabaseAdmin: SupabaseClient<Database>;

  constructor(private readonly configService: ConfigService) {
    // Initialize the Supabase Client using the Service Role Key
    const supabaseUrl = this.configService.get<string>('app.supabaseUrl');
    const supabaseServiceKey = this.configService.get<string>(
      'app.supabaseServiceRoleKey',
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new InternalServerErrorException(
        'Supabase configuration is missing.',
      );
    }

    // Initialize the client with explicit schema types
    this.supabaseAdmin = createClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  /**
   * Provides the Supabase client initialized with the Service Role Key
   * (for backend administrative tasks like finalizePhoneAuth).
   */
  public getAdminClient(): SupabaseClient<Database> {
    return this.supabaseAdmin;
  }
}
