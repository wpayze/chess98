from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class SettingsOut(BaseModel):
    id: UUID
    user_id: UUID

    theme: str
    board_theme: str
    piece_set: str

    animation_speed: int
    move_confirmation: bool
    sound_enabled: bool
    auto_promote_to_queen: bool
    show_legal_moves: bool

    game_notifications: bool
    challenge_notifications: bool
    friend_notifications: bool
    message_notifications: bool
    email_notifications: bool

    profile_visibility: bool
    game_history_visibility: bool
    online_status_visibility: bool
    allow_friend_requests: bool
    allow_data_collection: bool

    class Config:
        from_attributes = True

class SettingsPatch(BaseModel):
    theme: Optional[str] = None
    board_theme: Optional[str] = None
    piece_set: Optional[str] = None
    animation_speed: Optional[int] = None
    move_confirmation: Optional[bool] = None
    sound_enabled: Optional[bool] = None
    auto_promote_to_queen: Optional[bool] = None
    show_legal_moves: Optional[bool] = None

    game_notifications: Optional[bool] = None
    challenge_notifications: Optional[bool] = None
    friend_notifications: Optional[bool] = None
    message_notifications: Optional[bool] = None
    email_notifications: Optional[bool] = None

    profile_visibility: Optional[bool] = None
    game_history_visibility: Optional[bool] = None
    online_status_visibility: Optional[bool] = None
    allow_friend_requests: Optional[bool] = None
    allow_data_collection: Optional[bool] = None
