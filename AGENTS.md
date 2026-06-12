# AGENTS.md

이 파일은 Codex 또는 다른 자동화 에이전트가 `today_in_busan_proj`에서 작업할 때 따라야 하는 프로젝트 지침입니다.

## 작업 위치

이 프로젝트의 루트는 다음 경로입니다.

```txt
C:\Users\playdata2\Desktop\today_in_busan_proj
```

새 프로젝트나 큰 폴더 구조를 만들기 전에는 반드시 사용자에게 생성 위치를 먼저 확인하세요.

## 절대 지켜야 할 보안 규칙

실제 TourAPI 서비스키는 절대 GitHub에 올리지 마세요.

실제 키 파일:

```txt
backend/.env
```

예시 파일:

```txt
backend/.env.example
```

`backend/.env`에는 실제 키가 들어갈 수 있으므로 읽거나 출력할 때 키 값을 그대로 보여주지 마세요. 키 확인이 필요하면 존재 여부, 길이, 따옴표 여부 정도만 확인하세요.

커밋 전 필수 확인:

```powershell
git status -sb --ignored
git ls-files | Select-String -Pattern "\.env$|TOUR_API_KEY"
```

`git ls-files` 검사에서 아무것도 출력되지 않아야 합니다.

## 현재 구조

```txt
backend/
  .env.example
  main.py
  requirements.txt

frontend/
  index.html
  package.json
  vite.config.js
  src/
    App.jsx
    main.jsx
    mockData.js
    pages/
      Home.jsx
      SpotList.jsx
      SpotDetail.jsx
    services/
      tourApi.js
    styles/
      global.css
```

`mockData.js`는 남아 있지만 현재 화면 데이터 흐름에서는 사용하지 않습니다. React 화면은 `frontend/src/services/tourApi.js`를 통해 FastAPI만 호출합니다.

## 실행 포트

Backend:

```txt
http://127.0.0.1:8001
```

Frontend:

```txt
http://127.0.0.1:5173
```

프론트 API base URL:

```txt
http://127.0.0.1:8001/api
```

`tourApi.js`에서 `/api`를 빼면 `/spots` 요청이 되어 404가 발생합니다.

## Backend 지침

백엔드 파일:

```txt
backend/main.py
```

FastAPI 조건:

- `python-dotenv`로 `TOUR_API_KEY` 로드
- CORS는 `http://localhost:5173`과 `http://127.0.0.1:5173` 상황을 고려
- TourAPI timeout은 10초 유지
- 실제 키는 코드에 하드코딩 금지
- TourAPI 에러 응답은 프론트에서 원인 파악이 가능하도록 적절히 전달

TourAPI 기본값:

```txt
API_BASE_URL=https://apis.data.go.kr/B551011/KorService2
MobileOS=ETC
MobileApp=TodayInBusan
_type=json
```

주의: `KorService2`의 상세/이미지 API에 예전 옵션 파라미터를 넣으면 실패할 수 있습니다.

현재 제거한 문제 파라미터:

```txt
defaultYN
firstImageYN
addrinfoYN
mapinfoYN
overviewYN
imageYN
subImageYN
```

이 파라미터들을 다시 넣기 전에는 실제 API 응답을 먼저 검증하세요.

## Frontend 지침

화면 파일:

```txt
frontend/src/pages/Home.jsx
frontend/src/pages/SpotList.jsx
frontend/src/pages/SpotDetail.jsx
```

API 서비스 파일:

```txt
frontend/src/services/tourApi.js
```

디자인을 크게 바꾸라는 요청이 없으면 기존 카드 UI와 CSS 구조를 유지하세요. 현재 우선순위는 UI 개선보다 TourAPI 데이터 연결 안정성입니다.

API 실패 시 화면이 빈 화면이 되지 않도록 loading/error 상태를 유지하세요.

## Git 지침

원격 저장소:

```txt
https://github.com/jiyu-park/today-in-busan.git
```

커밋 컨벤션은 사용자가 제공한 README 규칙을 따릅니다.

```txt
feat: 기능명
fix: 수정내용
docs: 문서명
refactor: 리팩터링내용
```

커밋 전에는 반드시 다음을 확인하세요.

```powershell
git status -sb --ignored
git diff --cached --name-only
```

`.env`, `.venv`, `node_modules`, `dist`, 로그 파일이 staging에 들어가면 안 됩니다.

## 작업 시 주의할 점

- 기존 파일을 크게 갈아엎기 전에 현재 데이터 흐름을 먼저 확인하세요.
- API 오류가 발생하면 React부터 고치지 말고 FastAPI 엔드포인트를 직접 호출해 원인을 분리하세요.
- 404는 보통 프론트 URL prefix 문제입니다.
- 502는 보통 FastAPI에서 TourAPI 호출 실패입니다.
- 이미지가 없을 수 있으므로 UI는 이미지 없는 상태도 견뎌야 합니다.
- 실제 키, 토큰, 인증 정보는 답변에도 그대로 출력하지 마세요.
