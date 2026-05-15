# 당근 Data Analytics Engineer 지원 포트폴리오 — 설계 문서

작성일: 2026-05-14
지원자: 차한영 (Live Ops Strategy @ DUC Games)
대상 채용공고: https://about.daangn.com/jobs/7507320003/ — Data Analytics Engineer (테크코어 · 데이터 가치화)
참고 포트폴리오: https://49turtle.github.io (순수 HTML/CSS/JS, 싱글 페이지)

> **개정 이력**
> - v1 (2026-05-14): 초안. 6섹션 (Hero / AI Practice / Projects 1–3 / Contact).
> - v2 (2026-05-14): AI ENGINEERING PRACTICE를 **HOW + WHAT** 두 파트로 확장. 로컬 AI 도구 3종(`auto_report`, `Auto_calender`, `redshift_agent`)을 WHAT 갤러리에 추가. PROJECT 01에서 "AI 캘린더" 항목을 빼서 WHAT 갤러리로 이동(Auto_calender와 동일 산출물).
> - v2.1 (2026-05-14): `goal`을 플러그인이 아닌 **외부 스킬**로 정정. Part B의 alert server 점프 카드(B-4)를 제거(PROJECT 02와 중복). Auto_calender 갤러리 카드에 사용자 제공 Google Calendar 스크린샷 미리보기 추가.
> - v2.2 (2026-05-14): AI 섹션을 **HOW + WHAT 분리 구조에서 4개 통합 카드**로 재구성. 각 카드가 [방법론 테마 + 구체 사례 + 소스 폴더]를 함께 담음. PROJECT 02는 AI 색채를 빼고 **Dagster + Bitbucket 운영 자동화**로 재포지셔닝(AI 측면은 AI 섹션 Card 2에서 다루므로 중복 방지). PROJECT 02에서 야간 자율 멀티 에이전트 다이어그램 제거. Mermaid 토글은 `기존 / 현재` 2단계로 재명명. 새 매출 예측 사례(GS_projection_renew_slot)를 Card 3에 추가.
> - v2.3 (2026-05-14): PROJECT 01에 **VVIP 가격 정책 리뉴얼** 의사결정 사례 추가 (`project1_1.png` 가격대별 BaseCoin/요율 시뮬레이션 표 + `project1_2.png` 결제 코인 대비 배팅 금액 차트). PROJECT 02 제목 → **"DevOps 기반 스케줄 서버 운영 인프라 구축 및 이상탐지 시스템 KPI 정의"**. PROJECT 03 제목 → **"자사 앱 대시보드 운영"**. AI 섹션 Card 4 (`redshift_agent`)에 **모바일 CCU 이상탐지 (2026-04-06~04-07)** 구체 분석 사례 추가.
> - v2.4 (2026-05-14): Calendar 미리보기 이미지 확정 — `auto_calender.png` 사용 (`19d5e94b-*.png`는 미사용). 이력서 PDF 대신 `차한영 Hanyeong Cha *.html`을 **이력서 대용 페이지**로 활용 — `resume.html`로 이름 변경 후 CTA의 "Resume" 버튼이 이 페이지를 새 탭으로 열도록 함.

---

## 1. 목표와 컨텍스트

### 1.1 목적
당근 Data Analytics Engineer 직무 지원용 포트폴리오. 이력서가 별도 준비되어 있으므로, 이 포트폴리오는 **작품(work) 중심**으로 채용 담당자에게 다음 한 줄을 전달하는 것이 목표:

> **"End-to-end로 데이터 마트·KPI·BI를 직접 만들고, AI를 자율 동료로 묶어 운영을 안정적으로 자동화한다."**

### 1.2 주요 독자
- 1차: 당근 데이터팀 채용 담당자 (서류 단계)
- 2차: 면접관 (면접 직전 작품 톺아보기)

### 1.3 성공 기준
- 모바일·데스크탑 모두 단일 스크롤로 30초 안에 핵심 임팩트 인지 가능
- 채용공고 키워드(데이터 마트, 지표 정의, 파이프라인 품질, A/B 테스트, 클라우드)와 직접 매핑되는 콘텐츠 명확히 노출
- 자체 제작 대시보드(DUC Games 실험 현황)가 실제로 동작하는 모습으로 증거 제공
- "이 사람은 AI를 도구가 아닌 동료로 운영한다"가 PROJECT 02와 AI Engineering Practice 섹션을 통해 자명하게 드러남

---

## 2. 정보 구조 (싱글 스크롤)

### 2.1 섹션 순서

