from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Literal, Optional
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Paths / storage
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
STORAGE_DIR = BASE_DIR / "storage"
TEMP_ACCOUNTS_DIR = STORAGE_DIR / "temp-accounts"


def ensure_storage() -> None:
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    TEMP_ACCOUNTS_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

AccountType = Literal["DUMMY", "CUSTOM"]


class Account(BaseModel):
    id: str
    fullName: str
    picture: str
    type: AccountType = "DUMMY"


class FaceLoginRequest(BaseModel):
    accountId: str
    success: bool


class FaceLoginResponse(BaseModel):
    authenticated: bool
    accountId: Optional[str] = None
    message: str


# ---------------------------------------------------------------------------
# In-memory account store (dummy + custom for this run)
# ---------------------------------------------------------------------------

DUMMY_ACCOUNTS: List[Account] = [
    Account(
        id="374ed1e4-481b-4074-a26e-6137657c6e35",
        fullName="Bilal Gumus",
        picture="374ed1e4-481b-4074-a26e-6137657c6e35/1.jpg",
        type="DUMMY",
    ),
    Account(
        id="43332f46-89a4-435c-880e-4d72bb51149a",
        fullName="Andrew Clark",
        picture="43332f46-89a4-435c-880e-4d72bb51149a/1.jpg",
        type="DUMMY",
    ),
    Account(
        id="b8476d8d-bd7e-405f-aa66-9a22a9727930",
        fullName="Amelia Miller",
        picture="b8476d8d-bd7e-405f-aa66-9a22a9727930/1.jpg",
        type="DUMMY",
    ),
    Account(
        id="88421e2c-ca7a-4332-815f-6e12824e2d05",
        fullName="Sophia Smith",
        picture="88421e2c-ca7a-4332-815f-6e12824e2d05/1.jpg",
        type="DUMMY",
    ),
    Account(
        id="0c2f5599-9296-4f94-97d5-e773043188ae",
        fullName="Emily Martinez",
        picture="0c2f5599-9296-4f94-97d5-e773043188ae/1.jpg",
        type="DUMMY",
    ),
]


ACCOUNTS: Dict[str, Account] = {acc.id: acc for acc in DUMMY_ACCOUNTS}


def get_all_accounts() -> List[Account]:
    return list(ACCOUNTS.values())


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="React Face Auth Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/accounts", response_model=List[Account])
async def list_accounts() -> List[Account]:
    """Return all accounts (dummy + custom created in this session)."""
    return get_all_accounts()


@app.post("/api/accounts/custom", response_model=Account)
async def create_custom_account(
    full_name: str = Form(...),
    image: UploadFile = File(...),
) -> Account:
    """Create a new custom account with an uploaded image."""

    ensure_storage()

    content_type = (image.content_type or "").lower()
    if content_type not in {"image/png", "image/jpeg", "image/jpg"}:
        raise HTTPException(status_code=400, detail="Only PNG and JPEG images are supported.")

    account_id = str(uuid4())
    account_dir = TEMP_ACCOUNTS_DIR / account_id
    account_dir.mkdir(parents=True, exist_ok=True)

    suffix = ".png" if "png" in content_type else ".jpg"
    image_path = account_dir / f"1{suffix}"

    data = await image.read()
    image_path.write_bytes(data)

    picture_rel = f"{account_id}/{image_path.name}"

    account = Account(
        id=account_id,
        fullName=full_name,
        picture=picture_rel,
        type="CUSTOM",
    )

    ACCOUNTS[account.id] = account

    return account


@app.get("/api/accounts/custom/{account_id}/image")
async def get_custom_account_image(account_id: str):
    """Serve the stored image for a custom account."""

    ensure_storage()
    account_dir = TEMP_ACCOUNTS_DIR / account_id
    if not account_dir.exists() or not account_dir.is_dir():
        raise HTTPException(status_code=404, detail="Account not found")

    files = sorted(account_dir.glob("1.*"))
    if not files:
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(files[0])


@app.post("/api/auth/face-login", response_model=FaceLoginResponse)
async def face_login(payload: FaceLoginRequest) -> FaceLoginResponse:
    """Confirm face login attempts based on client-side recognition result."""

    if not payload.success:
        return FaceLoginResponse(
            authenticated=False,
            accountId=None,
            message="Face recognition failed on client.",
        )

    account = ACCOUNTS.get(payload.accountId)
    if account is None:
        return FaceLoginResponse(
            authenticated=False,
            accountId=None,
            message="Unknown account id.",
        )

    return FaceLoginResponse(
        authenticated=True,
        accountId=account.id,
        message="Authenticated",
    )


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}
