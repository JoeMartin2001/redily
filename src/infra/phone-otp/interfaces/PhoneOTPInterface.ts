export interface PhoneOTPRequest {
  phoneNumber: string;
  message: string;
  from?: Date;
  callback_url?: Date;
}

export interface PhoneOTPResponse {
  id: string;
  message: string;
  status: string;
}

export interface PhoneOTPGlobalRequest {
  phoneNumber: string;
  message: string;
  countryCode: string;
  callback_url?: Date;
  unicode: number;
}

export interface PhoneOTPGlobalResponse {
  id: string;
  message: string;
  status: string;
}

export interface PhoneOTPBatchRequest {
  messages: {
    user_sms_id: string;
    to: number;
    text: string;
  }[];
}

export interface PhoneOTPBatchResponse {
  id: string;
  message: string;
  status: string[];
}

export interface NormalizeMessageResponse {
  special_characters: {
    position: number;
    code: string;
    char: string;
  }[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    token: string;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface PhoneOTPInterface {
  login(loginRequest: LoginRequest): Promise<LoginResponse>;
  refreshToken(
    refreshTokenRequest: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse>;
  send(phoneOTP: PhoneOTPRequest): Promise<PhoneOTPResponse>;
  sendBatch(phoneOTP: PhoneOTPBatchRequest): Promise<PhoneOTPBatchResponse>;
  normalizeMessage(message: string): Promise<NormalizeMessageResponse>;
}