| # | 섹션 | 1차 임팩트 |
|---|---|---|
| 1 | HERO | 정체성 한 줄 + 지원 컨텍스트 + 즉시 연락 가능한 CTA |
| 2 | AI ENGINEERING PRACTICE | 차별화 — 4개 통합 카드 (각각 [방법론 + 구체 사례 + 소스 폴더] 담음) |
| 3 | PROJECT 01 — KPI · 매출 예측 자동화 | JD의 "지표 정의" 직접 매칭 |
| 4 | PROJECT 02 — DevOps 기반 스케줄 서버 운영 인프라 구축 및 이상탐지 시스템 KPI 정의 | JD의 "파이프라인 품질·거버넌스" 매칭. AI 색채는 빼고 Dagster + Bitbucket 어필 |
| 5 | PROJECT 03 — 자사 앱 대시보드 운영 | JD의 "BI 접근성·A/B 테스트" 매칭, 라이브 작품 |
| 6 | CONTACT | 즉시 연락 CTA |

ABOUT 섹션과 EXPERIENCE 섹션은 의도적으로 생략(이력서로 대체).

### 2.2 HERO

```
[작은 칩] ● DAANGN — DATA ANALYTICS ENGINEER 지원
[메인 타이틀, 매우 큼]
  End-to-end Data Analytics Engineer
[지원자 메타, 작게]
  차한영 · Live Ops Strategy
[CTA 버튼 행]
  [Email] [GitHub] [Resume PDF]
[하단 코어 스택 칩 한 줄, 흐릿하게]
  Dagster · DBT · Python · SQL · AB Test · BigQuery
```

- 서브타이틀 없음. 타이틀이 끝나면 바로 CTA.
- 칩(상단) 컬러는 당근 오렌지 `#FF6F0F` 배경 + 흰 글자.
- 메인 타이틀은 페이지 첫 진입에서 가장 강한 비주얼 무게.

### 2.3 AI ENGINEERING PRACTICE

**4개 통합 카드**로 구성. 각 카드는 [방법론 테마 + 구체 사례 + 소스 폴더]를 함께 담아, HOW와 WHAT을 한 카드 안에서 동시에 보여준다. AI 색채는 이 섹션에서 다 풀고, 아래 PROJECTS 섹션에서는 별도의 운영·BI 결과물만 다룬다.

#### 카드 1 · 에이전트 팀으로 다수 이슈 병렬 처리

> *"복잡도 높은 다량 이슈를 사람 한 명이 직렬로 처리하는 대신, 에이전트 팀이 병렬로 학습·평가하도록 분업한다."*

- **방법론**
  - Claude Code의 **agent team** 기능으로 서브에이전트를 다수 띄워 동일 입력에 대해 병렬 작업 수행
  - 단일 모델 편향 회피를 위해 Claude (`claude-opus-4-7`) + Codex (`gpt-5.5 / 5.4 / 5.4-mini`)를 의도적으로 병용
  - `AGENTS.md`에 모델 난이도별 분업 정책: `mini` (탐색·단순 검증) / 중급 (일반 코딩) / 최상위 (고위험 아키텍처·디버깅) — "약한 모델로 충분하면 그 모델로"
- **구체 사례** — `auto_report/projects/issue_timeline_extractor`
  - 26년 상반기 개발 이슈 시트(약 120개 이슈)를 대상으로 **Leader 에이전트가 Agent Team을 spawn해 병렬 학습·평가**
  - 단계: `preflight → fetch_issues → categorize → discover_channels → fetch_slack → fetch_patches → Agent Team 병렬 실행 → write_csv`
  - 산출물: 13-column augmented CSV + 패턴 디텍터 cross-issue audit notes (`audit_notes_26H1_*.md` v1~v5)
- **태그**: `Agent Team` `Claude Code` `Codex CLI` `Slack API` `Google Sheets`

#### 카드 2 · 라이브 이중 환경 + 에이전트로 안정적인 서버 개발

> *"바이브 코딩으로 이상탐지 서버를 만들되, 라이브를 절대 직접 건드리지 않는다. 에이전트는 개발 환경에서만 작업하고, 사람은 최종 승인만 한다."*

