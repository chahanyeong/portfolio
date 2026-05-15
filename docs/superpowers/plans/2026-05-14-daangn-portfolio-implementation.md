# Daangn Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 차한영의 당근 Data Analytics Engineer 지원용 싱글 스크롤 포트폴리오 사이트를 순수 HTML/CSS/JS로 구축해 GitHub Pages에 배포 가능한 상태로 만든다.

**Architecture:** 빌드 도구 없는 정적 사이트. `index.html`이 6개 섹션(HERO / AI ENGINEERING PRACTICE / PROJECT 01 / PROJECT 02 / PROJECT 03 / CONTACT)을 단일 페이지로 담는다. 기존 자산(DUC 대시보드 HTML, redshift_agent 분석 리포트 HTML)은 별도 파일로 두고 main에서 iframe·새 탭으로 연결. 디자인은 Pretendard + 당근 오렌지 액센트의 따뜻한 톤(D · Warm). 모션은 절제(스크롤 fade-up + 카운트업 + Mermaid crossfade 토글).

**Tech Stack:** HTML5, CSS3 (custom properties + grid + flexbox), Vanilla JS (IntersectionObserver, querySelector), Pretendard CDN, JetBrains Mono CDN, Mermaid.js CDN. 빌드/번들러 없음. Python `http.server`로 로컬 미리보기.

**Reference Spec:** `docs/superpowers/specs/2026-05-14-daangn-portfolio-design.md` (v2.4)

---

## Task 0: 프로젝트 초기화 + 자산 복사 + git init

**목적:** 디렉토리 구조를 만들고, 흩어진 원본 자산을 포트폴리오 작업 경로로 이동시키고, git을 초기화해 이후 모든 태스크가 commit 가능하게 한다.

**Files:**
- Create directory: `css/`, `js/`, `dashboards/`, `samples/`, `assets/img/`
- Copy: `auto_calender.png` → `assets/img/auto-calendar-preview.png`
- Copy: `project1_1.png` → `assets/img/project1_decision_pricing.png`
- Copy: `project1_2.png` → `assets/img/project1_decision_betting.png`
- Copy: `차한영 Hanyeong Cha 6f855f6f99364fd5a6c2a667da46aec0.html` → `resume.html`
- Copy: `extracted/portfolio_source/design-a-1-experiment.html` → `dashboards/duc-ops.html`
- Copy: `C:\Users\DG-2308-PC-009\Desktop\work\redshift_agent\domains\engagement\analyses\2026-04-06-mobile-ccu-anomaly\mobile_issue_0406_0407.html` → `samples/mobile-ccu-anomaly.html`
- Copy: `extracted/portfolio_source/image_(8).png` → `assets/img/alert-server-dagster-jobs.png`
- Copy: `extracted/portfolio_source/image_(9).png` → `assets/img/alert-server-timeline.png`
- Create: `.gitignore`

- [ ] **Step 0.1: 디렉토리 구조 생성**

PowerShell:
```powershell
$root = "c:\Users\DG-2308-PC-009\Desktop\포폴"
foreach ($d in @("css","js","dashboards","samples","assets","assets\img")) {
  New-Item -ItemType Directory -Force -Path "$root\$d" | Out-Null
}
Get-ChildItem $root -Directory | Select-Object Name
```
Expected: `css`, `js`, `dashboards`, `samples`, `assets`, `docs`, `extracted` 등이 나열됨.

- [ ] **Step 0.2: 자산 파일 복사**

PowerShell:
```powershell
$root = "c:\Users\DG-2308-PC-009\Desktop\포폴"
Copy-Item "$root\auto_calender.png" "$root\assets\img\auto-calendar-preview.png"
Copy-Item "$root\project1_1.png" "$root\assets\img\project1_decision_pricing.png"
Copy-Item "$root\project1_2.png" "$root\assets\img\project1_decision_betting.png"
Copy-Item "$root\차한영 Hanyeong Cha 6f855f6f99364fd5a6c2a667da46aec0.html" "$root\resume.html"
Copy-Item "$root\extracted\portfolio_source\design-a-1-experiment.html" "$root\dashboards\duc-ops.html"
Copy-Item "C:\Users\DG-2308-PC-009\Desktop\work\redshift_agent\domains\engagement\analyses\2026-04-06-mobile-ccu-anomaly\mobile_issue_0406_0407.html" "$root\samples\mobile-ccu-anomaly.html"
Copy-Item "$root\extracted\portfolio_source\image_(8).png" "$root\assets\img\alert-server-dagster-jobs.png"
Copy-Item "$root\extracted\portfolio_source\image_(9).png" "$root\assets\img\alert-server-timeline.png"
```
Verify:
```powershell
Get-ChildItem "$root\assets\img" | Select-Object Name, Length
Get-ChildItem "$root\samples", "$root\dashboards" | Select-Object Name, Length
Test-Path "$root\resume.html"
```
Expected: 모든 파일이 존재하고 `Length`가 0이 아님. `resume.html`은 True.

- [ ] **Step 0.3: `.gitignore` 작성**

Write `c:\Users\DG-2308-PC-009\Desktop\포폴\.gitignore`:
```
# OS
.DS_Store
Thumbs.db

# Editors
.vscode/
.idea/

# Superpowers brainstorm session artifacts
.superpowers/

# Original Notion export sources (kept locally, not deployed)
extracted/
e8d2ffdb-*.zip
*.zip
19d5e94b-*.png
project1_1.png
project1_2.png
auto_calender.png
차한영 Hanyeong Cha *.html
```

- [ ] **Step 0.4: git 초기화 + 첫 커밋 (spec + plan)**

```powershell
cd "c:\Users\DG-2308-PC-009\Desktop\포폴"
git init
git branch -M main
git add .gitignore docs/superpowers/specs/2026-05-14-daangn-portfolio-design.md docs/superpowers/plans/2026-05-14-daangn-portfolio-implementation.md
git status
```
Expected: spec과 plan 파일이 `Changes to be committed`에 보임. 다른 파일은 staged되지 않음.

```powershell
git commit -m "docs: initial spec + plan for Daangn portfolio"
```
Expected: 커밋 성공.

- [ ] **Step 0.5: 자산 + dashboards + samples 커밋**

```powershell
git add assets/ dashboards/ samples/ resume.html
git status
```
Expected: 위 경로의 파일들만 staged됨.

```powershell
git commit -m "chore: import portfolio assets (images, dashboards, samples, resume)"
```

---

## Task 1: `index.html` 골격 + `<head>` + 섹션 placeholder

**목적:** 모든 섹션이 들어갈 자리를 잡고 CSS/JS 링크를 건다. 이 단계에서는 모든 섹션이 빈 상자.

**Files:**
- Create: `index.html`

- [ ] **Step 1.1: `index.html` 작성**

Write `c:\Users\DG-2308-PC-009\Desktop\포폴\index.html`:
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>차한영 — End-to-end Data Analytics Engineer</title>
  <meta name="description" content="End-to-end Data Analytics Engineer 차한영의 포트폴리오. 지표 정의 · 파이프라인 · BI를 직접 만들고 AI를 동료로 운영합니다." />
  <meta property="og:title" content="차한영 — End-to-end Data Analytics Engineer" />
  <meta property="og:description" content="당근 Data Analytics Engineer 지원 포트폴리오" />
  <meta property="og:type" content="website" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono/web/woff2/JetBrainsMono.css" />
  <link rel="stylesheet" href="/css/tokens.css" />
  <link rel="stylesheet" href="/css/main.css" />
</head>
<body>
  <main id="top">
    <section id="hero" class="section section--hero" aria-label="Hero"></section>
    <section id="ai-practice" class="section section--ai" aria-label="AI Engineering Practice">
      <h2 class="section__title">AI Engineering Practice</h2>
    </section>
    <section id="project-01" class="section section--project" aria-label="Project 01">
      <p class="section__eyebrow">PROJECT 01</p>
      <h2 class="section__title">KPI · 매출 예측 자동화</h2>
    </section>
    <section id="project-02" class="section section--project" aria-label="Project 02">
      <p class="section__eyebrow">PROJECT 02</p>
      <h2 class="section__title">DevOps 기반 스케줄 서버 운영 인프라 구축 및 이상탐지 시스템 KPI 정의</h2>
    </section>
    <section id="project-03" class="section section--project" aria-label="Project 03">
      <p class="section__eyebrow">PROJECT 03</p>
      <h2 class="section__title">자사 앱 대시보드 운영</h2>
    </section>
    <section id="contact" class="section section--contact" aria-label="Contact"></section>
  </main>
  <footer class="site-footer">
    <small>© 2026 차한영 · End-to-end Data Analytics Engineer</small>
  </footer>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js" defer></script>
  <script src="/js/main.js" defer></script>
