import { useEffect, useState } from 'react'
import { useStore } from './store'

type Tab = 'list' | 'timetable'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('list')
  const { loadCache, fetchAll } = useStore()

  useEffect(() => {
    loadCache()
  }, [loadCache])

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 text-sm">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-brand-50 border-b border-brand-100">
        <span className="font-bold text-brand-700 tracking-tight">MentoryTime</span>
        <button
          onClick={fetchAll}
          className="text-brand-600 hover:text-brand-700 text-base leading-none"
          title="새로고침"
        >
          ↺
        </button>
      </header>

      {/* 탭바 */}
      <nav className="flex border-b border-brand-100">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'list'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          접수 목록
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'timetable'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          시간표
        </button>
      </nav>

      {/* 콘텐츠 */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'list' ? <ListView /> : <TimetableView />}
      </main>
    </div>
  )
}

function ListView() {
  const { entries, loading, progress, error, fetchAll } = useStore()

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
        <button
          onClick={fetchAll}
          className="text-xs text-brand-600 underline"
        >
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

  return (
    <div className="divide-y divide-gray-100">
      {entries.map((entry) => (
        <div key={entry.qustnrSn} className="px-4 py-3">
          <p className="text-xs text-gray-400 mb-0.5">{entry.lectureDate}</p>
          <a
            href={`https://swmaestro.ai${entry.detailUrl}`}
            target="_blank"
            rel="noreferrer"
            className="text-brand-700 font-medium leading-snug line-clamp-2 hover:underline"
          >
            {entry.title}
          </a>
          <p className="text-xs text-gray-500 mt-0.5">
            {entry.author} · {entry.lectureStartTime.slice(0, 5)}~{entry.lectureEndTime.slice(0, 5)}
          </p>
          <span
            className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full ${
              entry.status === '접수완료'
                ? 'bg-brand-100 text-brand-700'
                : 'bg-gray-100 text-gray-400 line-through'
            }`}
          >
            {entry.status}
          </span>
        </div>
      ))}
    </div>
  )
}

function TimetableView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs">
      <p>시간표 준비 중</p>
    </div>
  )
}