- **방법론**
  - **라이브 이중 환경**: `aiops_dev` (개발) ↔ `aiops_gsdetection` (라이브) Bitbucket 저장소 동시 관리
  - 워크스페이스 단위 **컨텍스트 인스트럭션 계층화** — `CLAUDE.md` (Alert Workspace 작업 지침), `AGENTS.md` (모델 선택 규칙), `.codex/CODEX_ALERT_WORKSPACE.md` (Dagster 알람 전용 프로필), `ENV_VARIABLES_LIST.md` (6곳 동기화 환경변수)
  - **CLAUDE.md 규칙 강제** — 설정 중앙화, DB 공통 유틸, 하드코딩 정규식 자동 grep, 백필 안전 룰, 배포 순서 강제(개발 환경 검증 → 관리자 승인 → 라이브)
- **구체 사례** — 이상탐지 얼럿 서버 자체
  - Claude Code 에이전트가 자연어 요구사항을 받아 코드 작성·검증 → 관리자는 다른 분석을 병행 → 결과 검토 후 라이브 반영
  - **이 섹션에서만 AI 측면을 다루고, 아래 PROJECT 02에서는 Dagster + Bitbucket 운영 자동화 측면만 어필**한다
- **태그**: `Claude Code` `CLAUDE.md` `Dev/Live 분리` `Bitbucket`

#### 카드 3 · 플러그인·스킬을 적재적소에 결합

> *"각 작업에 맞는 플러그인·스킬을 골라 끼우면 같은 사람이 처리할 수 있는 일의 폭이 달라진다."*

- **사용 중인 플러그인·스킬**
  - **공식 플러그인 `superpowers`**: `brainstorming` · `writing-plans` · `test-driven-development` · `systematic-debugging` · `verification-before-completion` · `dispatching-parallel-agents` · `subagent-driven-development` · `using-git-worktrees`
  - **외부 스킬 `goal`**: 세션 단위로 목표를 고정하고 Stop hook으로 이탈 방지 — 멀리 가는 모델링 작업의 컨텍스트 일관성 유지
  - **커스텀 스킬 `creator_team`**: 6 페이즈 워크플로우 (Brainstorm → Plan → TDD → **Phase 3.5 Dagster UI 검증 (docker restart → `collected:` 숫자 증가 확인)** → Simplify → Code Review → Finish)
- **구체 사례 A** — `GS_projection_renew_slot` · `goal` 스킬로 매출 예측 모델 develop
  - 주간 매출 4주 전망 (28일 롤링) 모델링
  - `experiments/versions/v0_A ~ v5` 까지 단계적 실험, **Phase 1 챔피언 `v4_AB_blended`** — base 대비 RMSE·CI·Direction 셋 다 strict 개선
  - DB 산출 테이블: `duc_projection_weights_per_fw`, `duc_projection_slot_components`, `duc_total_projection_28_v2`
  - `goal` 스킬로 다단계 실험 흐름에서 목표 이탈을 막고, `superpowers/writing-plans`로 plan 작성 후 단위 테스트(pytest)와 함께 진행
- **구체 사례 B** — `Auto_calender` · `superpowers/brainstorming`으로 자동 앱 일정 캘린더 제작
  - Confluence·Slack·Sheets 입력 → **다단 LLM 폴백** (Codex CLI → Claude CLI → Claude API → 휴리스틱) → `serve-approvals` 승인 워크플로우 → Google Calendar 반영
  - 안전장치: `Manual hold` 워크플로우 (`event_key`/`lock_key`/`identity_key` 다중 추적), `rollback-run`으로 run 단위 롤백
  - **시각 자료**: 사용자 제공 Google Calendar 화면 (`[배포] [DUC-M] 8.52.0 정규 배포` 같은 자동 등록 이벤트 + 우측 상세 카드에 패치 내역·링크·만든 사용자 표기). 카드 hover 시 이 이미지를 미리보기로 표시.
- **태그**: `superpowers` `goal` `creator_team` `Codex` `Claude CLI` `Claude API` `Approval Server`

#### 카드 4 · 분석 데이터 자산화로 진화하는 에이전트 워크스페이스

> *"분석은 일회성 답변이 아니라 다음 분석을 더 빠르게 만드는 자산이 되어야 한다."*

- **방법론**
  - 분석 요청 → `brainstorming` 스킬로 spec 작성 → `writing-plans` 스킬로 plan 작성 → 실행 → 산출물 정리 → **재사용 가치 있는 쿼리·KPI를 에이전트가 knowledge로 승격 제안**
  - **Auto Memory (영속 학습)** — 카테고리별 메모리 파일 14개로 "같은 지적을 두 번 받지 않는 AI" 유지 (예: "백필은 INSERT만", "DDI 쿼리는 whitelist만", "임박한 cron 시각은 백필 제외")