</body>
</html>
```

- [ ] **Step 1.2: 로컬 서버 띄우고 페이지 로드 확인**

PowerShell (별도 터미널 권장, 백그라운드로 유지):
```powershell
cd "c:\Users\DG-2308-PC-009\Desktop\포폴"
python -m http.server 8080
```
브라우저에서 `http://localhost:8080/` 접속.
Expected: 페이지가 로드되고 섹션 제목(`AI Engineering Practice`, `PROJECT 01` 등)이 보임. CSS는 아직 없어 스타일이 빠진 상태. 콘솔에 CSS 404 에러는 생길 수 있음(다음 태스크에서 해소).

- [ ] **Step 1.3: 커밋**

```powershell
git add index.html
git commit -m "feat: add index.html skeleton with section placeholders"
```

---

## Task 2: `css/tokens.css` — 디자인 토큰

**목적:** 모든 색·폰트·간격·브레이크포인트를 CSS 변수로 정의해서 이후 컴포넌트가 재사용할 수 있게 한다.

**Files:**
- Create: `css/tokens.css`

- [ ] **Step 2.1: `css/tokens.css` 작성**

Write `c:\Users\DG-2308-PC-009\Desktop\포폴\css\tokens.css`:
```css
:root {
  /* Colors */
  --bg: #FFF8F2;
  --surface: #FFFFFF;
  --text: #2A2118;
  --text-muted: #6B6258;
  --accent: #FF6F0F;
  --accent-soft: #FFE1CD;
  --brown: #946A47;
  --border: #F3D9C4;
  --code-bg: #FAF4EC;

  /* Typography */
  --font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace;
  --fs-hero: clamp(2.5rem, 6vw, 4.5rem);     /* 40 ~ 72 */
  --fs-section: clamp(1.75rem, 3.5vw, 2.5rem); /* 28 ~ 40 */
  --fs-sub: 1.375rem;                         /* 22 */
  --fs-body: 1rem;                            /* 16 */
  --fs-small: 0.8125rem;                      /* 13 */
  --lh-body: 1.7;
  --tracking-tight: -0.025em;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 5rem;
  --space-9: 7.5rem;

  /* Layout */
  --max-content: 880px;
  --max-grid: 1080px;
  --radius: 14px;
  --shadow-card: 0 8px 22px rgba(15, 23, 42, 0.04);
  --shadow-card-hover: 0 12px 28px rgba(15, 23, 42, 0.08);

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --t-fast: 180ms;
  --t-med: 250ms;
  --t-slow: 1200ms;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --t-fast: 0ms;
    --t-med: 0ms;
    --t-slow: 0ms;
  }
}
```

- [ ] **Step 2.2: 브라우저에서 토큰 적용 확인**

브라우저에서 `http://localhost:8080/`를 새로고침. DevTools → Elements → `:root` 노드 선택 → Computed → `--bg`가 `#FFF8F2`로 보이는지 확인.

- [ ] **Step 2.3: 커밋**

```powershell
git add css/tokens.css index.html
git commit -m "feat(css): add design tokens (colors, typography, spacing, motion)"
```

---

## Task 3: `css/main.css` — 리셋 + 기본 타이포 + 공통 유틸

**목적:** body 기본 스타일, 박스 모델 리셋, 섹션 컨테이너, 공통 유틸리티 클래스(.chip, .button, .eyebrow)를 만든다.

**Files:**
- Create: `css/main.css`

- [ ] **Step 3.1: `css/main.css` 작성**

Write `c:\Users\DG-2308-PC-009\Desktop\포폴\css\main.css`:
```css
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; }

.section {
  padding: var(--space-9) var(--space-6);
}
.section__title {
  font-size: var(--fs-section);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--space-5);
  max-width: var(--max-content);
  margin-left: auto;
  margin-right: auto;
}
.section__eyebrow {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--brown);
  text-transform: uppercase;
  margin-bottom: var(--space-3);
  max-width: var(--max-content);
  margin-left: auto;
  margin-right: auto;
}
.section__inner {
  max-width: var(--max-content);
  margin: 0 auto;
}

/* Utility: chip */
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--brown);
  letter-spacing: 0.02em;
}
.chip--accent {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.chip__dot {
  width: 6px; height: 6px; border-radius: 50%; background: currentColor;
}

/* Utility: button */
.button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.9375rem;
  font-weight: 600;
  transition: transform var(--t-fast) var(--ease-out), border-color var(--t-fast) var(--ease-out);
}
.button:hover { transform: translateY(-1px); border-color: var(--accent); }
.button--primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.button--primary:hover { background: #ec5d00; border-color: #ec5d00; }

/* Footer */
.site-footer {
  padding: var(--space-6);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--fs-small);
  border-top: 1px solid var(--border);
  margin-top: var(--space-8);
}

/* Responsive padding */
@media (max-width: 720px) {
  .section { padding: var(--space-8) var(--space-5); }
}
```

- [ ] **Step 3.2: 브라우저에서 기본 스타일 확인**

`http://localhost:8080/`를 새로고침. Expected:
- 배경이 베이지(`#FFF8F2`)
- Pretendard 폰트가 적용됨 (DevTools → Computed → font-family에 Pretendard 보임)
- 섹션 제목이 굵고 큼
- 푸터에 `© 2026 차한영...`이 보임

- [ ] **Step 3.3: 커밋**

```powershell
git add css/main.css
git commit -m "feat(css): add reset, base typography, common utilities (chip, button, section)"
```

---

## Task 4: HERO 섹션 마크업 + 스타일

**목적:** 사이트의 첫 인상. 큰 타이틀(`End-to-end Data Analytics Engineer`)과 즉시 CTA, 그리고 코어 스택 칩 한 줄.

**Files:**
- Modify: `index.html` (HERO section body 채우기)
- Modify: `css/main.css` (HERO 스타일 추가)

- [ ] **Step 4.1: HERO 섹션 마크업 추가**

`index.html`에서 `<section id="hero">` 블록을 다음으로 교체:
```html
<section id="hero" class="section section--hero" aria-label="Hero">
  <div class="hero__inner">
    <span class="chip chip--accent">
      <span class="chip__dot"></span>
      DAANGN — DATA ANALYTICS ENGINEER 지원
    </span>
    <h1 class="hero__title">End-to-end Data Analytics Engineer</h1>
    <p class="hero__byline">차한영 · Live Ops Strategy</p>
    <div class="hero__cta">
      <a class="button button--primary" href="mailto:chy0107@afewgoodsoft.com">
        Email
      </a>
      <a class="button" href="https://github.com" target="_blank" rel="noopener">
        GitHub
      </a>
      <a class="button" href="/resume.html" target="_blank" rel="noopener">
        Resume
      </a>
    </div>
    <div class="hero__stack">
      <span class="chip">Dagster</span>
      <span class="chip">DBT</span>
      <span class="chip">Python · SQL</span>
      <span class="chip">AB Test</span>
      <span class="chip">BigQuery · Redshift</span>
      <span class="chip">Claude Code · Codex</span>
    </div>
  </div>
</section>
```

> NOTE: GitHub URL은 placeholder (`https://github.com`). 사용자가 실제 URL을 알려주면 교체. 현재는 외부 페이지로 열리도록만 둠.

- [ ] **Step 4.2: HERO 스타일 추가**

`css/main.css` 맨 아래에 추가:
```css
/* HERO */
.section--hero {
  padding-top: clamp(6rem, 12vw, 9rem);
  padding-bottom: clamp(4rem, 10vw, 7rem);
  background: linear-gradient(180deg, var(--bg) 0%, #fff 100%);
}
.hero__inner {
  max-width: var(--max-content);
  margin: 0 auto;
  text-align: left;
}
.hero__title {
  font-size: var(--fs-hero);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  line-height: 1.05;
  margin-top: var(--space-5);
  margin-bottom: var(--space-3);
  color: var(--text);
}
.hero__byline {
  font-size: 1.125rem;
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}
.hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-7);
}
.hero__stack {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  opacity: 0.85;
}
.hero__stack .chip {
  background: transparent;
  border-color: var(--border);
}
```

- [ ] **Step 4.3: 브라우저에서 HERO 시각 확인**

`http://localhost:8080/`를 새로고침. Expected:
- 상단 오렌지 칩에 "DAANGN — DATA ANALYTICS ENGINEER 지원"
- 큰 타이틀이 한 줄/두 줄로 잘 들어감
- "차한영 · Live Ops Strategy" 한 줄 보조 텍스트
- 세 개의 CTA 버튼 (Email은 오렌지, 나머지는 흰 배경)
- 하단 6개 기술 칩
- Email 버튼 클릭 시 메일 클라이언트가 열리고, Resume 버튼은 새 탭에서 `resume.html` 페이지 로드

