import { useState, useEffect } from 'react'
import { useStore } from './store'
import { fetchDatabaseSchema, validateMapping, EXPECTED_TYPES } from '../lib/notion'
import type { NotionProperty, NotionPropertyMapping } from '../lib/types'

/** 매핑 필드 정의: label, key, 호환 타입은 EXPECTED_TYPES에서 참조 */
const MAPPING_FIELDS: { label: string; key: keyof NotionPropertyMapping; required?: boolean }[] = [
  { label: '제목', key: 'title', required: true },
  { label: '멘토', key: 'author' },
  { label: '날짜', key: 'date' },
  { label: '구분', key: 'category' },
  { label: '상태', key: 'status' },
  { label: '상세링크', key: 'detailUrl' },
  { label: '장소', key: 'location' },
]

interface Props {
  onBack: () => void
}

export default function NotionSettingsView({ onBack }: Props) {
  const { notionSettings, saveNotionSettings } = useStore()

  const [token, setToken] = useState(notionSettings?.token ?? '')
  const [databaseId, setDatabaseId] = useState(notionSettings?.databaseId ?? '')
  const [schema, setSchema] = useState<NotionProperty[]>([])
  const [mapping, setMapping] = useState<NotionPropertyMapping>(
    notionSettings?.mapping ?? { title: '' },
  )
  const [fetchingSchema, setFetchingSchema] = useState(false)
  const [schemaError, setSchemaError] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  // 설정이 있으면 자동으로 스키마 불러오기
  useEffect(() => {
    if (notionSettings?.token && notionSettings?.databaseId) {
      void handleFetchSchema(notionSettings.token, notionSettings.databaseId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleFetchSchema(t?: string, dbId?: string) {
    const useToken = t ?? token
    const useDbId = dbId ?? databaseId
    if (!useToken || !useDbId) {
      setSchemaError('토큰과 데이터베이스 ID를 입력하세요.')
      return
    }
    setFetchingSchema(true)
    setSchemaError(null)
    try {
      const props = await fetchDatabaseSchema(useToken, useDbId)
      setSchema(props)
    } catch (e) {
      setSchemaError(e instanceof Error ? e.message : 'DB 속성 불러오기 실패')
    } finally {
      setFetchingSchema(false)
    }
  }

  function updateMapping(key: keyof NotionPropertyMapping, value: string) {
    setMapping((prev) => {
      if (key === 'title') return { ...prev, title: value }
      if (!value) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: value }
    })
  }

  function handleSave() {
    if (!token || !databaseId) {
      setSaveMsg('토큰과 데이터베이스 ID를 입력하세요.')
      return
    }
    if (!mapping.title) {
      setSaveMsg('제목 매핑은 필수입니다.')
      return
    }
    if (schema.length > 0) {
      const errors = validateMapping(schema, mapping)
      if (errors.length > 0) {
        setSaveMsg(`매핑 타입 불일치: ${errors.map((e) => `${e.field}(기대: ${e.expected}, 실제: ${e.actual})`).join(', ')}`)
        return
      }
    }
    void saveNotionSettings({ token, databaseId, mapping })
    setSaveMsg('저장되었습니다.')
    setTimeout(() => setSaveMsg(null), 2000)
  }

  /** 호환되는 속성만 필터 */
  function compatibleProps(types: readonly string[]): NotionProperty[] {
    return schema.filter((p) => types.includes(p.type))
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-sm">&larr;</button>
        <span className="text-xs font-bold text-gray-700">Notion 연동 설정</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* 토큰 */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">API 토큰</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ntn_..."
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* DB ID */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">데이터베이스 ID</label>
          <input
            type="text"
            value={databaseId}
            onChange={(e) => setDatabaseId(e.target.value)}
            placeholder="abc123def456..."
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* DB 속성 불러오기 */}
        <button
          onClick={() => handleFetchSchema()}
          disabled={fetchingSchema}
          className="w-full py-1.5 text-xs font-semibold text-brand-600 border border-brand-300 rounded-md hover:bg-brand-50 disabled:opacity-40 transition-colors"
        >
          {fetchingSchema ? 'DB 속성 불러오는 중...' : 'DB 속성 불러오기'}
        </button>

        {schemaError && <p className="text-[11px] text-red-500">{schemaError}</p>}

        {/* 속성 매핑 */}
        {schema.length > 0 && (
          <div className="space-y-2.5">
            <div className="text-[11px] font-semibold text-gray-600 border-t border-gray-100 pt-3">속성 매핑</div>
            {MAPPING_FIELDS.map(({ label, key, required }) => {
              const options = compatibleProps(EXPECTED_TYPES[key])
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600 w-16 shrink-0">
                    {label}{required && <span className="text-red-400">*</span>}
                  </span>
                  <select
                    value={(mapping[key] as string) ?? ''}
                    onChange={(e) => updateMapping(key, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="">(없음)</option>
                    {options.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        )}

        {/* 저장 */}
        <button
          onClick={handleSave}
          className="w-full py-2 text-xs font-bold text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors"
        >
          저장
        </button>

        {saveMsg && (
          <p className={`text-[11px] text-center ${saveMsg === '저장되었습니다.' ? 'text-green-600' : 'text-red-500'}`}>
            {saveMsg}
          </p>
        )}
      </div>
    </div>
  )
}