- **구체 사례** — `redshift_agent` · DUC 데이터 분석 전용 에이전트 워크스페이스
  - 구조:
    - `domains/<domain>/analyses/YYYY-MM-DD-<slug>/` — 일자별 분석 산출물
    - `domains/<domain>/knowledge/` — 재사용 자산 (에이전트가 자체 승격 제안)
    - `shared/Ciphertext` — Redshift 접속 sealed module (자격 분리)
    - `agent/` — 에이전트 메모리·트레이닝 VCS 스냅샷
    - 2026-04-20에 분석 전용 구조로 재편 (pre-restructure 태그 보존)
  - **샘플 분석 1건 노출** — `domains/engagement/analyses/2026-04-06-mobile-ccu-anomaly/`
    - 질문 해석: "모바일 앱 CCU가 2026-04-06 ~ 04-07 사이 이상치를 보였는지, 이상이라면 플랫폼/버전 관점에서 어느 축에 몰려 있는지"
    - 지표 정의: CCU = 15분 단위 접속 유저 수 (8주 baseline 기준)
    - 데이터 원천: `mobile_ccu.json` / `web_ccu.json` / `baseline_lookup_8w.json` (정적 JSON 추출본)
    - 산출물: 자기완결형 인터랙티브 HTML 리포트 `mobile_issue_0406_0407.html` (d3.js 차트 임베드)
    - "추가 확인 제안" 섹션이 에이전트가 다음 분석 시 무엇을 봐야 하는지를 자동 기록 → **knowledge 자산화의 입구**
  - 포트폴리오에서는 이 분석 리포트의 **헤더·요약 카드만 미리보기**로 노출하고, "전체 리포트 열기" 버튼으로 `/samples/mobile-ccu-anomaly.html` 새 탭 이동
- **태그**: `Claude Code` `Auto Memory` `superpowers` `Redshift` `Knowledge Promotion`

#### 시각화 패턴 (4 카드 공통)

- 레이아웃: 데스크탑에서 2×2 그리드, 720px 이하에서 수직 스택
- 카드 1장당 5요소: **카드 번호·인용형 헤드라인 / 방법론 bullet / 구체 사례 / 태그 chip 행 / (있으면) 미리보기 이미지 hover**
- 카드 hover: 살짝 lift + 보더 색 강조 + 카드 3-B는 캘린더 이미지 오버레이
- 카드 내부 링크: 구체 사례 폴더가 있는 카드는 GitHub repo로의 링크 옵션 (저장소 공개 여부는 추후 결정)
- 카드 간 자연스러운 흐름: **카드 1 (스케일)** → **카드 2 (안정성)** → **카드 3 (도구 결합력)** → **카드 4 (학습 연속성)** 으로 AI 활용 성숙도 4축을 차례로 보여줌

### 2.4 PROJECT 01 — KPI · 매출 예측 자동화

**한 줄 요약**: 주단위 매출 예측 모델 → 주간 KPI 정의 → 4주 변화율 스코어링 기반 보고 자동화 → 이상치 발견 시 액션 제언 → 실제 의사결정까지 이어진 파이프라인.

**서브섹션**:
- 문제 정의 — 배포·이벤트 영향도를 정량 평가할 기준이 없었음
- 접근 — 주단위 매출 예측을 KPI 임계선으로 사용, 4주 평균 대비 변화율을 스코어화
- 액션 트리거 — 변화율 ±N% 이상 또는 KPI 임계선 이탈 시 알럿 + 원인 후보 제언

#### 의사결정 사례 — 데이터로 가격 정책을 바꿔 매출을 끌어올림

이 PROJECT의 핵심은 "지표를 본다"가 아니라 **"지표에서 발견한 신호를 실제 액션으로 옮긴다"**. 두 개의 사례로 보여줌.

**사례 A · VVIP 가격대 정책 리뉴얼 (2026-04 적용)**
1. **문제 인지** — 인플레이션 영향으로 고액 결제 상품의 상대적 매력도(요율 후함)가 떨어지고 있음을 KPI 보고에서 감지
2. **데이터 분석** — `결제 코인 대비 배팅 금액(최빈)` 차트로 결제 가격대별 유저 행동 패턴 분석
   - **시각 자료**: `assets/img/project1_decision_betting.png` (= `project1_2.png`)
   - 발견: `$9 ~ $299` 구간은 결제 코인과 배팅 금액이 평탄 → 안정 구간
   - 발견: `$499 ~ $999` 구간에서 배팅 금액이 비선형 급증 → **고액 결제자가 결제 코인 대비 과도하게 큰 배팅을 함 = 현재 offering이 박함**