- [ ] **Step 4.4: 모바일 (720px 이하) 확인**

DevTools → Responsive 모드 → 360px 폭. Expected: 타이틀이 줄바꿈되어도 깨지지 않고, CTA 버튼이 자연스럽게 줄바꿈됨.

- [ ] **Step 4.5: 커밋**

```powershell
git add index.html css/main.css
git commit -m "feat(hero): add hero section with title, CTA, and core stack chips"
```

---

## Task 5: AI ENGINEERING PRACTICE — 4 통합 카드

**목적:** 포트폴리오 차별화 핵심 섹션. 4개 카드가 [방법론 + 구체 사례 + 태그]를 한꺼번에 전달.

**Files:**
- Modify: `index.html` (AI 섹션 내부 마크업)
- Modify: `css/main.css` (AI 카드 스타일)

- [ ] **Step 5.1: AI 섹션 인트로 + 카드 4개 마크업**

`index.html`에서 `<section id="ai-practice">` 블록을 다음으로 교체:
```html
<section id="ai-practice" class="section section--ai" aria-label="AI Engineering Practice">
  <p class="section__eyebrow">DIFFERENTIATOR</p>
  <h2 class="section__title">AI Engineering Practice</h2>
  <p class="ai__lead">
    AI를 일회성 도구가 아니라 동료로 운영합니다.
    아래 4개 카드는 각각 <em>스케일·안정성·도구 결합력·학습 연속성</em>이라는
    AI 활용 성숙도의 4축을 [방법론 + 실제로 만든 도구]로 함께 보여줍니다.
  </p>

  <div class="ai__grid">

    <!-- Card 1 -->
    <article class="ai-card" id="ai-card-1">
      <div class="ai-card__num">01</div>
      <h3 class="ai-card__title">에이전트 팀으로 다수 이슈 병렬 처리</h3>
      <blockquote class="ai-card__quote">
        복잡도 높은 다량 이슈를 사람 한 명이 직렬로 처리하는 대신,
        에이전트 팀이 병렬로 학습·평가하도록 분업한다.
      </blockquote>
      <div class="ai-card__section">
        <p class="ai-card__label">방법론</p>
        <ul>
          <li>Claude Code의 <strong>agent team</strong> 기능으로 서브에이전트 다수 spawn → 동일 입력에 병렬 작업</li>
          <li>Claude (<code>opus-4-7</code>) + Codex (<code>gpt-5.5 / 5.4 / 5.4-mini</code>) 의도적 병용 → 단일 모델 편향 회피</li>
          <li><code>AGENTS.md</code>에 모델 난이도별 분업 정책 ("약한 모델로 충분하면 그 모델로")</li>
        </ul>
      </div>
      <div class="ai-card__section">
        <p class="ai-card__label">구체 사례 — <code>auto_report/projects/issue_timeline_extractor</code></p>
        <ul>
          <li>26년 상반기 개발 이슈 시트(약 <span class="metric" data-target="120" data-suffix="개">120개</span>)를 Leader 에이전트가 Agent Team을 spawn해 병렬 학습·평가</li>
          <li>단계: <code>preflight → fetch_issues → categorize → discover_channels → fetch_slack → fetch_patches → Agent Team 병렬 → write_csv</code></li>
          <li>산출물: 13-column augmented CSV + 패턴 디텍터 cross-issue audit notes (<code>audit_notes_26H1_*.md</code> v1~v5)</li>
        </ul>
      </div>
      <div class="ai-card__tags">
        <span class="tag">Agent Team</span>
        <span class="tag">Claude Code</span>
        <span class="tag">Codex CLI</span>
        <span class="tag">Slack API</span>
        <span class="tag">Google Sheets</span>
      </div>
    </article>

    <!-- Card 2 -->
    <article class="ai-card" id="ai-card-2">
      <div class="ai-card__num">02</div>
      <h3 class="ai-card__title">라이브 이중 환경 + 에이전트로 안정적인 서버 개발</h3>
      <blockquote class="ai-card__quote">
        바이브 코딩으로 이상탐지 서버를 만들되, 라이브를 절대 직접 건드리지 않는다.
        에이전트는 개발 환경에서만 작업하고, 사람은 최종 승인만 한다.
      </blockquote>
      <div class="ai-card__section">
        <p class="ai-card__label">방법론</p>
        <ul>
          <li><strong>라이브 이중 환경</strong>: <code>aiops_dev</code> ↔ <code>aiops_gsdetection</code> Bitbucket 저장소 동시 관리</li>
          <li>워크스페이스 단위 <strong>컨텍스트 인스트럭션 계층화</strong> — <code>CLAUDE.md</code>, <code>AGENTS.md</code>, <code>.codex/CODEX_ALERT_WORKSPACE.md</code>, <code>ENV_VARIABLES_LIST.md</code></li>
          <li><code>CLAUDE.md</code> 규칙 강제 — 설정 중앙화, 하드코딩 정규식 자동 grep, 백필 안전 룰, 배포 순서(개발 검증 → 승인 → 라이브)</li>
        </ul>
      </div>
      <div class="ai-card__section">
        <p class="ai-card__label">구체 사례 — 이상탐지 얼럿 서버</p>
        <ul>
          <li>Claude Code 에이전트가 자연어 요구사항을 받아 코드 작성·검증 → 관리자는 다른 분석 병행 → 결과 검토 후 라이브 반영</li>
          <li>운영 인프라 측면(Dagster + Bitbucket)은 <a href="#project-02">PROJECT 02 ↓</a>에서 별도로 풀어둠</li>
        </ul>
      </div>
      <div class="ai-card__tags">
        <span class="tag">Claude Code</span>
        <span class="tag">CLAUDE.md</span>
        <span class="tag">Dev/Live 분리</span>
        <span class="tag">Bitbucket</span>
      </div>
    </article>

    <!-- Card 3 -->
    <article class="ai-card" id="ai-card-3">
      <div class="ai-card__num">03</div>
      <h3 class="ai-card__title">플러그인·스킬을 적재적소에 결합</h3>
      <blockquote class="ai-card__quote">
        각 작업에 맞는 플러그인·스킬을 골라 끼우면
        같은 사람이 처리할 수 있는 일의 폭이 달라진다.
      </blockquote>
      <div class="ai-card__section">
        <p class="ai-card__label">사용 중인 플러그인·스킬</p>
        <ul>
          <li><strong>공식 플러그인 <code>superpowers</code></strong> — <code>brainstorming</code> · <code>writing-plans</code> · <code>test-driven-development</code> · <code>systematic-debugging</code> · <code>verification-before-completion</code> · <code>dispatching-parallel-agents</code> · <code>subagent-driven-development</code> · <code>using-git-worktrees</code></li>
          <li><strong>외부 스킬 <code>goal</code></strong> — 세션 단위로 목표 고정, Stop hook으로 이탈 방지 → 멀리 가는 모델링 작업의 컨텍스트 일관성 유지</li>
          <li><strong>커스텀 스킬 <code>creator_team</code></strong> — 6 페이즈 워크플로우 (Brainstorm → Plan → TDD → <strong>Phase 3.5 Dagster UI 검증</strong> → Simplify → Code Review → Finish)</li>
        </ul>
      </div>
      <div class="ai-card__section">
        <p class="ai-card__label">구체 사례 A — <code>GS_projection_renew_slot</code> · <code>goal</code>로 매출 예측 모델 develop</p>
        <ul>
          <li>주간 매출 4주 전망 (28일 롤링) 모델링, <code>experiments/versions/v0_A ~ v5</code> 단계적 실험</li>
          <li><strong>Phase 1 챔피언 <code>v4_AB_blended</code></strong> — base 대비 RMSE·CI·Direction 셋 다 strict 개선</li>
          <li>DB 산출: <code>duc_projection_weights_per_fw</code>, <code>duc_projection_slot_components</code>, <code>duc_total_projection_28_v2</code></li>
        </ul>
      </div>
      <div class="ai-card__section ai-card__section--with-preview">
        <p class="ai-card__label">구체 사례 B — <code>Auto_calender</code> · <code>superpowers/brainstorming</code>으로 자동 앱 일정 캘린더</p>
        <ul>
          <li><strong>다단 LLM 폴백</strong>: Codex CLI → Claude CLI → Claude API → 휴리스틱</li>
          <li><code>serve-approvals</code> 로컬 승인 서버, <code>Manual hold</code> 워크플로우, <code>rollback-run</code></li>
        </ul>
        <figure class="ai-card__preview">
          <img src="/assets/img/auto-calendar-preview.png" alt="Auto Calendar Google Calendar 월간 뷰 — 배포·이벤트가 자동 등록된 화면" loading="lazy" />
          <figcaption>Google Calendar에 자동 등록된 운영 이벤트 (배포·이벤트·세일 등)</figcaption>
        </figure>
      </div>
      <div class="ai-card__tags">
        <span class="tag">superpowers</span>
        <span class="tag">goal</span>
        <span class="tag">creator_team</span>
        <span class="tag">Codex</span>
        <span class="tag">Claude CLI</span>
        <span class="tag">Claude API</span>
        <span class="tag">Approval Server</span>
      </div>
    </article>

    <!-- Card 4 -->
    <article class="ai-card" id="ai-card-4">
      <div class="ai-card__num">04</div>
      <h3 class="ai-card__title">분석 데이터 자산화로 진화하는 에이전트 워크스페이스</h3>
      <blockquote class="ai-card__quote">
        분석은 일회성 답변이 아니라 다음 분석을 더 빠르게 만드는 자산이 되어야 한다.
      </blockquote>
      <div class="ai-card__section">
        <p class="ai-card__label">방법론</p>
        <ul>
          <li>분석 요청 → <code>brainstorming</code>으로 spec 작성 → <code>writing-plans</code>로 plan → 실행 → 산출물 정리 → <strong>재사용 가치 있는 쿼리·KPI를 에이전트가 knowledge로 승격 제안</strong></li>
          <li><strong>Auto Memory</strong> 14개 메모리 파일로 "같은 지적을 두 번 받지 않는 AI" 유지 — "백필은 INSERT만", "DDI 쿼리는 whitelist만"</li>
        </ul>
      </div>
      <div class="ai-card__section">
        <p class="ai-card__label">구체 사례 — <code>redshift_agent</code> · DUC 데이터 분석 전용 에이전트 워크스페이스</p>
        <ul>
          <li>구조: <code>domains/&lt;domain&gt;/analyses/YYYY-MM-DD-&lt;slug&gt;/</code> + <code>knowledge/</code> + <code>shared/Ciphertext</code> + <code>agent/</code></li>
          <li><strong>샘플 분석</strong>: <code>2026-04-06-mobile-ccu-anomaly</code> — 모바일 앱 CCU가 4/6 ~ 4/7 사이 이상치를 보였는지 + 플랫폼/버전 축 분석</li>
          <li>지표 정의: CCU = 15분 단위 접속 유저 수 (8주 baseline)</li>
          <li>산출물: 자기완결형 인터랙티브 HTML 리포트 (d3.js 임베드)</li>
        </ul>
        <a class="button" href="/samples/mobile-ccu-anomaly.html" target="_blank" rel="noopener">
          전체 분석 리포트 열기 ↗
        </a>
      </div>
      <div class="ai-card__tags">
        <span class="tag">Claude Code</span>
        <span class="tag">Auto Memory</span>
        <span class="tag">superpowers</span>
        <span class="tag">Redshift</span>
        <span class="tag">Knowledge Promotion</span>
      </div>
    </article>

  </div>
</section>
```

