# Font Studio

파라미터 조절로 커스텀 폰트를 만들고 TTF/WOFF2로 다운로드하는 서비스.

## 구조

```
26.03.11/
├── frontend/    # Next.js 14 + Tailwind + Zustand
└── backend/     # FastAPI + fonttools
```

## 실행 방법

### 1. 백엔드 세팅

```bash
cd backend

# 가상환경 생성
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate  # Mac/Linux

# 패키지 설치
pip install -r requirements.txt

# Roboto Flex 폰트 다운로드 (최초 1회)
python setup_fonts.py

# 서버 실행
uvicorn main:app --reload --port 8000
```

### 2. 프론트엔드 세팅

```bash
cd frontend

npm install
npm run dev
```

### 3. 접속

http://localhost:3000

## 기능

- **13개 파라미터 실시간 조절** (Weight, Width, Slant, Optical Size + 9개 고급 축)
- **실시간 미리보기** — 슬라이더 움직임과 동시에 반영 (CSS font-variation-settings)
- **Size waterfall** — 72px ~ 14px 다양한 크기로 확인
- **Glyph sample** — 알파벳 대소문자, 숫자, 특수문자
- **Export** — TTF / WOFF2 / 둘 다 (zip) 선택 다운로드
- **영문 서브세팅** — 불필요한 글리프 제거 → 파일 용량 최소화

## 베이스 폰트

**Roboto Flex** (Google Fonts, OFL 라이선스)
13개 가변 축 지원 — 상업적 사용 가능, 재배포 가능.
