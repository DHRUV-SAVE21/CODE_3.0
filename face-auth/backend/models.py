from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class User(BaseModel):
    user_id: str
    email: str
    password_hash: str
    face_data: Optional[Dict[str, Any]] = None
    created_at: datetime = datetime.utcnow()
    last_login: Optional[datetime] = None
    
class FaceData(BaseModel):
    user_id: str
    cloudinary_url: str
    cloudinary_public_id: str
    encryption_format: str = "encrypted"
    face_embeddings: Optional[list] = None
    created_at: datetime = datetime.utcnow()
    
class AuthResponse(BaseModel):
    success: bool
    user_id: Optional[str] = None
    token: Optional[str] = None
    message: str