- [ ] **Step 5.2: AI 섹션 CSS 추가**

`css/main.css` 맨 아래에 추가:
```css
/* AI Engineering Practice */
.section--ai { background: var(--bg); }
.ai__lead {
  max-width: var(--max-content);
  margin: 0 auto var(--space-7);
  color: var(--text-muted);
  font-size: 1.0625rem;
}
.ai__lead em { font-style: normal; color: var(--accent); font-weight: 600; }

.ai__grid {
  max-width: var(--max-grid);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
}
@media (max-width: 880px) {
  .ai__grid { grid-template-columns: 1fr; }
}

.ai-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-6);
  position: relative;
  transition: transform var(--t-fast) var(--ease-out), border-color var(--t-fast) var(--ease-out), box-shadow var(--t-fast) var(--ease-out);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.ai-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: var(--shadow-card-hover);
}
.ai-card__num {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--accent);
}
.ai-card__title {
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 1.3;
}
.ai-card__quote {
  font-style: italic;
  color: var(--text-muted);
  border-left: 3px solid var(--accent-soft);
  padding-left: var(--space-3);
  font-size: 0.9375rem;
}
.ai-card__section { font-size: 0.9375rem; }
.ai-card__label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--brown);
  margin-bottom: var(--space-2);
}
.ai-card ul { padding-left: 1.2em; line-height: 1.6; }
.ai-card li + li { margin-top: 0.25em; }
.ai-card code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: var(--code-bg);
  padding: 1px 6px;
  border-radius: 4px;
}
.ai-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}
.tag {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--code-bg);
  color: var(--brown);
  border: 1px solid var(--border);
}

/* Card 3 preview image */
.ai-card__section--with-preview .ai-card__preview {
  margin-top: var(--space-3);
}
.ai-card__preview img {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--border);
}
.ai-card__preview figcaption {
  font-size: var(--fs-small);
  color: var(--text-muted);
  text-align: center;
  margin-top: var(--space-2);
}

/* Card 4 sample link */
#ai-card-4 .button {
  margin-top: var(--space-3);
  align-self: flex-start;
}
```

- [ ] **Step 5.3: 브라우저에서 4 카드 시각 확인**

`http://localhost:8080/` 새로고침 후 AI 섹션으로 스크롤. Expected:
- 2×2 카드 그리드 (데스크탑)
- 각 카드 좌상단에 `01` ~ `04`
- 인용 블록(quote)이 오렌지-soft 보더로 강조
- 코드 toked이 베이지 배경으로 보임
- 태그 chip이 카드 하단에 가로 정렬
- Card 3에 캘린더 미리보기 이미지가 정상 로딩
- Card 4의 "전체 분석 리포트 열기" 버튼 클릭 시 새 탭에서 `samples/mobile-ccu-anomaly.html`이 d3.js 차트와 함께 로딩

- [ ] **Step 5.4: 모바일에서 카드 단일 컬럼 확인**

DevTools → 360px. Expected: 4개 카드가 수직 스택. 캘린더 이미지가 자연스럽게 카드 폭에 맞춰 축소.

- [ ] **Step 5.5: 커밋**

```powershell
git add index.html css/main.css
git commit -m "feat(ai): add 4 unified cards section (scale, stability, tools, assetization)"
```

---

## Task 6: PROJECT 01 — KPI · 매출 예측 + VVIP 의사결정 사례

**목적:** 의사결정 흐름(데이터 분석 → 시뮬레이션 → 액션 → 결과)을 한 사례로 깊이 있게 풀어내고, 두 이미지로 시각 증거 제공.

**Files:**
- Modify: `index.html` (PROJECT 01 내부)
- Modify: `css/main.css` (project 공통 스타일 + decision case)

- [ ] **Step 6.1: PROJECT 01 마크업**

