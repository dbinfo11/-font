"""
Roboto Flex 폰트 파일 다운로드 스크립트
최초 1회만 실행하면 됩니다.
"""
import io
import os
import zipfile
import requests

ZIP_URL = "https://github.com/googlefonts/roboto-flex/releases/download/3.200/roboto-flex-fonts.zip"
FONT_DIR = os.path.join(os.path.dirname(__file__), "fonts")
FONT_PATH = os.path.join(FONT_DIR, "RobotoFlex.ttf")


def download_font():
    if os.path.exists(FONT_PATH):
        print(f"이미 존재: {FONT_PATH}")
        return

    os.makedirs(FONT_DIR, exist_ok=True)
    print("Roboto Flex 다운로드 중 (약 10MB)...")

    response = requests.get(ZIP_URL, timeout=60)
    response.raise_for_status()

    zip_data = io.BytesIO(response.content)
    with zipfile.ZipFile(zip_data) as zf:
        # zip 내부에서 variable TTF 파일 찾기
        ttf_files = [n for n in zf.namelist() if "variable" in n.lower() and n.endswith(".ttf")]
        if not ttf_files:
            ttf_files = [n for n in zf.namelist() if n.endswith(".ttf")]

        if not ttf_files:
            raise FileNotFoundError("zip 안에서 TTF를 찾지 못했습니다.")

        target = ttf_files[0]
        print(f"  추출: {target}")
        with zf.open(target) as src, open(FONT_PATH, "wb") as dst:
            dst.write(src.read())

    size_mb = os.path.getsize(FONT_PATH) / 1024 / 1024
    print(f"완료: {FONT_PATH} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    download_font()
