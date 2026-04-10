// MAIN world에서 실행 - 페이지의 XMLHttpRequest를 패칭해 신청 완료를 감지한다.
// isolated world에서는 페이지의 XHR에 접근 불가하므로 manifest에서 world: 'MAIN' 지정.
;(function () {
  const _open = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function (method: string, url: string, ...rest: unknown[]) {
    if (
      typeof method === 'string' &&
      method.toUpperCase() === 'POST' &&
      typeof url === 'string' &&
      url.includes('/mentoLec/apply.json')
    ) {
      this.addEventListener('load', () => {
        try {
          const data = JSON.parse(this.responseText) as { resultCode?: string }
          if (data.resultCode === 'success') {
            window.dispatchEvent(new CustomEvent('__mentorytime_apply_complete__'))
          }
        } catch {
          /* ignore */
        }
      })
    }
    return (_open as (method: string, url: string, ...a: unknown[]) => void).call(
      this,
      method,
      url,
      ...rest,
    )
  }
})()