`<section id="project-01">` 블록을 다음으로 교체:
```html
<section id="project-01" class="section section--project" aria-label="Project 01">
  <div class="section__inner">
    <p class="section__eyebrow">PROJECT 01</p>
    <h2 class="section__title">KPI · 매출 예측 자동화</h2>
    <p class="project__lead">
      주단위 매출 예측 → 주간 KPI 정의 → 4주 변화율 스코어링 자동화 →
      이상치 발견 시 액션 제언 → <strong>실제 의사결정</strong>까지 이어진 파이프라인.
    </p>

    <div class="project__subs">
      <div class="project__sub">
        <p class="sub__label">문제 정의</p>
        <p>배포·이벤트 영향도를 정량 평가할 기준이 없었음.</p>
      </div>
      <div class="project__sub">
        <p class="sub__label">접근</p>
        <p>주단위 매출 예측을 KPI 임계선으로 사용, 4주 평균 대비 변화율을 스코어화.</p>
      </div>
      <div class="project__sub">
        <p class="sub__label">액션 트리거</p>
        <p>변화율 ±N% 이상 또는 KPI 임계선 이탈 시 알럿 + 원인 후보 제언.</p>
      </div>
    </div>

    <h3 class="project__h3">의사결정 사례 — 데이터로 가격 정책을 바꿔 매출을 끌어올림</h3>
    <p class="project__note">
      이 PROJECT의 핵심은 "지표를 본다"가 아니라
      <strong>"지표에서 발견한 신호를 실제 액션으로 옮긴다"</strong>.
    </p>

    <article class="decision-case">
      <header class="decision-case__head">
        <span class="chip chip--accent"><span class="chip__dot"></span>CASE A · 2026-04-09 확정</span>
        <h4>VVIP 가격대 정책 리뉴얼</h4>
      </header>

      <ol class="decision-case__steps">
        <li>
          <p class="step__label">1 · 문제 인지</p>
          <p>인플레이션 영향으로 고액 결제 상품의 상대적 매력도(요율 후함)가 떨어지고 있음을 KPI 보고에서 감지.</p>
        </li>
        <li>
          <p class="step__label">2 · 데이터 분석</p>
          <p>"결제 코인 대비 배팅 금액(최빈)" 차트로 결제 가격대별 유저 행동 패턴 분석.</p>
          <figure class="decision-case__figure">
            <img src="/assets/img/project1_decision_betting.png" alt="결제 코인 대비 배팅 금액 차트 — $499 ~ $999 구간에서 비선형 급증" loading="lazy" />
            <figcaption>
              <strong>발견</strong>: $9 ~ $299는 평탄,
              $499 ~ $999에서 비선형 급증 →
              <em>고액 결제자가 결제 코인 대비 과도하게 큰 배팅 → 현재 offering이 박함</em>
            </figcaption>
          </figure>
        </li>
        <li>
          <p class="step__label">3 · 시뮬레이션</p>
          <p>가격대별 <code>BaseCoin / 판매가격 % 요율</code> 변경안 작성.</p>
          <figure class="decision-case__figure">
            <img src="/assets/img/project1_decision_pricing.png" alt="가격대별 BaseCoin / 판매가격 % 요율 변경안 — $99~$999 구간 절대 코인량 증가" loading="lazy" />
            <figcaption>
              <strong>변경 정책</strong>: $1 ~ $59는 그대로, $99 ~ $999는 $1당 지급 코인을 2.25 ~ 1.3배 증가.
              prestige 비율($1 대비 %)은 일부 축소 — 절대 코인량은 늘리되 등급 간 격차는 유지.
            </figcaption>
          </figure>
        </li>
        <li>
          <p class="step__label">4 · 사전 검증</p>
          <p>상위상품 요율 증가가 게임 내 인플레이션(코인 가치 하락)을 야기하지 않는지 시뮬레이션.</p>
        </li>
        <li>
          <p class="step__label">5 · 액션 → 결과</p>
          <p>2026-04-09 변경안 적용. 인플레이션 이후 m/m 매출 <span class="metric metric--lg" data-target="7.9" data-suffix="%" data-prefix="+">+7.9%</span> 증가, 고액상품 건수 구매 비율 유지.</p>
        </li>
      </ol>
    </article>

    <article class="decision-case decision-case--minor">
      <header class="decision-case__head">
        <span class="chip"><span class="chip__dot"></span>CASE B</span>
        <h4>Facebook 팬페이지 정지 대응</h4>
      </header>
      <p>
        KPI 보고에서 AU 하락 감지 → 외부 채널(Facebook 팬페이지) 정지 원인 식별 →
        대체 페이지 정보를 유저에게 PUSH로 안내하는 UE 채널 대응 → 유저 복귀 확인.
      </p>
    </article>
  </div>
</section>
```

- [ ] **Step 6.2: project 공통 + decision-case 스타일 추가**

`css/main.css` 맨 아래에 추가:
```css
/* Project section common */
.section--project { background: var(--bg); }
.project__lead {
  max-width: var(--max-content);
  margin: 0 auto var(--space-7);
  font-size: 1.0625rem;
  color: var(--text-muted);
}
.project__lead strong { color: var(--text); }
.project__subs {
  max-width: var(--max-content);
  margin: 0 auto var(--space-7);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
@media (max-width: 720px) {
  .project__subs { grid-template-columns: 1fr; }
}
.project__sub {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: var(--space-4);
}
.sub__label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--brown);
  margin-bottom: var(--space-2);
  font-weight: 700;
}
.project__h3 {
  font-size: var(--fs-sub);
  font-weight: 700;
  letter-spacing: -0.01em;
  max-width: var(--max-content);
  margin: var(--space-7) auto var(--space-2);
}
.project__note {
  max-width: var(--max-content);
  margin: 0 auto var(--space-6);
  color: var(--text-muted);
}
.project__note strong { color: var(--accent); }

/* Decision case */
.decision-case {
  max-width: var(--max-content);
  margin: 0 auto var(--space-6);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-6);
  box-shadow: var(--shadow-card);
}
.decision-case--minor { box-shadow: none; }
.decision-case__head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}
.decision-case__head h4 {
  font-size: 1.25rem;
  font-weight: 700;
}
.decision-case__steps {
  list-style: none;
  counter-reset: case-step;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.decision-case__steps > li {
  border-left: 2px solid var(--accent-soft);
  padding-left: var(--space-4);
}
.step__label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 700;
  margin-bottom: var(--space-2);
}
.decision-case__figure {
  margin-top: var(--space-3);
}
.decision-case__figure img {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
}
.decision-case__figure figcaption {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: var(--space-2);
  line-height: 1.55;
}
.decision-case__figure figcaption strong { color: var(--text); }
.decision-case__figure figcaption em {
  font-style: normal;
  color: var(--accent);
  font-weight: 600;
}
.metric {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--accent);
}
.metric--lg { font-size: 1.25em; }
```

- [ ] **Step 6.3: 브라우저에서 PROJECT 01 시각 확인**

`http://localhost:8080/#project-01`로 이동. Expected:
- 큰 제목 "KPI · 매출 예측 자동화"
- 3개 sub 카드 (문제 정의 / 접근 / 액션 트리거)
- 의사결정 사례 카드에 5단계가 좌측 오렌지 라인으로 정렬
- 두 차트 이미지가 깨지지 않고 보이고, figcaption이 자연스럽게 따라옴
- `+7.9%`가 모노스페이스 오렌지로 강조

- [ ] **Step 6.4: 모바일 확인**

360px로 축소. Expected: 3개 sub 카드가 수직 스택, 이미지는 가로 폭 100%로 맞춰지고 가독성 유지.

- [ ] **Step 6.5: 커밋**

```powershell
git add index.html css/main.css
git commit -m "feat(project-01): add KPI/revenue forecast with VVIP pricing decision case"
```

---

## Task 7: PROJECT 02 — DevOps 인프라 + Mermaid Before/After 토글

**목적:** AI 색채는 빼고 Dagster + Bitbucket 운영 자동화 어필. Mermaid 다이어그램 2개를 토글로 전환.

**Files:**
- Modify: `index.html` (PROJECT 02 내부)
- Create: `js/mermaid-init.js`
- Modify: `css/main.css` (Mermaid 토글 + 비교표 스타일)

- [ ] **Step 7.1: PROJECT 02 마크업**

`<section id="project-02">` 블록을 다음으로 교체:
```html
<section id="project-02" class="section section--project" aria-label="Project 02">
  <div class="section__inner">
    <p class="section__eyebrow">PROJECT 02</p>
    <h2 class="section__title">DevOps 기반 스케줄 서버 운영 인프라 구축 및 이상탐지 시스템 KPI 정의</h2>
    <p class="project__lead">
      WHOW/DDC/DUC/SA/Bingo 등 게임 서비스의 핵심 지표를 24시간 자동 모니터링하는 Dagster 파이프라인.
      크론탭 + 주피터 기반 임시 운영을 <strong>Dagster + Bitbucket(CI/CD)</strong> 기반 표준 운영 인프라로 전환.
    </p>

    <div class="project__subs project__subs--two">
      <div class="project__sub">
        <p class="sub__label">기존 운영의 한계</p>
        <ul>
          <li>이상탐지 KPI 부재 (정성적 판단)</li>
          <li>주피터 노트북 직접 사용 → 버전 관리 불가</li>
          <li>크론탭 UI·로그 부재 → 점검 비용 큼</li>
          <li>라이브 서버 직접 수정·배포</li>
        </ul>
      </div>
      <div class="project__sub">
        <p class="sub__label">현재 운영 인프라</p>
        <ul>
          <li><strong>이상탐지 시스템 KPI 정의</strong> (recall · 오탐률 · 반응성)</li>
          <li>Bitbucket 코드 버전 관리·롤백 체계 표준화</li>
          <li>Bitbucket Runner CI/CD 자동 배포</li>
          <li>Dagster UI로 실행 로그·작업 흐름 시각화</li>
          <li><strong>크론탭 기반 얼럿 <span class="metric" data-target="42" data-suffix="개">42개</span> → Dagster 마이그레이션 완료</strong></li>
        </ul>
      </div>
    </div>

    <h3 class="project__h3">Before / After — 운영 인프라 전환</h3>

    <div class="ba-toggle" role="tablist" aria-label="Before/After 다이어그램 전환">
      <button class="ba-toggle__btn is-active" data-state="before" role="tab" aria-selected="true">기존 운영</button>
      <button class="ba-toggle__btn" data-state="after" role="tab" aria-selected="false">현재 운영</button>
    </div>

    <figure class="ba-diagram ba-diagram--before is-active" data-state="before">
      <div class="mermaid">
flowchart LR
    A([요구사항 접수]) --> B[쿼리 작성<br/>주피터 노트북]
    B --> C[크론탭 등록]
    C --> D[라이브 서버 직접 수정]
    D --> E{검증?}
    E -->|수동 점검| F([배포])
    E -->|문제 발생| D

    style B fill:#fee2e2,stroke:#dc2626
    style C fill:#fee2e2,stroke:#dc2626
    style D fill:#fecaca,stroke:#dc2626
    style E fill:#fed7aa,stroke:#ea580c
      </div>
      <figcaption>이상탐지 KPI 없음, 검증 단계 없음, 라이브 직접 수정·배포</figcaption>
    </figure>

    <figure class="ba-diagram ba-diagram--after" data-state="after">
      <div class="mermaid">
flowchart LR
    A([요구사항 접수]) --> B[Bitbucket 커밋<br/>코드 버전 관리]
    B --> C[Bitbucket Runner<br/>CI/CD 자동 빌드]
    C --> D[Dagster Dev<br/>UI 검증 + 로그]
    D --> E{이상탐지 KPI<br/>recall · 오탐률 · 반응성}
    E -->|통과| F[관리자 승인]
    F --> G([Dagster Live<br/>표준 배포])
    E -->|실패| B

    style B fill:#dcfce7,stroke:#16a34a
    style C fill:#dcfce7,stroke:#16a34a
    style D fill:#dbeafe,stroke:#2563eb
    style E fill:#fef9c3,stroke:#ca8a04
    style F fill:#dbeafe,stroke:#2563eb
    style G fill:#dcfce7,stroke:#16a34a
      </div>
      <figcaption>버전 관리 + CI/CD + Dev 검증 + KPI 정량 평가 + 승인 배포</figcaption>
    </figure>

    <h3 class="project__h3">Dagster 운영 화면</h3>
    <div class="project__gallery">
      <figure>
        <img src="/assets/img/alert-server-dagster-jobs.png" alt="Dagster Jobs UI — DUC_HC_001_CCU_Warning job 그래프" loading="lazy" />
        <figcaption>Dagster Jobs UI — health_check 파이프라인 op 그래프</figcaption>
      </figure>
      <figure>
        <img src="/assets/img/alert-server-timeline.png" alt="Dagster Timeline — health_check / analysis jobs 24시간 실행 흐름" loading="lazy" />
        <figcaption>Dagster Timeline — 24시간 health_check / analysis jobs 실행 흐름</figcaption>
      </figure>
    </div>
  </div>
</section>
```

