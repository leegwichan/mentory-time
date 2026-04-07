# src/background — 서비스 워커

## 역할
- Side Panel 라이프사이클 관리 (`chrome.sidePanel`) — 이것만 담당
- fetch/파싱/storage는 sidepanel/store.ts가 직접 처리 (MV3 SW에 DOMParser 없음)

## 주의
- 서비스 워커는 언제든 종료될 수 있음 — 상태를 메모리에 유지하지 말 것
- 기능을 추가할 때 fetch 오케스트레이션을 이 파일에 넣지 말 것

## fetch 대상 URL 패턴
`DESIGN.md` 섹션 8 참조.
