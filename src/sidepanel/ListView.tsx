import { useStore } from './store'
import type { NormalizedEntry } from '../lib/types'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function groupByDate(entries: NormalizedEntry[]): [string, NormalizedEntry[]][] {
  const map = new Map<string, NormalizedEntry[]>()
  for (const entry of entries) {
    const key = entry.lectureDate
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(entry)
  }
  return Array.from(map.entries())
}

function formatDateHeader(entry: NormalizedEntry): string {
  return `${entry.lectureDate} (${DAY_LABELS[entry.dayOfWeek]})`
}

export default function ListView() {
  const { entries, loading, progress, error, fetchAll, hideCancel, toggleHideCancel } = useStore()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-brand-600">
        <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        {progress && (
          <p className="text-xs text-gray-400">
            {progress.current} / {progress.total} 페이지 불러오는 중...
          </p>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
        <p className="text-xs text-red-500">{error}</p>
        <button onClick={fetchAll} className="text-xs text-brand-600 underline">
          다시 시도
        </button>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
        <p className="text-xs text-gray-400 leading-5">
          SW마에스트로 접수내역 페이지를 방문하거나<br />
          새로고침 버튼을 눌러주세요.
        </p>
        <button
          onClick={fetchAll}
          className="px-3 py-1.5 text-xs bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors"
        >
          불러오기
        </button>
      </div>
    )
  }

  const filtered = hideCancel ? entries.filter((e) => e.status === '접수완료') : entries
  const groups = groupByDate(filtered)

  return (
    <div>
      {/* F2: 필터 토글 */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50">
        <span className="text-[10px] text-gray-400">필터</span>
        <button
          onClick={toggleHideCancel}
          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
            !hideCancel
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-gray-400 border-gray-200'
          }`}
        >
          접수완료
        </button>
        <button
          onClick={toggleHideCancel}
          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
            hideCancel
              ? 'bg-white text-gray-400 border-gray-200 line-through'
              : 'bg-white text-gray-500 border-gray-200'
          }`}
        >
          접수취소 포함
        </button>
      </div>

      {/* F1: 날짜 그룹 + F3: 상세 링크 */}
      {groups.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-xs text-gray-400">
          표시할 항목이 없습니다.
        </div>
      ) : (
        groups.map(([date, groupEntries]) => (
          <div key={date}>
            {/* 날짜 그룹 헤더 */}
            <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-500 tracking-wide">
              {formatDateHeader(groupEntries[0])}
            </div>

            {/* 항목 목록 */}
            <div className="divide-y divide-gray-100">
              {groupEntries.map((entry) => (
                <a
                  key={entry.qustnrSn}
                  href={`https://swmaestro.ai${entry.detailUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block px-4 py-3 hover:bg-brand-50 transition-colors"
                >
                  <p
                    className={`font-medium leading-snug line-clamp-2 ${
                      entry.status === '접수완료' ? 'text-brand-700' : 'text-gray-400'
                    }`}
                  >
                    {entry.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {entry.author} · {entry.lectureStartTime.slice(0, 5)}~{entry.lectureEndTime.slice(0, 5)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-gray-400">{entry.category}</span>
                    <span className="text-[10px] text-gray-300">·</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        entry.status === '접수완료'
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-gray-100 text-gray-400 line-through'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