3. **시뮬레이션** — 가격대별 `BaseCoin / 판매가격 % 요율` 변경안 작성
   - **시각 자료**: `assets/img/project1_decision_pricing.png` (= `project1_1.png`)
   - $1~$59 구간: 변경 없음 (저액 구간은 인플레이션 영향 적음)
   - $99~$999 구간: $1당 지급 코인을 2.25~1.3배 증가 (예: $99 = 200만 → 450만 코인, $999 = 1000만 → 1300만 코인)
   - prestige 비율($1 대비 %)은 일부 축소 — 절대 코인량은 늘리되 등급 간 격차는 유지
4. **사전 검증** — 상위상품 요율 증가가 게임 내 인플레이션(코인 가치 하락)을 야기하지 않는지 시뮬레이션
5. **액션 (2026-04-09 확정)** — 변경안 적용
6. **결과** — 인플레이션 이후 m/m 매출 **+7.9% 증가**, 고액상품 건수 구매 비율 유지

**사례 B · 페이스북 팬페이지 정지 대응**
- KPI 보고에서 AU 하락 감지 → 외부 채널(페이스북 팬페이지) 정지 원인 식별
- 액션: 대체 페이지 정보를 유저에게 PUSH로 안내하는 UE 채널 대응
- 결과: 유저 복귀 확인

**시각 자료 정리**
- 의사결정 사례 A의 두 이미지를 카드 형태로 좌(차트)·우(정책표) 배치
- 차트는 hover 시 어떤 발견을 했는지 짧은 캡션 fade-in
- 정책표는 변경 전/후 컬럼이 가로 스크롤 없이 한 화면에 들어오도록 모바일에서는 핵심 가격대(`$99 / $199 / $499 / $999`)만 발췌해서 보여줌

> v1·v2에서 이 섹션에 있던 "AI 캘린더"는 v2부터 **AI ENGINEERING PRACTICE Card 3-B의 `Auto_calender`**로 이동. 같은 도구가 두 군데서 설명되지 않도록 일원화.

### 2.5 PROJECT 02 — DevOps 기반 스케줄 서버 운영 인프라 구축 및 이상탐지 시스템 KPI 정의

**한 줄 요약**: WHOW/DDC/DUC/SA/Bingo 등 게임 서비스의 핵심 지표를 24시간 자동 모니터링하는 Dagster 파이프라인. 크론탭 + 주피터 기반 임시 운영을 Dagster + Bitbucket(CI/CD) 기반 표준 운영 인프라로 전환.

> 이 섹션은 의도적으로 **AI 색채를 빼고 Dagster + Bitbucket 운영 자동화**에 집중한다. AI 활용 측면은 위 AI ENGINEERING PRACTICE 카드 2(라이브 이중 환경 + 에이전트로 안정적 서버 개발)에서 이미 다뤘다.

**시그니체 요소: Mermaid Before / After 토글 (2단계)**

- 상태 A: **기존 운영** — 크론탭 기반 스케줄링, 주피터 노트북 직접 사용 (버전 관리·UI·로그 부재), 라이브 서버 직접 수정·배포 (검증 단계 없음)
- 상태 B: **현재 운영** — Dagster UI 기반 모니터링, Bitbucket 코드 버전 관리, Bitbucket Runner CI/CD 자동 배포, 이상탐지 KPI 정량 평가 체계 (recall·오탐률·반응성)

**서브섹션**:
- 얼럿 서버 정의 — 게임 서비스 24/7 KPI 모니터링, 이상 감지 즉시 Slack 알림
- 기존 운영 방식의 한계 — 이상탐지 KPI 부재 / 주피터 노트북 버전 관리 불가 / 크론탭 UI·로그 부재
- 현재 운영 인프라 구축
  - **이상탐지 시스템 KPI 설정** (이슈 감지 recall·오탐률·반응성)
  - **반기 단위 이슈 리스트업 + 정량 평가 사이클** 수립
  - **Bitbucket 도입**으로 코드 버전 관리·롤백 체계 표준화
  - **Bitbucket Runner**로 CI/CD 자동 배포 환경 구축
  - **Dagster**로 실행 로그·작업 흐름 시각화, 얼럿 운영 UI 기반 표준화
- **마이그레이션 실적 — 크론탭 기반 얼럿 42개 → Dagster 이전 완료**
- 운영 효과 비교표 — 스케줄링 안정성·운영 효율·버전 관리·롤백 시간 등 항목별

