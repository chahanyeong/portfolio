# 차한영 — End-to-end Data Analytics Engineer 포트폴리오

당근 Data Analytics Engineer 지원용 싱글 페이지 포트폴리오.

## 기술 스택

- HTML5 + CSS3 (custom properties + grid + flexbox)
- Vanilla JavaScript (IntersectionObserver)
- Pretendard (jsdelivr CDN)
- JetBrains Mono (jsdelivr CDN)
- Mermaid.js (jsdelivr CDN)

빌드 도구 없음. 단일 `index.html` 진입.

## 로컬에서 보기

```powershell
cd "<repo-path>"
python -m http.server 8080
```
브라우저: `http://localhost:8080/`

## 디렉토리 구조

```
/
├── index.html                              메인 페이지
├── resume.html                              이력서 페이지
├── css/tokens.css                           디자인 토큰
├── css/main.css                             컴포넌트 스타일
├── js/main.js                               스크롤 fade-up + 카운트업
├── js/mermaid-init.js                       Mermaid 초기화 + Before/After 토글
├── dashboards/duc-ops.html                  DUC 운영 대시보드 (PROJECT 03)
├── samples/mobile-ccu-anomaly.html          redshift_agent 분석 리포트 (AI Card 4)
├── assets/img/                              섹션별 이미지
└── docs/superpowers/                        spec + plan
```

## GitHub Pages 배포

1. GitHub에 새 public 저장소 생성 (예: `daangn-portfolio`)
2. 로컬에서 remote 등록 및 push:
   ```powershell
   git remote add origin https://github.com/<username>/daangn-portfolio.git
   git push -u origin main
   ```
3. GitHub repo → Settings → Pages → Source: `main` 브랜치 / `/` (root) → Save
4. 약 1~2분 후 `https://<username>.github.io/daangn-portfolio/`에서 접근 가능

## 참고 문서

- 디자인 스펙: `docs/superpowers/specs/2026-05-14-daangn-portfolio-design.md`
- 구현 플랜: `docs/superpowers/plans/2026-05-14-daangn-portfolio-implementation.md`
