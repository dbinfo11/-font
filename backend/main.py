from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Literal
import re

from services.font_service import generate_font

app = FastAPI(title="Font Studio API")

import os

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class ExportRequest(BaseModel):
    fontName: str = Field(default="MyFont", min_length=1, max_length=64)
    params: dict[str, float]
    format: Literal["ttf", "woff2", "both"] = "ttf"


SAFE_NAME_RE = re.compile(r"[^\w\s-]")
EXT_MAP = {
    "ttf": "ttf",
    "woff2": "woff2",
    "both": "zip",
}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/export")
def export_font(req: ExportRequest):
    safe_name = SAFE_NAME_RE.sub("", req.fontName).strip() or "MyFont"

    try:
        file_bytes, media_type = generate_font(
            params=req.params,
            font_name=safe_name,
            fmt=req.format,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"폰트 생성 실패: {e}")

    ext = EXT_MAP[req.format]
    filename = f"{safe_name}.{ext}"

    return Response(
        content=file_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
