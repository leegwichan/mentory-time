import { create } from 'zustand'
import { parseHistoryPage, parseTotalPages, normalizeEntry, parseDetailPage } from '../lib/parser'
import { saveEntries, loadStorage } from '../lib/storage'
import type { NormalizedEntry, DetailInfo } from '../lib/types'

const HISTORY_URL =
  'https://swmaestro.ai/sw/mypage/userAnswer/history.do?menuNo=200047&pageIndex='

interface StoreState {
  entries: NormalizedEntry[]
  loading: boolean
  progress: { current: number; total: number } | null
  error: string | null
  lastFetched: number | null
  hideCancel: boolean
  pendingQustnrSn: string | null
  previewEntry: DetailInfo | null
  toggleHideCancel: () => void
  loadCache: () => Promise<void>
  fetchAll: () => Promise<void>
  setPendingDetail: (qustnrSn: string | null) => void
  clearPreview: () => void
  /** 시뮬레이션 활성화. 이미 접수완료면 true 반환, 아니면 fetch+파싱 후 previewEntry 설정 */
  activatePreview: (qustnrSn: string) => Promise<boolean>
}

export const useStore = create<StoreState>((set, get) => ({
  entries: [],
  loading: false,
  progress: null,
  error: null,
  lastFetched: null,
  hideCancel: true,
  pendingQustnrSn: null,
  previewEntry: null,
  toggleHideCancel: () => set((s) => ({ hideCancel: !s.hideCancel })),
  setPendingDetail: (qustnrSn) => set({ pendingQustnrSn: qustnrSn }),
  clearPreview: () => set({ previewEntry: null }),
  activatePreview: async (qustnrSn) => {
    if (get().entries.some((e) => e.qustnrSn === qustnrSn && e.status === '접수완료')) {
      return true
    }
    try {
      const url = `https://swmaestro.ai/sw/mypage/mentoLec/view.do?qustnrSn=${qustnrSn}&menuNo=200046&pageIndex=1`
      const doc = await fetchDoc(url)
      const info = parseDetailPage(doc, qustnrSn)
      if (info) set({ previewEntry: info })  // pendingQustnrSn 유지 → 반영 해제 후 재시뮬레이션 가능
    } catch { /* 실패 시 무시 */ }
    return false
  },

  loadCache: async () => {
    const cached = await loadStorage()
    if (cached) {
      const entries = cached.entries.map((e) => ({
        ...e,
        lectureDateObj: new Date(e.lectureDate),
      }))
      set({ entries, lastFetched: cached.lastFetched })
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null, progress: null })
    try {
      const page1Doc = await fetchDoc(HISTORY_URL + '1')
      const totalPages = parseTotalPages(page1Doc)
      const allEntries = parseHistoryPage(page1Doc).map(normalizeEntry)

      set({ progress: { current: 1, total: totalPages } })

      for (let page = 2; page <= totalPages; page++) {
        const doc = await fetchDoc(HISTORY_URL + page)
        allEntries.push(...parseHistoryPage(doc).map(normalizeEntry))
        set({ progress: { current: page, total: totalPages } })
      }

      allEntries.sort((a, b) => a.lectureDateObj.getTime() - b.lectureDateObj.getTime())

      await saveEntries(allEntries, totalPages)
      set({ entries: allEntries, loading: false, progress: null, lastFetched: Date.now() })
    } catch {
      set({ loading: false, error: '데이터를 불러오지 못했어요. SW마에스트로에 로그인되어 있는지 확인해주세요.' })
    }
  },
}))

async function fetchDoc(url: string): Promise<Document> {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()
  return new DOMParser().parseFromString(html, 'text/html')
}
