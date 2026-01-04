import os
import sys
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import db_connection
from cloudinary_config import cloudinary_manager
from face_service import face_auth_service
from models import AuthResponse, LiveDoubtRequest, LiveDoubtResponse
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

@app.post("/api/live-doubt", response_model=LiveDoubtResponse)
async def live_doubt_resolution(request: LiveDoubtRequest):
    try:
        print(f"❓ Doubt submitted by {request.user_id}: {request.student_answer}")
        
        # In a real app, you'd call an LLM here. 
        # For now, we simulate a helpful tutor response.
        answer = request.student_answer.lower()
        if "factor" in answer:
            explanation = "To factorize the expression, look for common terms first. For example, in 2x + 4, the common factor is 2."
        elif "solvent" in answer or "solve" in answer:
            explanation = "Let's break this down into smaller steps. What is the first thing you tried?"
        else:
            explanation = f"I've analyzed your question: '{request.student_answer}'. Let's solve this step-by-step together. What part of the problem seems most confusing?"

        return LiveDoubtResponse(
            mode="AI_ASSISTANCE_MODE",
            explanation={
                "text": explanation
            }
        )
    except Exception as e:
        print(f"❌ error in live doubt resolution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/{user_id}/dashboard")
async def get_dashboard_data(user_id: str):
    try:
        # Simulate fetching data from database for the user progress
        return {
            "overallProgress": 62,
            "problemsSolved": 48,
            "totalProblems": 78,
            "streak": 6,
            "dailyGoalProgress": 75,
            "topicPerformance": [
                {"name": "Binary Search", "score": 80, "color": "emerald"},
                {"name": "Arrays", "score": 60, "color": "amber"},
                {"name": "Dynamic Prog", "score": 40, "color": "rose"}
            ],
            "hintAnalysis": {
                "avgHintLevel": 2.6,
                "maxHintLevel": 4,
                "hintsExhausted": 4,
                "dependency": "High"
            },
            "stuckInsights": {
                "avgStuckScore": 63,
                "highStuckEvents": 5,
                "alerts": ["Frequent hesitation detected"],
                "trend": [45, 52, 48, 70, 63, 58, 63]
            },
            "achievement": {
                "title": "Data Structure Ace",
                "icon": "Trophy",
                "color": "amber",
                "judge_note": "Exceptional logic in Binary Search"
            },
            "detailedExplanations": {
                "overall-learning-progress": {
                    "summary": "Your learning velocity is 22% higher than last week.",
                    "analytics": "You've maintained a 6-day streak with an average of 8 problems per day. Most solutions were sub-optimal on first attempt but improved after review.",
                    "advice": "Focus on space complexity for the next 3 problems to hit your 'Efficiency' milestone."
                },
                "topic-wise-performance": {
                    "summary": "Strong grasp on Search algorithms, need work on Recursive DP.",
                    "analytics": "Binary Search accuracy is at 92%. In Dynamic Programming, you correctly identified 4/5 state transitions but struggled with space-optimized bottom-up approaches.",
                    "advice": "Review 'Tabulation vs Memoization' specifically for knapsack-type problems."
                },
                "hint-&-struggle-analysis": {
                    "summary": "Hint dependency is decreasing in Easy-Medium problems.",
                    "analytics": "You used Level 1 hints (Conceptual) for 80% of your solved problems. Level 4 hints (Code Snippets) were only used once this week.",
                    "advice": "Try to solve 2 'Medium' problems tomorrow without opening any hints for the first 15 minutes."
                },
                "stuck-&-hesitation-insights": {
                    "summary": "Hesitation detected mostly during 'Implementation' phase.",
                    "analytics": "On average, you spend 12 minutes in a 'Stuck' state before either finding a solution or requesting a hint. Most stalls occur during syntax translation.",
                    "advice": "Practice quick pseudo-coding to bridge the gap between logic and syntax."
                },
                "skill-achievement-badge": {
                    "summary": "Achievement based on consistent 90%+ pass rate in Search topics.",
                    "analytics": "Your 'Data Structure Ace' badge was triggered by your flawless execution of 5 'Binary Search' problems without needing implementation hints.",
                    "advice": "Keep this momentum to unlock the 'Algorithm Architect' badge next week."
                }
            }
        }
    except Exception as e:
        print(f"❌ Error fetching dashboard data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/{user_id}/flashcards")
async def get_flashcards(user_id: str):
    try:
        # In production, fetch personalized flashcards based on user's weak areas
        # For now, return sample flashcards
        flashcards = [
            {
                "topic": "Binary Search",
                "concept": "Binary search works by repeatedly dividing the search interval in half. Always ensure your array is sorted before applying binary search.",
                "difficulty": "Medium"
            },
            {
                "topic": "Dynamic Programming",
                "concept": "Break down complex problems into simpler subproblems. Store results of subproblems to avoid redundant calculations (memoization).",
                "difficulty": "Hard"
            },
            {
                "topic": "Array Manipulation",
                "concept": "Two-pointer technique is efficient for problems involving pairs or subarrays. Move pointers based on problem constraints.",
                "difficulty": "Easy"
            },
            {
                "topic": "Time Complexity",
                "concept": "O(log n) is better than O(n). Always analyze worst-case scenarios when choosing algorithms.",
                "difficulty": "Easy"
            }
        ]
        print(f"📚 Fetched {len(flashcards)} flashcards for user {user_id}")
        return {"flashcards": flashcards}
    except Exception as e:
        print(f"❌ Error fetching flashcards: {e}")
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