- [ ] **Step 7.2: `js/mermaid-init.js` 작성**

Write `c:\Users\DG-2308-PC-009\Desktop\포폴\js\mermaid-init.js`:
```javascript
window.addEventListener('DOMContentLoaded', () => {
  if (typeof window.mermaid === 'undefined') {
    console.warn('[mermaid-init] Mermaid CDN not loaded');
    return;
  }
  window.mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    themeVariables: {
      fontFamily: "'Pretendard', sans-serif",
      primaryColor: '#FFE1CD',
      primaryTextColor: '#2A2118',
      primaryBorderColor: '#FF6F0F',
      lineColor: '#946A47',
      secondaryColor: '#FAF4EC',
      tertiaryColor: '#FFF8F2',
    },
    flowchart: { useMaxWidth: true, htmlLabels: true },
  });

  // Before/After toggle
  const toggleBtns = document.querySelectorAll('.ba-toggle__btn');
  const diagrams = document.querySelectorAll('.ba-diagram');
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.state;
      toggleBtns.forEach((b) => {
        const active = b.dataset.state === target;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      diagrams.forEach((d) => {
        d.classList.toggle('is-active', d.dataset.state === target);
      });
    });
  });
});
```

`index.html`의 `<script src="/js/main.js" defer>` 라인 직전에 다음 라인 추가:
```html
  <script src="/js/mermaid-init.js" defer></script>
```

- [ ] **Step 7.3: Mermaid 토글 + 갤러리 CSS 추가**

`css/main.css` 맨 아래에 추가:
```css
/* PROJECT 02 — two-col subs */
.project__subs--two { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 720px) {
  .project__subs--two { grid-template-columns: 1fr; }
}

/* Before/After toggle */
.ba-toggle {
  max-width: var(--max-content);
  margin: 0 auto var(--space-4);
  display: inline-flex;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px;
  gap: 4px;
}
.ba-toggle__btn {
  border: none;
  background: transparent;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 700;
  padding: 8px 18px;
  border-radius: 999px;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  transition: background var(--t-fast) var(--ease-out), color var(--t-fast) var(--ease-out);
}
.ba-toggle__btn.is-active {
  background: var(--accent);
  color: #fff;
}
.ba-diagram {
  max-width: var(--max-content);
  margin: 0 auto var(--space-6);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-5);
  display: none;
  opacity: 0;
  transition: opacity var(--t-med) var(--ease-out);
}
.ba-diagram.is-active {
  display: block;
  opacity: 1;
}
.ba-diagram .mermaid {
  display: flex;
  justify-content: center;
  min-height: 200px;
}
.ba-diagram figcaption {
  text-align: center;
  font-size: var(--fs-small);
  color: var(--text-muted);
  margin-top: var(--space-3);
}

/* Project gallery (2-up image grid) */
.project__gallery {
  max-width: var(--max-content);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}
.project__gallery figure {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-3);
}
.project__gallery img {
  width: 100%;
  border-radius: 8px;
}
.project__gallery figcaption {
  margin-top: var(--space-2);
  font-size: var(--fs-small);
  color: var(--text-muted);
  text-align: center;
}
```

- [ ] **Step 7.4: 브라우저에서 PROJECT 02 확인**

`http://localhost:8080/#project-02`로 이동. Expected:
- 새 제목 "DevOps 기반 스케줄 서버 운영 인프라 구축 및 이상탐지 시스템 KPI 정의" 노출
- 좌우 2개 sub 카드 (기존 한계 / 현재 인프라)
- 토글 버튼이 `기존 운영` / `현재 운영` 두 개로 보이고, "기존 운영"이 활성 (오렌지)
- Mermaid가 빨간색 톤의 기존 흐름 다이어그램 렌더
- "현재 운영" 클릭 시 녹색·파란색 톤의 다이어그램으로 부드럽게 전환 (0.25s)
- 하단 Dagster 화면 2장 이미지

> 콘솔에 mermaid 관련 에러가 있으면 CDN URL 확인. 없으면 정상.

- [ ] **Step 7.5: 야간 자율 자료 부재 확인**

`Ctrl+F`로 페이지에서 "야간", "멀티 에이전트 야간", "야간 자율" 검색. Expected: 매칭 0건. (스펙 v2.2 변경 사항 반영 확인)

- [ ] **Step 7.6: 커밋**

```powershell
git add index.html js/mermaid-init.js css/main.css
git commit -m "feat(project-02): add Dagster/Bitbucket infra section with Mermaid Before/After toggle"
```

---

## Task 8: PROJECT 03 — 자사 앱 대시보드 운영 + iframe 임베드

**목적:** DUC 운영 대시보드를 라이브로 보여주기. 메인 페이지에서는 iframe scaled preview, 클릭 시 새 탭으로 풀로딩.

**Files:**
- Modify: `index.html` (PROJECT 03 내부)
- Modify: `css/main.css`

- [ ] **Step 8.1: PROJECT 03 마크업**