> v2.2 변경: 멀티 에이전트 야간 자율 개발 다이어그램·내용 제거. CLAUDE.md 규칙 표는 PROJECT 02에서 빼고 AI 섹션 카드 2로 이동.

### 2.6 PROJECT 03 — 자사 앱 대시보드 운영

**한 줄 요약**: 실험 현황(AB Test) + 신규 슬롯 트레킹을 한 UI에서 처리하는 운영 대시보드. Pretendard + Chart.js + Tailwind CDN으로 구축한 자체 BI.

**시그니체 요소: 라이브 iframe 미리보기**
- 카드 안에 실제 대시보드(`/dashboards/duc-ops.html`)를 iframe으로 임베드
- `transform: scale(0.45)` + `pointer-events: none`으로 미리보기 모드
- 카드 클릭 시 새 탭에서 풀로딩

**서브섹션**:
- 실험 현황 모듈 — FTUE 흐름 개편, 첫 구매 팝업 타이밍 등 AB Test 모니터링
- is_pair 세그먼테이션 — 비결제 / pairwise / 결제 상위 8명
- 신규 슬롯 트레킹 — 오픈 슬롯 성과·리텐션 추적
- KPI 카드 — 진행중 실험, Q1 완료 실험 채택률 62.5%, 평균 개선 효과 +18.4%
- 기술 메모 — Pretendard + Chart.js + Tailwind CDN, 좌측 사이드바·우측 패널 토글 가능한 3-pane 레이아웃

### 2.7 CONTACT

```
[큰 헤딩]   대화를 시작해주세요
[큰 이메일] chy0107@afewgoodsoft.com
[보조 채널] GitHub · LinkedIn(있을 때) · Resume PDF
[푸터]      © 2026 차한영
```

---

## 3. 비주얼 시스템 (D · Warm Pretendard)

### 3.1 컬러 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#FFF8F2` | 페이지 배경 (베이지) |
| `--surface` | `#FFFFFF` | 카드 |
| `--text` | `#2A2118` | 본문 |
| `--text-muted` | `#6B6258` | 보조 텍스트 |
| `--accent` | `#FF6F0F` | 당근 오렌지 (CTA·핵심 강조) |
| `--accent-soft` | `#FFE1CD` | 액센트 보조 (배경 톤) |
| `--brown` | `#946A47` | warm brown (보조 라벨) |
| `--border` | `#F3D9C4` | 분리선·카드 보더 |
| `--code-bg` | `#FAF4EC` | 인라인 코드 배경 |

### 3.2 타이포그래피

- 본문: Pretendard (jsdelivr CDN, static subset)
- 모노스페이스: JetBrains Mono (경로·코드·숫자 강조)
- 스케일:
  - Hero title: 56–72px / weight 700 / letter-spacing -0.03em
  - Section heading: 32–40px / weight 700
  - Subsection: 20–22px / weight 600
  - Body: 16px / line-height 1.7
  - Mono inline: 14px

### 3.3 레이아웃·간격

- 최대 너비: 880px (콘텐츠) / 1080px (하이라이트 카드 그리드)
- 섹션 간 수직 여백: 120px (데스크탑) / 80px (모바일)
- 컬럼 패딩: 24px (모바일) / 48px (데스크탑)
- 카드 보더 라디우스: 14px
- 카드 그림자: `0 8px 22px rgba(15,23,42,0.04)` (절제)

### 3.4 모션 (절제)

- 스크롤 진입: opacity 0→1 + translateY 12→0, 0.4s ease-out
- 숫자 카운트업: IntersectionObserver로 뷰포트 진입 시 0→타깃, 1.2s ease-out
- 카드 hover: `translateY(-2px)` + 그림자 살짝 증가, 0.18s
- Mermaid 토글: 다이어그램 교체에 0.25s crossfade

### 3.5 반응형

- 브레이크포인트: 720px / 1080px
- 720px 이하: 단일 컬럼, 하이라이트 4카드는 수직 스택
- 720~1080px: 하이라이트는 2×2 유지, 본문 폭 88vw
- 1080px 이상: 본문 880px 고정

---

## 4. 시그니체 인터랙티브 요소

### 4.1 숫자 카운트업
- 대상: AI 섹션 핵심 수치 + 각 프로젝트의 하이라이트 메트릭 (예: `42`, `8`, `62.5%`, `+18.4%`)
- 구현: IntersectionObserver + requestAnimationFrame 기반 easing
- 트리거: 요소가 뷰포트 60% 이상 보일 때 1회 발화

