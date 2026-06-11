/**
 * SIRIAI 통합 캠페인 지원 폼 → Google Sheets 연동
 * 대상 시트: https://docs.google.com/spreadsheets/d/1IBr6D_XrtL1LmgrEF9VrfQahvhwbvOzcpCS6Vvy215o/edit
 * ------------------------------------------------------------
 * 설치 방법
 * 1) 위 구글 시트를 연 뒤 [확장 프로그램] → [Apps Script] 클릭
 * 2) 기본 Code.gs 내용을 모두 지우고 이 코드를 붙여넣기
 * 3) 상단 함수 목록에서 setup 을 한 번 실행 (탭/헤더 자동 생성 + 권한 승인)
 *    → 스프레드시트에 '통합지원서' 탭이 새로 생깁니다. (기존 폼 응답 탭은 그대로 보존)
 * 4) [배포] → [새 배포] → 유형: '웹 앱'
 *      - 실행 주체: 나
 *      - 액세스 권한: '모든 사용자(Anyone)'
 * 5) 생성된 웹 앱 URL(/exec 로 끝남)을 복사해
 *    index.html 의 WEBHOOK_URL 값에 붙여넣기
 * ------------------------------------------------------------
 * 참고: 기존 구글폼 응답 탭에는 '지원 캠페인' 열이 없고, 폼이 자동으로 행을
 *       추가하는 탭이라 구조가 다릅니다. 그래서 충돌을 피하기 위해
 *       같은 스프레드시트 안의 별도 탭('통합지원서')에 기록합니다.
 */

// 기록 대상 스프레드시트 ID (링크의 /d/ 와 /edit 사이 값)
var SPREADSHEET_ID = '1IBr6D_XrtL1LmgrEF9VrfQahvhwbvOzcpCS6Vvy215o';

// 통합 지원서를 기록할 탭 이름 (없으면 자동 생성)
var SHEET_NAME = '통합지원서';

// 열 순서 = index.html payload 키 순서와 동일하게 유지
// 지원 캠페인은 브랜드별 O/X 컬럼으로 분리 → 필터·피벗·인덱싱 용이
var HEADERS = [
  '접수일시',      // timestamp
  '루솜',          // camp_lusom  (O/X)
  '잇퓨',          // camp_itfu   (O/X)
  '야다',          // camp_yadah  (O/X)
  '캠페인 동의',   // term_main
  '성함',          // inf_name
  '전화번호',      // inf_phone
  '연령대',        // inf_age
  '배송지 주소',   // inf_address
  '인스타그램',    // inf_insta
  '기타 채널',     // inf_others
  '이메일',        // inf_email
  '파트너십 풀'    // term_pool
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // 동시 제출 충돌 방지
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet_();

    sheet.appendRow([
      formatTime_(data.timestamp),
      data.camp_lusom || 'X',
      data.camp_itfu  || 'X',
      data.camp_yadah || 'X',
      data.term_main  || '',
      data.inf_name   || '',
      data.inf_phone  || '',
      data.inf_age    || '',
      data.inf_address|| '',
      data.inf_insta  || '',
      data.inf_others || '',
      data.inf_email  || '',
      data.term_pool  || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// 브라우저로 URL 접속 시 동작 확인용
function doGet() {
  return ContentService.createTextOutput('SIRIAI form endpoint is running.');
}

// 최초 1회 실행 — 탭/헤더 준비 + 권한 승인
function setup() {
  getSheet_();
}

// 헤더 구조를 바꿨을 때 1회 실행 — '통합지원서' 탭을 비우고 새 헤더로 초기화.
// (주의: 해당 탭의 기존 데이터가 모두 삭제됩니다. 테스트 행만 있을 때 사용하세요.)
function resetSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (sheet) { sheet.clear(); } else { sheet = ss.insertSheet(SHEET_NAME); }
  sheet.appendRow(HEADERS);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#eef2ec');
  sheet.setFrozenRows(1);
}

function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
         .setFontWeight('bold')
         .setBackground('#eef2ec');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ISO 시간 → 한국시간(KST) 'yyyy-MM-dd HH:mm:ss'
function formatTime_(iso) {
  var d = iso ? new Date(iso) : new Date();
  return Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
}
