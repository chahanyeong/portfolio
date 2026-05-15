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

## Iteration 1 (11:30~)

**Plan:**
1. Hero를 풀 뷰포트로 키움 + 우상단 ASCII 모노그램 시그니체 (`〔 차 〕`)
2. Hero 좌측에 큰 타이틀, 우측에 메타 정보 (날짜/지원 컨텍스트)
3. 본문 단락별 스크롤 진입 시 staggered fade (자식 요소 시차)
4. PROJECT 02 Mermaid를 더 부드럽게
