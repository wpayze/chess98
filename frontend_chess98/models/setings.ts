export interface Settings {
  id: string;
  user_id: string;

  theme: string;
  board_theme: string;
  piece_set: string;

  animation_speed: number;
  move_confirmation: boolean;
  sound_enabled: boolean;
  auto_promote_to_queen: boolean;
  show_legal_moves: boolean;

  game_notifications: boolean;
  challenge_notifications: boolean;
  friend_notifications: boolean;
  message_notifications: boolean;
  email_notifications: boolean;

  profile_visibility: boolean;
  game_history_visibility: boolean;
  online_status_visibility: boolean;
  allow_friend_requests: boolean;
  allow_data_collection: boolean;
}

export type SettingsPatch = Partial<Pick<
  Settings,
  | "theme"
  | "board_theme"
  | "piece_set"
  | "animation_speed"
  | "move_confirmation"
  | "sound_enabled"
  | "auto_promote_to_queen"
  | "show_legal_moves"
  | "game_notifications"
  | "challenge_notifications"
  | "friend_notifications"
  | "message_notifications"
  | "email_notifications"
  | "profile_visibility"
  | "game_history_visibility"
  | "online_status_visibility"
  | "allow_friend_requests"
  | "allow_data_collection"
>>;