### 4.2 Mermaid Before / After 토글
- 위치: PROJECT 02 내부
- 상태: 2단계 (`기존 운영` / `현재 운영`)
  - 기존 운영: 크론탭 + 주피터 + 라이브 직접 수정 흐름
  - 현재 운영: Dagster + Bitbucket(CI/CD) + 이상탐지 KPI 평가 흐름
- 구현: 두 Mermaid 노드를 모두 사전 렌더 후 `display` 전환 + 0.25s crossfade
- 토글 UI: pill-shaped switch, 활성 상태 컬러 `--accent`

### 4.3 DUC 대시보드 라이브 iframe
- 위치: PROJECT 03 카드 내부
- 임베드 방식: `<iframe src="/dashboards/duc-ops.html" loading="lazy">`
- 미리보기 처리: 컨테이너에 `overflow:hidden`, iframe에 `transform: scale(0.45)` + `transform-origin: top left` + `pointer-events: none`
- 카드 클릭 시: `window.open('/dashboards/duc-ops.html', '_blank')`
- 접근성: 카드에 `role="link"` + `aria-label`

---

## 5. 기술 결정

### 5.1 스택
- HTML5 + CSS3 + 바닐라 JS (프레임워크·빌드 도구 없음)
- 참고 포트폴리오(49turtle)와 동일한 스택 — package.json 없음
- CDN: Pretendard, Mermaid.js, JetBrains Mono (서브셋)
- 기존 자산: `design-a-1-experiment.html`을 `/dashboards/duc-ops.html`로 그대로 이전 (Tailwind CDN + Chart.js 그대로)

### 5.2 파일 구조

```
/
├── index.html
├── resume.html                              (이력서 페이지 — 차한영 Hanyeong Cha *.html 복사)
├── css/
│   ├── main.css
│   └── tokens.css                            (컬러·타이포 변수)
├── js/
│   ├── main.js                               (스크롤 페이드, 카운트업, 토글, 부드러운 스크롤)
│   └── mermaid-init.js
├── dashboards/
│   └── duc-ops.html                          (기존 design-a-1-experiment.html 이전)
├── samples/
│   └── mobile-ccu-anomaly.html               (redshift_agent 분석 리포트 사본)
├── assets/
│   ├── img/
│   │   ├── auto-calendar-preview.png         (auto_calender.png 복사)
│   │   ├── project1_decision_betting.png     (project1_2.png 복사)
│   │   ├── project1_decision_pricing.png     (project1_1.png 복사)
│   │   ├── alert-server-dagster-jobs.png     (image_(8).png 복사 — PROJECT 02용)
│   │   ├── alert-server-timeline.png         (image_(9).png 복사 — PROJECT 02용)
│   │   └── (기타 zip 이미지 필요 시 추가)
│   └── profile.jpg                           (사진 받으면 추가, 옵션)
├── favicon.ico
└── README.md
```

### 5.3 호스팅
- 1차: GitHub Pages (별도 리포 `daangn-portfolio` 또는 `<username>.github.io`)
- 대안: Vercel (커스텀 도메인 연결 용이)
- 도메인은 우선 기본값. 커스텀 도메인 결정은 추후.

### 5.4 SEO·메타
- `<title>`: `차한영 — End-to-end Data Analytics Engineer`
- `<meta name="description">`: 한 문장 요약, 당근 지원 컨텍스트 포함
- OG 태그: Hero 스크린샷을 OG 이미지로 사용
- `lang="ko"`

### 5.5 접근성
- 색 대비 WCAG AA 통과 (오렌지 액센트는 흰 배경 위에서만 큰 글자에 한정 사용)
- 키보드 네비게이션: 모든 CTA가 `<a>` 또는 `<button>`
- iframe 미리보기에 텍스트 대안 제공
- `prefers-reduced-motion` 시 스크롤 페이드·카운트업 비활성

---

## 6. 미정·향후 채워질 항목 (placeholder)

