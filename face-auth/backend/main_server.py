import os
import sys
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import db_connection
from cloudinary_config import cloudinary_manager
from face_service import face_auth_service
from models import AuthResponse
import uvicorn

load_dotenv()

app = FastAPI(title="Face Authentication API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("\n" + "="*50)
    print("🚀 Starting Face Authentication Server...")
    print("="*50)
    
    print("\n📡 Initializing connections...")
    
    db_connected = db_connection.connect()
    if not db_connected:
        print("❌ Failed to connect to database. Exiting...")
        sys.exit(1)
    
    cloudinary_configured = cloudinary_manager.configure()
    if not cloudinary_configured:
        print("❌ Failed to configure Cloudinary. Exiting...")
        sys.exit(1)
    
    print("\n✅ All services initialized successfully!")
    print("🔐 Face authentication system is ready")
    print("📸 Face images will be encrypted and stored in Cloudinary")
    print("💾 User data will be stored in MongoDB")
    print("="*50)
    print(f"🌐 Server will be available at: http://localhost:{os.getenv('PORT', 8000)}")
    print("="*50 + "\n")

@app.get("/")
async def root():
    return {
        "message": "Face Authentication API",
        "version": "1.0.0",
        "status": "running",
        "features": {
            "mongodb": "✅ Connected",
            "cloudinary": "✅ Connected", 
            "encryption": "✅ Enabled"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "cloudinary": "connected",
        "encryption": "active"
    }

@app.post("/register", response_model=AuthResponse)
async def register_user(
    email: str = Form(...),
    password: str = Form(...),
    face_image: UploadFile = File(...)
):
    try:
        print(f"📝 Registration request for: {email}")
        
        face_image_data = await face_image.read()
        
        result = face_auth_service.register_user_with_face(email, password, face_image_data)
        
        if result["success"]:
            print(f"✅ User {email} registered successfully")
            return AuthResponse(
                success=True,
                user_id=result["user_id"],
                message=result["message"]
            )
        else:
            print(f"❌ Registration failed for {email}: {result['message']}")
            raise HTTPException(status_code=400, detail=result["message"])
            
    except Exception as e:
        print(f"❌ Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/authenticate", response_model=AuthResponse)
async def authenticate_user(face_image: UploadFile = File(...)):
    try:
        print("🔍 Face authentication request received")
        
        face_image_data = await face_image.read()
        
        result = face_auth_service.authenticate_user_with_face(face_image_data)
        
        if result["success"]:
            print(f"✅ Authentication successful for user {result['email']}")
            return AuthResponse(
                success=True,
                user_id=result["user_id"],
                message=result["message"]
            )
        else:
            print(f"❌ Authentication failed: {result['message']}")
            return AuthResponse(
                success=False,
                message=result["message"]
            )
            
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/accounts")
async def get_accounts():
    try:
        users = list(db_connection.get_collection("users").find({}, {"_id": 0}))
        
        accounts = []
        for user in users:
            face_data = db_connection.get_collection("face_data").find_one({"user_id": user["user_id"]}, {"_id": 0})
            if face_data:
                accounts.append({
                    "id": user["user_id"],
                    "fullName": user["email"],
                    "type": "EXISTING",
                    "picture": None,
                    "backendPictureUrl": f"http://localhost:{os.getenv('PORT', 8000)}/api/accounts/custom/{user['user_id']}/image"
                })
        
        print(f"📋 Retrieved {len(accounts)} accounts")
        return accounts
    except Exception as e:
        print(f"❌ Error fetching accounts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/accounts/custom")
async def create_custom_account(
    full_name: str = Form(...),
    image: UploadFile = File(...)
):
    try:
        print(f"👤 Creating custom account: {full_name}")
        
        face_image_data = await image.read()
        
        result = face_auth_service.register_user_with_face(full_name, "default_password", face_image_data)
        
        if result["success"]:
            return {
                "id": result["user_id"],
                "fullName": full_name,
                "message": "Custom account created successfully"
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except Exception as e:
        print(f"❌ Error creating custom account: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/accounts/custom/{user_id}/image")
async def get_user_image(user_id: str):
    try:
        face_data = db_connection.get_collection("face_data").find_one({"user_id": user_id})
        if not face_data:
            raise HTTPException(status_code=404, detail="Face data not found")
        
        decrypted_image = cloudinary_manager.download_and_decrypt_face(face_data["cloudinary_public_id"])
        
        if not decrypted_image:
            raise HTTPException(status_code=500, detail="Failed to retrieve face image")
        
        from fastapi.responses import Response
        return Response(content=decrypted_image, media_type="image/jpeg")
        
    except Exception as e:
        print(f"❌ Error retrieving user image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/face-login")
async def face_login(request: dict):
    try:
        account_id = request.get("accountId")
        success = request.get("success")
        
        if not account_id:
            raise HTTPException(status_code=400, detail="Account ID is required")
        
        if success:
            user = db_connection.get_collection("users").find_one({"user_id": account_id}, {"_id": 0})
            if user:
                print(f"✅ Face login successful for user {user['email']}")
                return {
                    "success": True,
                    "user": user,
                    "message": "Face login successful"
                }
            else:
                raise HTTPException(status_code=404, detail="User not found")
        else:
            return {
                "success": False,
                "message": "Face authentication failed"
            }
            
    except Exception as e:
        print(f"❌ Error in face login: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/{user_id}/face-data")
async def get_user_face_data(user_id: str):
    try:
        result = face_auth_service.get_user_face_data(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("shutdown")
async def shutdown_event():
    print("\n🔒 Shutting down server...")
    db_connection.close()
    print("👋 Server shutdown complete")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
