# 다시봄 · 분실물 센터 (프론트엔드)

Vite + React + TypeScript. 캠퍼스 분실물/습득물 게시판.

## 실행
```bash
npm install
npm run dev      # 개발 서버
npm run build    # dist/ 생성 (배포용)
```

## mock ↔ 실제 API 전환  ← 여기가 핵심
- `.env` 에 `VITE_API_URL` 이 **없으면** → mock 데이터로 동작 (오늘 화면 완성용)
- `.env` 에 `VITE_API_URL` 이 **있으면** → 실제 백엔드로 fetch (내일 연결용)

내일 API가 나오면 `.env` 파일을 만들고 한 줄만 추가:
```
VITE_API_URL=http://백엔드_서버_IP:8080
```
페이지 코드는 손댈 필요 없음. 전환 로직은 전부 `src/api/posts.ts` 한 파일에 있습니다.

## 백엔드가 맞춰야 할 API
- `GET  /posts`        → Post[] 반환
- `GET  /posts/:id`    → Post 반환
- `POST /posts`        → { type, category, title, location, desc } 받고 생성된 Post 반환
Post 형태는 `src/types.ts` 참고. 백엔드 응답을 이 형태에 맞추면 프론트는 그대로 동작.

## 서버 배포 (네이버 클라우드)
```bash
npm run build
pm2 start "npx serve -s dist -l 3000" --name front
# ACG에서 3000번(또는 nginx 80번) 포트 열기
```

## 폴더 구조
```
src/
  api/posts.ts      ← mock↔실제 API 전환 (단 하나의 연결 지점)
  data/mockPosts.ts ← 가짜 데이터
  types.ts          ← Post 타입 + 색상 토큰
  components/       ← Header, PostCard
  pages/            ← Home, BoardList, PostDetail, Write, Search, Auth, Report
  App.tsx           ← 라우팅
```
