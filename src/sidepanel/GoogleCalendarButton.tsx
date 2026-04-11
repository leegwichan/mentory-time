import { buildGoogleCalendarUrl } from '../lib/calendar'
import type { NormalizedEntry } from '../lib/types'

const calendarIconUrl = chrome.runtime.getURL('icons/google-calendar-icon.svg')

interface Props {
  entry: NormalizedEntry
  tabOrigin: string
}

export default function GoogleCalendarButton({ entry, tabOrigin }: Props) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        window.open(buildGoogleCalendarUrl(entry, tabOrigin), '_blank')
      }}
      className="flex-shrink-0 mt-0.5 opacity-60 hover:opacity-100 transition-opacity"
      title="구글 캘린더에 추가"
    >
      <img src={calendarIconUrl} alt="구글 캘린더에 추가" className="w-4 h-4" />
    </button>
  )
}