`<section id="project-03">` 블록을 다음으로 교체:
```html
<section id="project-03" class="section section--project" aria-label="Project 03">
  <div class="section__inner">
    <p class="section__eyebrow">PROJECT 03</p>
    <h2 class="section__title">자사 앱 대시보드 운영</h2>
    <p class="project__lead">
      실험 현황(AB Test) + 신규 슬롯 트레킹을 한 UI에서 처리하는 운영 대시보드.
      Pretendard + Chart.js + Tailwind CDN으로 직접 구축한 자체 BI.
    </p>

    <div class="project__subs project__subs--two">
      <div class="project__sub">
        <p class="sub__label">실험 현황</p>
        <ul>
          <li>FTUE 흐름 개편, 첫 구매 팝업 타이밍 등 AB Test 모니터링</li>
          <li><code>is_pair</code> 세그먼테이션: 비결제 / pairwise / 결제 상위 8명</li>
          <li>KPI: 누적매출, AU, 구매 전환율, ARPU</li>
        </ul>
      </div>
      <div class="project__sub">
        <p class="sub__label">신규 슬롯 트레킹</p>
        <ul>
          <li>오픈 슬롯 성과·리텐션 추적</li>
          <li>매출 비중 흐름 (6시간 이동평균)</li>
          <li>리텐션 비교 (신규 vs 최근 8주)</li>
        </ul>
      </div>
    </div>

    <h3 class="project__h3">라이브 미리보기</h3>
    <p class="project__note">
      카드를 클릭하면 실제 대시보드가 새 탭에서 풀스크린으로 열립니다. (좌측 사이드바·우측 패널·필터·차트 모두 동작)
    </p>

    <a class="dashboard-card" href="/dashboards/duc-ops.html" target="_blank" rel="noopener" aria-label="자사 앱 운영 대시보드 — 새 탭에서 열기">
      <div class="dashboard-card__frame">
        <iframe
          src="/dashboards/duc-ops.html"
          loading="lazy"
          title="자사 앱 대시보드 미리보기"
          tabindex="-1"
        ></iframe>
      </div>
      <div class="dashboard-card__cta">
        <span>전체 화면으로 열기</span>
        <span aria-hidden="true">↗</span>
      </div>
    </a>

    <div class="project__metrics">
      <div class="metric-card">
        <p class="sub__label">진행 중 실험</p>
        <p class="metric metric--xl" data-target="2" data-suffix="">2</p>
      </div>
      <div class="metric-card">
        <p class="sub__label">Q1 완료 실험 채택률</p>
        <p class="metric metric--xl" data-target="62.5" data-suffix="%">62.5%</p>
      </div>
      <div class="metric-card">
        <p class="sub__label">평균 개선 효과</p>
        <p class="metric metric--xl" data-target="18.4" data-prefix="+" data-suffix="%">+18.4%</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 8.2: dashboard-card + metric-card 스타일 추가**

`css/main.css` 맨 아래에 추가:
```css
/* PROJECT 03 — dashboard preview */
.dashboard-card {
  display: block;
  max-width: var(--max-content);
  margin: 0 auto var(--space-7);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform var(--t-fast) var(--ease-out), border-color var(--t-fast) var(--ease-out), box-shadow var(--t-fast) var(--ease-out);
}
.dashboard-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: var(--shadow-card-hover);
}
.dashboard-card__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #F8F9FB;
}
.dashboard-card__frame iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 222%;      /* 1 / 0.45 = 2.22 */
  height: 222%;
  border: none;
  transform: scale(0.45);
  transform-origin: top left;
  pointer-events: none;
}
.dashboard-card__cta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  font-weight: 600;
  color: var(--accent);
  border-top: 1px solid var(--border);
}

/* Metric cards */
.project__metrics {
  max-width: var(--max-content);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
@media (max-width: 720px) {
  .project__metrics { grid-template-columns: 1fr; }
}
.metric-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-5);
  text-align: left;
}
.metric--xl {
  font-size: clamp(2rem, 5vw, 2.75rem);
  letter-spacing: -0.02em;
  margin-top: var(--space-2);
}
```

- [ ] **Step 8.3: 브라우저에서 PROJECT 03 확인**

`http://localhost:8080/#project-03`로 이동. Expected:
- 새 제목 "자사 앱 대시보드 운영"
- 2개 sub 카드 (실험 현황 / 신규 슬롯 트레킹)
- 대시보드 미리보기 카드 — 16:9 비율, 안쪽에 DUC Games 대시보드가 0.45배 축소되어 들어감
- 카드 hover 시 살짝 lift + 오렌지 보더
- 카드 클릭 시 새 탭에서 `dashboards/duc-ops.html` 풀로딩, 모든 인터랙션(사이드바·필터·차트) 동작
- 하단에 세 개의 메트릭 카드 (`2`, `62.5%`, `+18.4%`)

> 만약 iframe이 너무 작거나 너무 크면 `width: 222%; transform: scale(0.45);` 비율 조정. 더 보여주려면 `scale(0.5); width: 200%;` 같이 조정.

- [ ] **Step 8.4: 모바일 확인**

360px. Expected: dashboard card는 폭에 맞춰 축소되어도 비율 유지. 메트릭 카드는 수직 스택.

- [ ] **Step 8.5: 커밋**

```powershell
git add index.html css/main.css
git commit -m "feat(project-03): add dashboard live iframe preview + metric cards"
```

---

## Task 9: CONTACT 섹션

**목적:** 마지막 액션 호출. 이메일을 크게 강조하고 보조 채널을 옆에.

**Files:**
- Modify: `index.html` (CONTACT 내부)
- Modify: `css/main.css`

- [ ] **Step 9.1: CONTACT 마크업**

`<section id="contact">` 블록을 다음으로 교체:
```html
<section id="contact" class="section section--contact" aria-label="Contact">
  <div class="contact__inner">
    <p class="section__eyebrow">CONTACT</p>
    <h2 class="contact__title">대화를 시작해주세요.</h2>
    <a class="contact__email" href="mailto:chy0107@afewgoodsoft.com">
      chy0107@afewgoodsoft.com
    </a>
    <div class="contact__channels">
      <a class="button" href="https://github.com" target="_blank" rel="noopener">GitHub</a>
      <a class="button" href="/resume.html" target="_blank" rel="noopener">Resume</a>
    </div>
  </div>
</section>
```

- [ ] **Step 9.2: CONTACT 스타일 추가**

`css/main.css` 맨 아래에 추가:
```css
/* Contact */
.section--contact {
  background: linear-gradient(180deg, var(--bg) 0%, #fff 100%);
  text-align: center;
}
.contact__inner {
  max-width: var(--max-content);
  margin: 0 auto;
}
.contact__title {
  font-size: var(--fs-section);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--space-5);
}
.contact__email {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 700;
  color: var(--accent);
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 6px;
  margin-bottom: var(--space-6);
  word-break: break-all;
}
.contact__channels {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}
```

- [ ] **Step 9.3: 브라우저 확인**

`#contact`로 스크롤. Expected: 큰 한국어 헤딩 + 모노스페이스 이메일 큰 링크 + 두 개 보조 버튼. Email 클릭 시 메일 클라이언트 열림.

- [ ] **Step 9.4: 커밋**

```powershell
git add index.html css/main.css
git commit -m "feat(contact): add contact section with prominent email and channel buttons"
```

---

## Task 10: `js/main.js` — 스크롤 fade-up + 숫자 카운트업

**목적:** 절제된 모션으로 페이지에 생기 더하기. IntersectionObserver 기반.

**Files:**
- Create: `js/main.js`
- Modify: `css/main.css` (fade-up 초기 상태 클래스)

- [ ] **Step 10.1: `js/main.js` 작성**

Write `c:\Users\DG-2308-PC-009\Desktop\포폴\js\main.js`:
```javascript
(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Scroll fade-up ---
  const fadeTargets = document.querySelectorAll('.section, .ai-card, .decision-case, .project__sub, .dashboard-card, .metric-card');
  if (prefersReducedMotion) {
    fadeTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    fadeTargets.forEach((el) => {
      el.classList.add('fade-up');
      fadeObserver.observe(el);
    });
  }

  // --- Number countup ---
  const metricEls = document.querySelectorAll('.metric[data-target]');
  const animateNumber = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1200;
    const start = performance.now();
    const decimals = (el.dataset.target.split('.')[1] || '').length;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = target * eased;
      el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = `${prefix}${target}${suffix}`;
    };
    requestAnimationFrame(step);
  };
  if (prefersReducedMotion) {
    metricEls.forEach((el) => {
      el.textContent = `${el.dataset.prefix || ''}${el.dataset.target}${el.dataset.suffix || ''}`;
    });
  } else {
    const numObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            numObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    metricEls.forEach((el) => {
      el.textContent = `${el.dataset.prefix || ''}0${el.dataset.suffix || ''}`;
      numObserver.observe(el);
    });
  }
})();
```

- [ ] **Step 10.2: fade-up CSS 추가**

`css/main.css` 맨 아래에 추가:
```css
.fade-up {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 400ms var(--ease-out), transform 400ms var(--ease-out);
}
.fade-up.is-visible {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .fade-up { opacity: 1; transform: none; transition: none; }
}
```

- [ ] **Step 10.3: 브라우저에서 모션 확인**

페이지 새로고침. Expected:
- 스크롤 시 섹션·카드가 위에서 슬며시 등장 (translateY 12px → 0)
- AI Card 1의 "120개", PROJECT 01의 "+7.9%", PROJECT 02의 "42개", PROJECT 03의 "2 / 62.5% / +18.4%"가 모두 뷰포트 진입 시 0에서 타깃 값까지 카운트업
- 같은 메트릭이 다시 화면 밖으로 나갔다가 들어와도 재발화 없음 (IntersectionObserver `unobserve`)

- [ ] **Step 10.4: prefers-reduced-motion 확인 (옵션)**

OS 설정에서 모션 줄이기 활성화 → 새로고침. Expected: 페이드 없음, 숫자도 즉시 최종 값으로 표시.

- [ ] **Step 10.5: 커밋**

