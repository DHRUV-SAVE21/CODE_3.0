import os
import sys
from database import db_connection
from cloudinary_config import cloudinary_manager
from models import User, FaceData
from datetime import datetime
import bcrypt

class FaceAuthService:
    def __init__(self):
        self.users_collection = db_connection.get_collection("users")
        self.faces_collection = db_connection.get_collection("face_data")
        
    def register_user_with_face(self, email: str, password: str, face_image_data: bytes):
        try:
            print(f"👤 Registering user: {email}")
            
            user_id = f"user_{datetime.utcnow().timestamp()}"
            
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            user = User(
                user_id=user_id,
                email=email,
                password_hash=password_hash
            )
            
            self.users_collection.insert_one(user.dict())
            
            upload_result = cloudinary_manager.upload_encrypted_face(user_id, face_image_data)
            
            if upload_result:
                face_data = FaceData(
                    user_id=user_id,
                    cloudinary_url=upload_result["secure_url"],
                    cloudinary_public_id=upload_result["public_id"],
                    encryption_format=upload_result["format"]
                )
                
                self.faces_collection.insert_one(face_data.dict())
                
                print(f"✅ User {email} registered successfully - face stored in Cloudinary")
                return {
                    "success": True,
                    "user_id": user_id,
                    "message": "User registered successfully with encrypted face data in Cloudinary"
                }
            else:
                self.users_collection.delete_one({"user_id": user_id})
                return {
                    "success": False,
                    "message": "Failed to upload encrypted face data to Cloudinary"
                }
                
        except Exception as e:
            print(f"❌ User registration failed: {e}")
            return {
                "success": False,
                "message": f"Registration failed: {str(e)}"
            }
    
    def authenticate_user_with_face(self, face_image_data: bytes):
        try:
            print("🔍 Authenticating user with face...")
            
            users_with_faces = list(self.faces_collection.find({}))
            
            if not users_with_faces:
                return {
                    "success": False,
                    "message": "No registered faces found"
                }
            
            for face_record in users_with_faces:
                try:
                    stored_encrypted_face = cloudinary_manager.download_and_decrypt_face(
                        face_record["cloudinary_public_id"]
                    )
                    
                    if stored_encrypted_face and self.compare_faces(face_image_data, stored_encrypted_face):
                        user = self.users_collection.find_one({"user_id": face_record["user_id"]})
                        
                        if user:
                            self.users_collection.update_one(
                                {"user_id": user["user_id"]},
                                {"$set": {"last_login": datetime.utcnow()}}
                            )
                            
                            print(f"✅ Face authentication successful for user {user['email']}")
                            return {
                                "success": True,
                                "user_id": user["user_id"],
                                "email": user["email"],
                                "message": "Face authentication successful"
                            }
                except Exception as e:
                    print(f"⚠️ Error checking face for user {face_record.get('user_id', 'unknown')}: {e}")
                    continue
            
            return {
                "success": False,
                "message": "Face not recognized"
            }
            
        except Exception as e:
            print(f"❌ Face authentication failed: {e}")
            return {
                "success": False,
                "message": f"Authentication failed: {str(e)}"
            }
    
    def compare_faces(self, face1_data: bytes, face2_data: bytes):
        try:
            from PIL import Image
            import io
            
            img1 = Image.open(io.BytesIO(face1_data))
            img2 = Image.open(io.BytesIO(face2_data))
            
            if img1.size != img2.size:
                return False
            
            pixels1 = list(img1.getdata())
            pixels2 = list(img2.getdata())
            
            if len(pixels1) != len(pixels2):
                return False
            
            diff_count = sum(1 for p1, p2 in zip(pixels1, pixels2) if p1 != p2)
            similarity = 1 - (diff_count / len(pixels1))
            
            return similarity > 0.85
            
        except Exception as e:
            print(f"❌ Face comparison error: {e}")
            return False
    
    def get_user_face_data(self, user_id: str):
        try:
            face_record = self.faces_collection.find_one({"user_id": user_id})
            if face_record:
                return {
                    "success": True,
                    "face_data": face_record
                }
            else:
                return {
                    "success": False,
                    "message": "No face data found for user"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving face data: {str(e)}"
            }

face_auth_service = FaceAuthService()
