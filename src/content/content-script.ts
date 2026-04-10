const url = location.href

if (url.includes('/sw/mypage/userAnswer/history.do')) {
  chrome.runtime.sendMessage({ type: 'PAGE_DETECTED', payload: { pageType: 'history', url } })
} else if (url.includes('/sw/mypage/mentoLec/view.do')) {
  chrome.runtime.sendMessage({ type: 'PAGE_DETECTED', payload: { pageType: 'detail', url } })
  // MAIN world의 xhr-hook이 dispatch하는 CustomEvent 수신 → background로 전달
  window.addEventListener('__mentorytime_apply_complete__', () => {
    chrome.runtime.sendMessage({ type: 'APPLY_COMPLETE' }).catch(() => {})
  })
} else {
  chrome.runtime.sendMessage({ type: 'PAGE_DETECTED', payload: { pageType: 'other', url } })
}