| 항목 | 상태 |
|---|---|
| 지원자 프로필 사진 | 사용자가 디렉토리에 추가 예정 |
| ~~Resume PDF 파일~~ → **이력서 HTML 페이지로 대체** | **제공됨** — `차한영 Hanyeong Cha 6f855f6f99364fd5a6c2a667da46aec0.html`를 `resume.html`로 복사. CTA의 "Resume" 버튼이 새 탭으로 이 페이지 열도록 구현 |
| 정확한 메일 주소 표기 | `chy0107@afewgoodsoft.com` 사용 (CLAUDE.md 정보 기반) — 확정 필요 |
| GitHub URL | 미정 — 사용자가 알려줄 예정 |
| LinkedIn URL | 옵션 — 사용자가 알려줄 예정 |
| **PROJECT 01 시각 자료** | **제공됨** — `project1_1.png` (가격대별 BaseCoin/요율 정책 표) + `project1_2.png` (결제 코인 대비 배팅 금액 차트). `assets/img/project1_decision_pricing.png` / `project1_decision_betting.png`로 이동 필요 |
| 호스팅 도메인 | GitHub Pages 기본값. 커스텀 도메인 결정 보류 |
| Auto_calender 결과 화면 캡처 | **제공됨 (확정)** — `auto_calender.png` 사용. `assets/img/auto-calendar-preview.png`로 복사. `19d5e94b-*.png`는 미사용 |
| auto_report 결과 화면 캡처 | (옵션) `issue_timeline_extractor` 산출물(CSV·audit notes)이나 Agent Team 실행 로그 캡처 — 없으면 텍스트만 |
| GS_projection_renew_slot 결과 시각화 | (옵션) `v4_AB_blended` 백테스트 metric 또는 forward_week 예측 차트 — 없으면 텍스트만 |
| **redshift_agent 샘플 분석** | **제공됨** — `mobile_issue_0406_0407.html` (5MB, d3.js 임베드 인터랙티브 리포트). `samples/mobile-ccu-anomaly.html`로 복사 후 새 탭 링크로 사용 |
| GitHub repo 공개 여부 | 카드 내부 링크용. 사용자가 결정 |
| `차한영 Hanyeong Cha *.html` | **확정** — `resume.html`로 복사해 이력서 페이지로 사용. CTA "Resume" 버튼이 이 파일을 새 탭으로 열도록 구현 |

---

## 7. 범위 외 (Out of Scope)

- 다국어(영문) 버전 — 한국어만
- 다크 모드 — 향후 옵션
- 블로그·아티클 영역
- 검색·필터 기능
- CMS 연결
- React/Vue/Next 등 프레임워크 도입
- ABOUT 섹션
- EXPERIENCE 타임라인 (이력서로 대체)

---

## 8. 성공 검증 체크리스트 (구현 완료 시점)

- [ ] 모바일·데스크탑에서 단일 스크롤로 끝까지 끊김 없이 읽힘
- [ ] HERO에서 30초 안에 정체성·지원 컨텍스트·연락 수단이 모두 인지됨
- [ ] AI ENGINEERING PRACTICE 4 통합 카드가 [방법론 + 구체 사례 + 태그]를 한 카드 안에서 전달 (병렬·안정성·도구 결합·자산화 4축)
- [ ] 카드 3-B (Auto_calender) hover 시 Google Calendar 미리보기 이미지가 정상 노출
- [ ] 카드 4 (redshift_agent)에서 "전체 리포트 열기" 클릭 시 `samples/mobile-ccu-anomaly.html`이 새 탭으로 정상 로딩 (d3.js 차트 깨지지 않음)
- [ ] PROJECT 01에 의사결정 사례 A (VVIP 가격 정책) 가 데이터 분석 → 시뮬레이션 → 액션 → 결과 흐름으로 명확히 노출
- [ ] PROJECT 01의 두 이미지(`project1_decision_betting`, `project1_decision_pricing`)가 모바일에서 깨지지 않고 핵심 가격대만 발췌해서 가독성 유지
- [ ] PROJECT 02 제목이 "DevOps 기반 스케줄 서버 운영 인프라 구축 및 이상탐지 시스템 KPI 정의"로 노출
- [ ] PROJECT 02에서 AI 색채가 빠지고 Dagster + Bitbucket 운영 자동화 어필이 명확
- [ ] PROJECT 02에 야간 자율 멀티 에이전트 다이어그램·내용이 없음
- [ ] PROJECT 03 제목이 "자사 앱 대시보드 운영"으로 노출
- [ ] Mermaid Before/After 토글이 `기존 운영` / `현재 운영` 2단계로 0.5초 이내 부드럽게 전환
- [ ] DUC 대시보드 iframe이 깨지지 않고 미리보기 + 새 탭 동작
- [ ] 숫자 카운트업이 한 번만 발화 (재진입 시 재발화 없음)
- [ ] WCAG AA 색 대비 통과
- [ ] Lighthouse Performance ≥ 90 (로컬 기준)
- [ ] OG 이미지가 카카오톡·슬랙 미리보기에 정상 노출