```powershell
git add js/main.js css/main.css
git commit -m "feat(js): add scroll fade-up and number countup with reduced-motion support"
```

---

## Task 11: 모바일·접근성 최종 검증

**목적:** 모바일 360~720px 가독성, 키보드 포커스 가시성, 색 대비를 한 번 훑는다.

**Files:**
- Modify: `css/main.css` (focus 스타일 + 마이크로 보정)

- [ ] **Step 11.1: focus-visible 스타일 추가**

`css/main.css` 맨 아래에 추가:
```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}
.button:focus-visible {
  outline-offset: 4px;
}
```

- [ ] **Step 11.2: 모바일 360px 전 섹션 스크롤**

DevTools → 360x740. 각 섹션을 위에서 아래로 스크롤하며 확인:
- HERO: 큰 타이틀이 잘리지 않음
- AI Practice: 4 카드가 수직 스택, 코드 토큰이 줄바꿈 자연스러움
- PROJECT 01: 두 이미지가 깨지지 않고 figcaption 가독성 OK
- PROJECT 02: 토글 버튼이 가로로 나란히, Mermaid 다이어그램이 가로 스크롤 없이 보임 (필요 시 다이어그램 컨테이너에 `overflow-x:auto` 추가)
- PROJECT 03: dashboard-card 비율 유지, 메트릭 카드 수직 스택
- CONTACT: 이메일이 줄바꿈 가능 (이미 `word-break: break-all`)

만약 Mermaid 다이어그램이 모바일에서 잘리면 `.ba-diagram` 에 `overflow-x: auto;` 추가:
```css
.ba-diagram { overflow-x: auto; }
```

- [ ] **Step 11.3: 키보드 네비게이션 확인**

`Tab` 키로 페이지 전체 순회. Expected:
- 모든 버튼·링크·iframe-card가 Tab으로 도달 가능
- 포커스 시 오렌지 outline 가시
- iframe 내부는 `tabindex="-1"`로 비포커스 (카드 자체가 링크라 카드로 진입)

- [ ] **Step 11.4: 색 대비 확인 (DevTools)**

DevTools → Accessibility → Contrast.
- 본문 `#2A2118` on `#FFF8F2` → 16:1 이상 (Pass AAA)
- `--text-muted #6B6258` on `#FFF8F2` → 5:1 이상 (Pass AA)
- `--accent #FF6F0F` on `#FFFFFF` → 3:1 이상 (Pass AA Large)
- `--accent` on 본문 텍스트로 쓸 때는 큰 글자(`.metric--lg`, `.contact__email`, 헤딩 액센트)에만 한정 — OK

- [ ] **Step 11.5: 커밋**

```powershell
git add css/main.css
git commit -m "feat(a11y): add focus-visible outlines and mobile/contrast verification fixes"
```

---

## Task 12: OG 이미지 + favicon

**목적:** Slack·카카오톡 미리보기 정상 노출.

**Files:**
- Create: `assets/og-image.png` (스크린샷)
- Create: `favicon.ico` (간단)
- Modify: `index.html` (`<meta property="og:image">` 등 추가)

- [ ] **Step 12.1: OG 이미지 캡처**

브라우저에서 `http://localhost:8080/` 로딩 후, HERO 섹션이 보이는 상태에서 1200×630 영역을 스크린샷.
- Windows: `Snipping Tool` → 사각형 캡처 → 저장 위치 `assets/og-image.png`
- 1200×630이 정확하지 않아도 가로:세로 비율이 1.91:1에 가까우면 됨

- [ ] **Step 12.2: favicon 생성 (간단)**

오렌지 사각형 32×32 PNG를 만들거나, 기존 favicon이 있으면 복사:
```powershell
# 간단한 방법: 256x256 SVG를 favicon으로 변환 (옵션)
# 일단 비워두고 추후 추가도 OK. 비워두면 404가 콘솔에 뜨지만 동작에 문제 없음.
```
원하면 `assets/img/`의 이미지를 32×32로 변환해 `favicon.ico`로 사용. 또는 다음 SVG를 인라인 link로 추가:

`index.html`의 `<link rel="icon">` 라인을 다음으로 교체:
```html
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23FF6F0F'/%3E%3Ctext x='16' y='22' text-anchor='middle' fill='white' font-family='sans-serif' font-weight='700' font-size='18'%3Ec%3C/text%3E%3C/svg%3E" />
```

- [ ] **Step 12.3: OG 이미지 메타 태그 추가**

`index.html`의 `<head>`에 OG 영역에 다음 라인들 추가/확인:
```html
<meta property="og:image" content="/assets/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://chy0107.github.io/" />
<meta name="twitter:card" content="summary_large_image" />
```

> NOTE: `og:url`은 GitHub Pages URL 추후 확정 후 교체.

- [ ] **Step 12.4: 메타 검증**

DevTools → Elements → `<head>` → OG 메타가 모두 보이는지 확인.

- [ ] **Step 12.5: 커밋**

```powershell
git add index.html assets/og-image.png
git commit -m "feat(meta): add OG image, favicon, and Twitter card metadata"
```

---

## Task 13: `README.md` + 배포 가이드

**목적:** 다른 사람(혹은 미래의 나)이 로컬에서 띄우고 GitHub Pages에 올리는 절차 명시.

**Files:**
- Create: `README.md`

- [ ] **Step 13.1: `README.md` 작성**

Write `c:\Users\DG-2308-PC-009\Desktop\포폴\README.md`:
```markdown
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
```

- [ ] **Step 13.2: 커밋**

```powershell
git add README.md
git commit -m "docs: add README with setup and deploy guide"
```

---

## Task 14: Lighthouse 검증 + 최종 폴리시

**목적:** Performance ≥ 90 확보, 잔여 이슈 정리.

- [ ] **Step 14.1: Lighthouse 측정**

Chrome DevTools → Lighthouse → Mode: Navigation, Device: Mobile + Desktop 각각 → Categories: Performance / Accessibility / Best Practices / SEO 다 체크 → Analyze.

Expected baseline:
- Performance: ≥ 90 (정적 사이트라 일반적으로 매우 높음)
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 95

만약 Performance가 90 미만이면:
- 이미지에 `loading="lazy"` 누락된 곳 확인
- CSS·JS는 이미 최소화되어 있음
- LCP 후보가 HERO 타이틀 텍스트라면 폰트 preload 추가 고려:
  ```html
  <link rel="preload" as="style" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
  ```

- [ ] **Step 14.2: 콘솔 에러 0 확인**

DevTools → Console. Expected: 빨간 에러 없음. (Mermaid 경고나 favicon 404 정도는 무시 가능)

- [ ] **Step 14.3: 링크 동작 점검**

- HERO Email → mailto 호출 OK
- HERO GitHub → 새 탭 (placeholder URL)
- HERO Resume → 새 탭에서 `resume.html` 로딩
- AI Card 4 "전체 분석 리포트 열기" → `samples/mobile-ccu-anomaly.html` 새 탭 (d3.js 차트 정상)
- PROJECT 03 dashboard-card → `dashboards/duc-ops.html` 새 탭 (사이드바·차트 동작)
- CONTACT 이메일 → mailto

- [ ] **Step 14.4: 완료 메시지 캡처 (선택)**

스크린샷으로 메인 페이지 전체 한 장 저장 (포트폴리오 검수용 인증).

- [ ] **Step 14.5: 최종 커밋**

```powershell
git add -A
git status
```
Expected: 만약 추가 변경이 있으면 staged 되어 있음.

```powershell
git commit -m "feat: portfolio implementation complete — pass Lighthouse 90+"
git log --oneline
```
Expected: 모든 태스크의 커밋 로그가 깔끔하게 정렬되어 보임.

---

## 작업 완료 후 — 외부 의존 항목 (사용자가 채울 부분)

이 플랜의 모든 태스크가 끝난 뒤에도 다음은 사용자가 결정·제공해야 함:

| 항목 | 후속 작업 |
|---|---|
| 실제 GitHub URL | `index.html`의 HERO + CONTACT의 `https://github.com` 두 군데를 `https://github.com/<username>` 으로 교체 후 커밋 |
| 호스팅 도메인 확정 | GitHub Pages URL이 정해지면 `<meta property="og:url">` 업데이트 + 카카오톡/Slack 미리보기 검증 |
| 프로필 사진 (옵션) | 사진 추가하고 싶으면 `assets/profile.jpg`로 저장 후 HERO에 `<img>` 추가하는 마이크로 태스크 |
| auto_report 결과 캡처 (옵션) | 있으면 AI Card 1에 figure 추가 |
| GS_projection_renew_slot 시각화 (옵션) | 있으면 AI Card 3-A에 figure 추가 |
| LinkedIn URL (옵션) | CONTACT 보조 채널에 버튼 추가 |
