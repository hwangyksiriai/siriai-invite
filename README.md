# SIRIAI 통합 캠페인 지원폼 — 배포 & 운영 가이드

루솜 · 잇퓨 · 야다 3개 캠페인을 하나로 통합한 인플루언서 지원폼입니다.
지원 데이터는 구글시트에 자동 적재됩니다. **빌드 과정이 없는 정적 사이트**라, 폴더를 그대로 호스팅하면 됩니다.

---

## 1. 폴더 구성

```
siriai-invite/
├─ index.html        # 지원폼 본체 (단일 HTML, 빌드 불필요)
├─ images/
│  └─ main.jpg       # 히어로 메인 이미지
├─ apps-script.gs    # 구글시트 연동 코드 (Google Apps Script에 붙여넣음)
├─ vercel.json       # 정적 배포 설정 (수정 불필요)
└─ README.md         # 이 문서
```

---

## 2. Vercel 배포

> Framework Preset: **Other** / Build Command: **비움** / Output Directory: **기본(./)**
> 빌드가 없으므로 폴더 내용을 그대로 서빙합니다.

### 방법 A — GitHub 연동 (지속 관리 권장)
1. `siriai-invite` 폴더를 GitHub 저장소에 push
2. [vercel.com](https://vercel.com) → **Add New → Project** → 저장소 Import
3. Framework Preset = **Other** 확인 → **Deploy**
4. 이후 저장소에 push하면 자동 재배포 (콘텐츠/이미지 수정 → commit → push)

### 방법 B — Vercel CLI (빠른 1회 배포)
```bash
npm i -g vercel
cd siriai-invite
vercel          # 미리보기 배포 (질문은 기본값 Enter, Framework는 Other)
vercel --prod   # 운영 배포
```

### 도메인 연결
Vercel 프로젝트 → **Settings → Domains** 에서 원하는 주소 연결.

> 배포 후 `index.html` 의 `og:image` (미리보기 썸네일)를 운영 도메인 기준 절대경로
> (예: `https://도메인/images/main.jpg`)로 바꿔두면 링크 공유 시 메인 이미지가 노출됩니다.

---

## 3. 구글시트 연동

지원 데이터가 적재되는 구글시트:
`https://docs.google.com/spreadsheets/d/1IBr6D_XrtL1LmgrEF9VrfQahvhwbvOzcpCS6Vvy215o/edit`

- 연동은 **이미 설정되어 있습니다.** `index.html` 의 `WEBHOOK_URL` 에 Apps Script 웹앱 주소가 들어가 있습니다.
- 수집 위치: 스프레드시트의 **`통합지원서`** 탭 (기존 폼 응답/분석 탭은 그대로 보존)
- 컬럼 구조:

  | 접수일시 | 루솜 | 잇퓨 | 야다 | 캠페인 동의 | 성함 | 전화번호 | 연령대 | 배송지 주소 | 인스타그램 | 기타 채널 | 이메일 | 파트너십 풀 |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|

  → 지원한 브랜드는 **O**, 미지원은 **X**. 열 필터 한 번으로 브랜드별 지원자 추출 가능.

### Apps Script를 다시 세팅하거나 컬럼을 변경할 때
1. 시트 → **확장 프로그램 → Apps Script** → `apps-script.gs` 내용 붙여넣기
2. 함수 목록에서 **`setup`** 실행 (최초) — 탭/헤더 생성 + 권한 승인
   - 헤더 구조를 바꿨다면 대신 **`resetSheet`** 실행 → 탭을 비우고 새 헤더로 초기화
   - ⚠️ `resetSheet` 는 해당 탭 데이터를 모두 지웁니다. **실데이터가 쌓인 뒤에는 실행 금지.**
3. **배포 → 배포 관리 → (연필) 편집 → 버전: 새 버전 → 배포** — 웹앱 URL은 그대로 유지됩니다.

---

## 4. 콘텐츠 수정 (전부 `index.html` 한 파일)

| 수정 항목 | 위치 |
|---|---|
| 히어로 메인 이미지 | `images/main.jpg` 교체 (세로형 권장) |
| 히어로 얼굴/구도 어긋남 | `.hero-media img` 의 `object-position: center 24%` 값 조정 (작게=위, 크게=아래) |
| 히어로 헤드라인/문구 | `<section class="hero">` 안 `hero-title`, `hero-meta` |
| 캠페인 카드(일정·고료·소개) | `class="campaign-card"` 블록 — ① 루솜 / ② 잇퓨 / ③ 야다 |
| 캠페인 상세(바텀시트) | `id="sheet-lusom"` / `sheet-itfu` / `sheet-yadah` — 조건·해시태그·레퍼런스·가이드 링크 |
| 지원 선택지(체크박스) | `name="campaign"` 항목 |
| 시트 연동 주소 변경 | `<script>` 상단 `const WEBHOOK_URL` |

> 캠페인을 추가/삭제하려면: ① 인트로 카드, ② 선택 체크박스(`name="campaign"`), ③ 바텀시트, ④ `apps-script.gs` 의 컬럼(HEADERS/appendRow) 네 곳을 함께 맞춰 주세요.

---

## 5. 운영 메모
- 신규 지원은 `통합지원서` 탭에 실시간 누적됩니다.
- 브랜드별 추출: 루솜/잇퓨/야다 열에서 `O` 필터.
- 테스트 제출 후에는 해당 행만 지우면 됩니다 (`resetSheet` 는 전체 초기화이므로 평소엔 사용하지 않음).
