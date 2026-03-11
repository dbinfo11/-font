# Font Studio — 개발 기록

## 프로젝트 개요

파라미터 수치 조절로 영문 커스텀 폰트를 만들고 TTF/WOFF2로 다운로드하는 웹 서비스.
일반 개인이 코드 없이 슬라이더만으로 폰트를 생성할 수 있는 것이 목표.

---

## 기술 스택 선정 과정

### 왜 Roboto Flex인가?
폰트 파라미터 조절 서비스를 만들 때 베이스 폰트의 **가변 축(variable axis) 수**가 핵심.

| 폰트 | 가변 축 수 | 비고 |
|------|-----------|------|
| Inter | 1개 (wght만) | 너무 적음 |
| **Roboto Flex** | **13개** | 선택 |
| Fraunces | 4개 | |

Roboto Flex는 Google이 만든 오픈소스 폰트로 OFL 라이선스 (상업적 이용, 재배포 모두 가능).

### 왜 Next.js + FastAPI인가?
- **실시간 미리보기**: CSS `font-variation-settings` 만으로 구현 가능 → 서버 콜 불필요 → Next.js로 충분
- **폰트 파일 생성(Export)**: `fonttools` 라이브러리가 필수 → Python 백엔드 필요
- Node.js 쪽 폰트 라이브러리(`opentype.js`, `fontkit`)는 가변폰트 인스턴스 export 기능 부족

---

## 아키텍처

```
[Browser]
    │
    ├── 슬라이더 조작
    │       ↓
    │   CSS font-variation-settings 즉시 반영 (서버 콜 없음)
    │
    └── Export 버튼 클릭
            ↓
        POST /api/export (JSON: params + fontName + format)
            ↓
        [FastAPI 백엔드]
            ├── fonttools로 Roboto Flex 가변폰트 로드
            ├── 선택한 수치로 static 인스턴스 생성
            ├── Latin 서브세팅 (불필요한 글리프 제거)
            ├── 메타데이터 주입 (폰트 이름 등)
            └── TTF / WOFF2 / ZIP 반환
```

---

## 구현된 기능

### 폰트 파라미터 (13개 가변 축)

| 그룹 | 파라미터 | 범위 | 설명 |
|------|---------|------|------|
| Basic | Weight (wght) | 100–900 | 획 굵기 |
| Basic | Width (wdth) | 25–151% | 글자 너비 |
| Basic | Slant (slnt) | -10–0° | 기울기 |
| Basic | Optical Size (opsz) | 8–144pt | 디스플레이 크기 최적화 |
| Grade | Grade (GRAD) | -200–150 | 자간 변화 없이 굵기 조절 |
| Grade | Counter Width (XTRA) | 323–603 | 글자 내부 공백 너비 |
| Stroke | Thick Stroke (XOPQ) | 27–175 | 세로획 굵기 |
| Stroke | Thin Stroke (YOPQ) | 25–135 | 가로획 굵기 |
| Vertical | Lowercase Height (YTLC) | 416–570 | 소문자 높이 |
| Vertical | Uppercase Height (YTUC) | 528–760 | 대문자 높이 |
| Vertical | Ascender Height (YTAS) | 649–854 | 어센더 높이 |
| Vertical | Descender Depth (YTDE) | -305–-98 | 디센더 깊이 |
| Vertical | Figure Height (YTFI) | 560–788 | 숫자 높이 |

### 타이포그래피 컨트롤

| 파라미터 | 범위 | 설명 |
|---------|------|------|
| Line Height | 0.8–3.0 | 행간 |
| Letter Spacing | -0.1–0.5em | 자간 |
| Word Spacing | 0–2.0em | 단어 간격 |

### 프리셋 시스템
- 기본 내장 11개: Default / Thin / Light / Medium / Bold / Black / Condensed / Wide / Italic / Display / Caption
- 커스텀 프리셋 저장/불러오기/삭제 (localStorage 영속)

### 미리보기 탭 (5개)

| 탭 | 내용 |
|----|------|
| Preview | 편집 가능한 텍스트 + 스냅샷 비교 모드 |
| Waterfall | 72px → 14px 폭포식 크기 비교 + 글리프 샘플 |
| Kerning | AV/WA/TA 등 까다로운 커닝 페어 테스트 |
| Metrics | Ascender/Cap Height/x-Height/Baseline/Descender 시각화 |
| WCAG | 텍스트·배경 색상 명암비 체크 (AA/AAA 판정) |

