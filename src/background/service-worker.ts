chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

chrome.runtime.onMessage.addListener(
  (message: { type: string }, sender) => {
    if (message.type === 'PAGE_DETECTED' && sender.tab?.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id })
    }
  },
)
