from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class QueuedPlayer(BaseModel):
    user_id: UUID
    rating: int
    time_control: str
    joined_at: datetime

    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }
