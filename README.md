# Today in Busan

한국관광공사 TourAPI를 활용한 부산 관광 서비스 프론트엔드/백엔드 프로젝트입니다.

현재 단계에서는 React 화면에서 직접 TourAPI 서비스키를 노출하지 않고, FastAPI 백엔드를 통해 관광지 목록, 상세 정보, 이미지, 행사 데이터를 받아오도록 구성했습니다.

## 현재 구현 내용

### Frontend

- React + Vite 기반 화면 구성
- `react-router-dom` 라우팅 적용
- Home 화면
- 관광지 목록 화면
- 관광지 상세 화면
- FastAPI 호출용 서비스 모듈 추가

주요 경로:

```txt
frontend/src/pages/Home.jsx
frontend/src/pages/SpotList.jsx
frontend/src/pages/SpotDetail.jsx
frontend/src/services/tourApi.js
frontend/src/styles/global.css
```

현재 프론트엔드는 아래 API 서버를 바라봅니다.

```txt
http://127.0.0.1:8001/api
```

### Backend

- FastAPI 서버 구성
- `python-dotenv`로 환경변수 로드
- 한국관광공사 KorService2 TourAPI 호출
- React 개발 서버 CORS 허용
- API 키는 `backend/.env`에서만 읽음

주요 경로:

```txt
backend/main.py
backend/requirements.txt
backend/.env.example
```

구현된 API:

```txt
GET /api/spots
GET /api/spots/{content_id}
GET /api/spots/{content_id}/images
GET /api/events
```

## 실행 방법

### 1. Backend 실행

```powershell
cd "C:\Users\playdata2\Desktop\today_in_busan_proj\backend"
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

생성된 `backend/.env` 파일에 실제 TourAPI 서비스키를 넣습니다.

```txt
TOUR_API_KEY=your_real_service_key_here
```

서버 실행:

```powershell
uvicorn main:app --reload --port 8001
```

확인:

```txt
http://127.0.0.1:8001/docs
http://127.0.0.1:8001/api/spots
```

### 2. Frontend 실행

```powershell
cd "C:\Users\playdata2\Desktop\today_in_busan_proj\frontend"
npm install
npm run dev
```

확인:

```txt
http://127.0.0.1:5173
```

## 환경변수와 보안 주의사항

절대 실제 API 키를 GitHub에 올리면 안 됩니다.

실제 키 파일:

```txt
backend/.env
```

예시 파일:

```txt
backend/.env.example
```

`.gitignore`에는 다음 항목이 포함되어 있습니다.

```txt
backend/.env
backend/.venv/
backend/__pycache__/
backend/uvicorn.log
backend/uvicorn.err
frontend/node_modules/
frontend/dist/
frontend/vite.log
frontend/vite.err
```

커밋 전에는 항상 아래 명령으로 `.env`가 추적되지 않는지 확인하세요.

```powershell
git status -sb --ignored
git ls-files | Select-String -Pattern "\.env$|TOUR_API_KEY"
```

두 번째 명령에서 아무것도 출력되지 않아야 안전합니다.

## TourAPI 연동 메모

현재 API 기준:

```txt
API_BASE_URL=https://apis.data.go.kr/B551011/KorService2
MobileOS=ETC
MobileApp=TodayInBusan
_type=json
```

목록 API:

```txt
areaBasedList2
areaCode=6
contentTypeId=12
```

상세 API:

```txt
detailCommon2
contentId={content_id}
```

이미지 API:

```txt
detailImage2
contentId={content_id}
```

행사 API:

```txt
searchFestival2
areaCode=6
```

주의: KorService2의 `detailCommon2`, `detailImage2`는 현재 `defaultYN`, `addrinfoYN`, `overviewYN`, `imageYN`, `subImageYN` 같은 예전 옵션 파라미터를 넣으면 `INVALID_REQUEST_PARAMETER_ERROR`가 발생할 수 있습니다. 현재 백엔드는 최소 파라미터로 호출하도록 정리되어 있습니다.

## 화면 데이터 흐름

```txt
React page
  -> frontend/src/services/tourApi.js
  -> FastAPI backend
  -> 한국관광공사 TourAPI
```

React는 `mockData.js`를 직접 사용하지 않습니다. API 서버가 죽어 있거나 TourAPI 호출이 실패하면 카드 대신 에러 문구가 표시됩니다.

## 트러블슈팅

### React 콘솔에 404가 나오는 경우

요청 주소를 확인하세요.

정상:

```txt
http://127.0.0.1:8001/api/spots
```

오류 가능:

```txt
http://127.0.0.1:8001/spots
```

`frontend/src/services/tourApi.js`의 `API_BASE_URL`에 `/api`가 포함되어야 합니다.

### React 콘솔에 502가 나오는 경우

FastAPI가 TourAPI 호출에 실패한 것입니다. 먼저 백엔드 API를 직접 열어 에러 메시지를 확인하세요.

```txt
http://127.0.0.1:8001/api/spots
http://127.0.0.1:8001/api/spots/129156
```

가능한 원인:

- `backend/.env`가 없음
- `TOUR_API_KEY`가 비어 있음
- 서비스키가 아직 승인되지 않음
- Encoding/Decoding 키 처리 문제
- TourAPI 파라미터 오류
- TourAPI 서버 응답 지연

### 상세 페이지 이미지가 안 나오는 경우

상세 이미지 API를 직접 확인하세요.

```txt
http://127.0.0.1:8001/api/spots/129156/images
```

이미지 목록이 비어 있으면 TourAPI에 해당 콘텐츠 이미지가 없는 것입니다.

## GitHub

원격 저장소:

```txt
https://github.com/jiyu-park/today-in-busan.git
```

커밋 컨벤션:

```txt
feat: 기능명
fix: 수정내용
docs: 문서명
refactor: 리팩터링내용
```

현재 주요 커밋:

```txt
feat: Today in Busan
docs: README
```
