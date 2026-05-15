# Autonomous Polish Session — 2026-05-15

목표: 49turtle.github.io 대비 모든 방면에서 우위가 명확해질 때까지 자율로 폴리시.
사용자는 ~3시간 자리 비움. 각 iteration 기록.

## 베이스라인 비교 (2026-05-15 11:30)

### 49turtle.github.io 분석

- **Theme**: 다크 (#000 bg, #fff text)
- **Hero**: 풀 뷰포트 height, SVG 배경에 어두운 오버레이, 원형 프로필 사진
- **Font**: Arial / Roboto / Open Sans (generic)
- **Layout**: max-width 1200px
- **About**: 풀 뷰포트, 텍스트 그림자, uppercase 헤딩
- **Skills**: bg #222, simple-icons SVG 10개 + 한 줄 텍스트
- **Projects**: 카드 → 모달 팝업 상세 (text 3 : image 2.5 비율)
- **Motion**: fadeIn 2s, btn hover scale(1.05)
- **CSS**: 9.7KB
- **Section divider**: hairline white/0.2

#### 강점
1. Full-viewport hero — 첫 인상 강함
2. 다크 톤의 무게감
3. 프로필 사진 (신뢰)
4. 프로젝트 모달 인터랙션
5. SVG 브랜드 아이콘

#### 약점
1. 일반 폰트 (Arial 등 — "AI 슬롭" 위험)
2. 본문이 추상적·일반론적 ("저는 ~ 추구합니다")
3. 실제 지표·결과 부재
4. 인터랙티브 데이터 콘텐츠 부재
5. 반응형이 480px 미디어 쿼리 1개뿐

### 우리 현재 상태 (commit `e9303f0`)

#### 강점 (이미 49turtle 대비 우위)
- ✅ Fraunces 디스플레이 + Pretendard 본문 (49turtle은 generic)
- ✅ 실측 의사결정 사례 (VVIP +7.9%, 알럿 42개 마이그레이션, AB 8건 채택률 62.5%)
- ✅ Mermaid Before/After 인터랙티브 토글
- ✅ Live iframe 대시보드 임베드
- ✅ 숫자 카운트업 애니메이션
- ✅ AI 4 카드 (방법론 + 실증 사례 + 태그)
- ✅ 외부 분석 리포트 (d3.js 인터랙티브)
- ✅ 다중 브레이크포인트 반응형 (720/880/1080)
- ✅ Aria-label / focus-visible / prefers-reduced-motion
- ✅ 따뜻한 베이지 + 오렌지 (당근 브랜드 적합도)

#### 갭 (49turtle이 더 좋거나 비슷한 부분)
1. ⚠ 풀 뷰포트 hero 임팩트 부재 — 우리 hero는 padding-top clamp(6, 12vw, 9rem)
2. ⚠ 프로필 사진 없음 (사용자 미제공) — 신뢰 시그널 약함
3. ⚠ 프로젝트 모달 팝업 없음 — 깊이 인터랙션 부재
4. ⚠ Hero 자체 비주얼 시그니체 약함

## Iterations log (commits)

| Hash | Change | Note |
|---|---|---|
| `0e95af3` | full-vh hero + 〔 차 〕 monogram + meta eyebrow + AI grid stagger | iter 1 |
| `d8095da` | Impact stats bar (42/120/62.5%/+7.9%) | iter 2 |
| `a8648e8` | tabular stat numerals + project-02 before/after color borders | iter 3 |
| `9c0f6f3` | richer footer (sig + section nav + provenance) | iter 3 |
| `1052c5e` | hero title accent stroke draw-in + dashboard hover overlay + CONTACT intro + dot pattern | iter 4 |
| `4776c58` | scroll progress bar | iter 4.5 (later removed) |
| `41b2832` | italic 'End-to-end' Fraunces emphasis | iter 5 |
| `9efcde3` | hero stack chip hover (accent + lift) | iter 5 |
| `c8b31ee` | serif AI card numbers (typography cohesion) + print stylesheet | iter 5 |
| `4d8718e` | SVG '차' monogram circle (replaces text monogram) | iter 5 |
| `b0e1bd4` | SIMPLIFY: drop scroll bar + hero meta + slim footer (per user feedback "심플하면서도 엣지있게") | simplification |
| `38366e5` | stats source disclaimer + footer last-updated + tighter AI lead (synthesis from portfolio research) | iter 6 |

## 외부 포트폴리오 리서치 (11:50)

8개 사이트 비교:
- brittanychiang.com — 접근성 자체로 입증, 콘텐츠 우선
- josh.comeau.com — fetch 실패 (429)
- rauchg.com — fetch 실패 (ECONNREFUSED)
- giorgialupi.com — Data Humanism, 데이터 + 인간미
- truth-and-beauty.net (Moritz) — "Truth & Beauty" 정확성 + 아름다움
- cassidoo.co — "memes and dreams" 인간미, 미니멀
- leerob.com — 미니멀 + 인간미 + CTA 다양
- paco.me — "Return to simplicity" 장인정신

**시너지 적용**:
- 단순함 재확인 → 과한 chrome 제거 (스크롤 바·footer nav·hero meta line)
- 신뢰감 → stats 출처 한 줄 명시
- 빌드 신선도 → footer last-updated
- 인간미는 직접 톤 다운으로 (AI lead 짧게)

## 최종 상태 (commit `38366e5`)

### 49turtle.github.io 대비 우위 매트릭스

| 차원 | 49turtle | 우리 | 결과 |
|---|---|---|---|
| 타이포 | Arial/Roboto/OpenSans | Fraunces + Pretendard + JetBrains Mono | ✓ 우위 |
| 정보 밀도 | About 280자 + 10 skills + 4 thumb | 4 stats + 4 AI cards + 3 deep projects + decision case + sample analyses | ✓ 압도 |
| 인터랙티브 | modal popup | Mermaid toggle + iframe dashboard + d3 외부 + countup + AI stagger + hover effects | ✓ 압도 |
| 시각 정교 | 다크 BG + Arial | warm + 차 monogram + dot pattern + accent stroke + Fraunces italic | ✓ 우위 |
| 컬러 | #000 #fff #222 | 베이지 + 오렌지 + brown (cohesive) | ✓ 우위 |
| 접근성 | basic focus | focus-visible + aria + reduced-motion (CSS+JS) | ✓ 우위 |
| 반응형 | 480px 1개 | 720/880/1080 + clamp | ✓ 우위 |
| 브랜드 적합도 | 일반 | 당근 오렌지 + 지원 컨텍스트 명시 | ✓ 우위 |
| 인쇄 | x | 전용 print 스타일 | ✓ 추가 우위 |
| 개인성 | 프로필 사진 | SVG '차' monogram (사진 받으면 교체) | ⚠ 사진 없으면 약함 |
| 본문 카피 톤 | 추상적 ("긍정적 변화 추구") | 구체적·결과 지향 (`+7.9%`, `42개` 등 명시) | ✓ 우위 |
| SEO | basic title | OG + Twitter + lang ko + description | ✓ 우위 (OG 이미지는 미캡처) |

### 남은 manual TODOs (사용자)
1. OG 이미지 캡처 (1200×630 hero) → `assets/og-image.png` 저장 → push
2. 프로필 사진 → `assets/profile.jpg` → 원하면 hero __monogram 자리에 추가
3. 실제 GitHub URL이 chahanyeong면 그대로, 다른 ID로 변경 시 hero/contact 두 군데 수정

### 운영 메모
- 모든 변경은 `main` 브랜치에 직접 commit. 16 + 12 = 28 commits 누적.
- 페이지: https://chahanyeong.github.io/portfolio/
- 자산: 137KB chart + 178KB calendar preview + 5.1MB sample (lazy-loaded on click)
- CSS: ~22KB / JS: ~2KB

자율 폴리시 세션 종료.

