import io
import os
import zipfile
from typing import Literal

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.subset import Subsetter, Options

FONT_PATH = os.path.join(os.path.dirname(__file__), "..", "fonts", "RobotoFlex.ttf")

# 영문 + 기본 라틴 유니코드 범위
LATIN_UNICODES = (
    set(range(0x0020, 0x007F))  # Basic Latin
    | set(range(0x00A0, 0x00FF))  # Latin-1 Supplement
    | set(range(0x0100, 0x017F))  # Latin Extended-A
    | set(range(0x0180, 0x024F))  # Latin Extended-B
    | set(range(0x1E00, 0x1EFF))  # Latin Extended Additional
    | {0x2018, 0x2019, 0x201C, 0x201D, 0x2013, 0x2014}  # Smart quotes, dashes
)

# Roboto Flex 축 범위 (범위 밖 값 클램핑용)
AXIS_RANGES = {
    "wght": (100, 900),
    "wdth": (25, 151),
    "slnt": (-10, 0),
    "opsz": (8, 144),
    "GRAD": (-200, 150),
    "XTRA": (323, 603),
    "XOPQ": (27, 175),
    "YOPQ": (25, 135),
    "YTLC": (416, 570),
    "YTUC": (528, 760),
    "YTAS": (649, 854),
    "YTDE": (-305, -98),
    "YTFI": (560, 788),
}


def clamp_params(params: dict[str, float]) -> dict[str, float]:
    clamped = {}
    for key, value in params.items():
        if key in AXIS_RANGES:
            lo, hi = AXIS_RANGES[key]
            clamped[key] = max(lo, min(hi, value))
        else:
            clamped[key] = value
    return clamped


def _load_font() -> TTFont:
    if not os.path.exists(FONT_PATH):
        raise FileNotFoundError(
            f"폰트 파일을 찾을 수 없습니다: {FONT_PATH}\n"
            "backend/ 디렉토리에서 `python setup_fonts.py` 를 먼저 실행하세요."
        )
    return TTFont(FONT_PATH)


def _apply_metadata(tt: TTFont, font_name: str) -> None:
    name_table = tt["name"]
    name_records = {
        1: font_name,           # Family name
        2: "Regular",           # Subfamily
        3: f"{font_name} 1.0",  # Unique ID
        4: font_name,           # Full name
        5: "Version 1.0",       # Version
        6: font_name.replace(" ", "-"),  # PostScript name
    }
    for name_id, value in name_records.items():
        name_table.setName(value, name_id, 3, 1, 0x0409)


def _subset_to_latin(tt: TTFont) -> None:
    options = Options()
    options.layout_features = ["kern", "liga", "calt", "rlig", "locl"]
    options.desubroutinize = True
    options.name_IDs = [1, 2, 3, 4, 5, 6, 16, 17]

    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=LATIN_UNICODES)
    subsetter.subset(tt)


def _to_ttf_bytes(tt: TTFont) -> bytes:
    buf = io.BytesIO()
    tt.save(buf)
    return buf.getvalue()


def _to_woff2_bytes(ttf_bytes: bytes) -> bytes:
    from fontTools.ttLib.woff2 import compress

    ttf_buf = io.BytesIO(ttf_bytes)
    woff2_buf = io.BytesIO()
    compress(ttf_buf, woff2_buf)
    return woff2_buf.getvalue()


def generate_font(
    params: dict[str, float],
    font_name: str,
    fmt: Literal["ttf", "woff2", "both"],
) -> tuple[bytes, str]:
    """
    Returns (file_bytes, media_type)
    fmt='both' → zip 파일 반환
    """
    clamped = clamp_params(params)

    tt = _load_font()

    # 모든 축을 고정값으로 인스턴스화 (static font 생성)
    instancer.instantiateVariableFont(tt, clamped, inplace=True, optimize=True)

    # 영문 서브세팅
    _subset_to_latin(tt)

    # 메타데이터 주입
    _apply_metadata(tt, font_name)

    ttf_bytes = _to_ttf_bytes(tt)

    if fmt == "ttf":
        return ttf_bytes, "font/ttf"

    woff2_bytes = _to_woff2_bytes(ttf_bytes)

    if fmt == "woff2":
        return woff2_bytes, "font/woff2"

    # both → zip
    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(f"{font_name}.ttf", ttf_bytes)
        zf.writestr(f"{font_name}.woff2", woff2_bytes)
    return zip_buf.getvalue(), "application/zip"
