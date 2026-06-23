export interface RegisterDto {
  name: string;
  password: string;
}

export interface LoginDto {
  name: string;
  password: string;
}

export const COOKIE_NAME = "comicspeak_token";
export const MIN_PASSWORD_LENGTH = 4;
