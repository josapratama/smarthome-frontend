/**
 * User Preferences DTOs
 */

export interface UserPreferencesDTO {
  theme?: "light" | "dark" | "system";
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sound?: boolean;
  };
  timezone?: string;
}

export interface PreferencesResponse {
  data: UserPreferencesDTO;
}

export interface PreferencesUpdateResponse {
  data: UserPreferencesDTO;
  message: string;
}