### 툴바 기능
- 배경 모드: Dark / Light / Grid
- 텍스트 정렬: 좌/중/우
- OpenType 기능 토글: liga / calt / smcp / onum / tnum
- 메트릭스 오버레이 (프리뷰 위에 라인 표시)
- 스냅샷 비교 모드
- CSS 코드 복사 (`@font-face` + `font-variation-settings` 생성)

### Export
- 포맷: TTF / WOFF2 / 둘 다 (ZIP)
- Latin 서브세팅 적용 (Basic Latin + Latin Extended)
- 커스텀 폰트 이름 메타데이터 주입

---

## 프로젝트 구조

```
├── frontend/                     # Next.js 14 (App Router)
│   ├── app/
│   │   ├── layout.tsx            # Google Fonts 로드 (Roboto Flex 13축)
│   │   ├── page.tsx              # 메인 레이아웃
│   │   └── globals.css
│   ├── components/
│   │   ├── Header.tsx            # 폰트명 입력 + Export 버튼
│   │   ├── ParameterPanel.tsx    # 왼쪽 슬라이더 패널
│   │   ├── ParameterSlider.tsx   # 개별 슬라이더 컴포넌트
│   │   ├── PreviewPanel.tsx      # 오른쪽 미리보기 (5개 탭)
│   │   ├── PresetsPanel.tsx      # 프리셋 관리
│   │   └── CSSCodeModal.tsx      # CSS 코드 팝업
│   ├── store/
│   │   └── fontStore.ts          # Zustand 전역 상태
│   └── lib/
│       ├── fontParams.ts         # 13개 축 정의
│       └── utils.ts              # WCAG, CSS 생성, 메트릭스 계산
│
├── backend/                      # FastAPI (Python)
│   ├── main.py                   # API 서버 (/export endpoint)
│   ├── services/
│   │   └── font_service.py       # fonttools 로직
│   ├── setup_fonts.py            # Roboto Flex 다운로드 스크립트
│   └── requirements.txt
│
└── render.yaml                   # Render 배포 설정
```

---

## 로컬 실행

### 백엔드
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python setup_fonts.py        # 최초 1회 — Roboto Flex 다운로드
uvicorn main:app --reload --port 8000
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

→ http://localhost:3000

---

## 배포

| 서비스 | 역할 | 설정 |
|--------|------|------|
| **Vercel** | 프론트엔드 | Root Directory: `frontend/` |
| **Render** | 백엔드 | Root Directory: `backend/` |

### Vercel 환경변수
```
NEXT_PUBLIC_API_URL = https://{render-url}.onrender.com
```

### Render 환경변수
```
ALLOWED_ORIGINS = https://{vercel-url}.vercel.app
```

---

## 주요 기술적 결정

### 1. 실시간 미리보기를 서버 없이 구현
CSS `font-variation-settings` 속성을 JS로 동적 업데이트.
슬라이더 값이 변할 때마다 서버 콜 없이 즉시 반영됨.

### 2. fontTools 대소문자 이슈
pip 패키지명은 `fonttools`이지만 Python import는 `fontTools` (T 대문자).
Windows에서 배포 시 주의 필요.

### 3. next.config.ts → next.config.mjs
Next.js 14.2.3은 TypeScript 설정 파일 미지원.
`.mjs` 확장자 사용.

### 4. Google Fonts @import 위치 문제
`globals.css`에서 `@tailwind` 뒤에 `@import`를 쓰면 브라우저가 무시함.
`layout.tsx`의 `<head>`에 `<link>` 태그로 이동해 해결.

### 5. 메트릭스 계산 방식
Roboto Flex의 파라메트릭 Y축(YTAS, YTDE, YTUC, YTLC)을 UPM(2048)으로 나눠
픽셀 단위 위치를 계산. 행간(line-height)에 따른 half-leading 보정 포함.

```
halfLeading = (lineHeight × fontSize − emSquareHeight) / 2
baselineY   = halfLeading + YTAS / 2048 × fontSize
```
