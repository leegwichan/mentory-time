import type { NormalizedEntry, StorageSchema } from './types'

export async function saveEntries(
  entries: NormalizedEntry[],
  totalPages: number,
): Promise<void> {
  await chrome.storage.local.set({
    entries,
    lastFetched: Date.now(),
    totalPages,
  } satisfies Omit<StorageSchema, 'settings'>)
}

export async function loadStorage(): Promise<Omit<StorageSchema, 'settings'> | null> {
  const result = await chrome.storage.local.get(['entries', 'lastFetched', 'totalPages'])
  if (!result['entries']) return null
  return result as Omit<StorageSchema, 'settings'>
}

export async function loadSettings(): Promise<StorageSchema['settings']> {
  const result = await chrome.storage.local.get('settings')
  const saved = result['settings'] as Partial<StorageSchema['settings']> | undefined
  return { hideCancel: true, weekStartDay: 0, ...saved }
}

export async function updateSettings(
  patch: Partial<StorageSchema['settings']>,
): Promise<void> {
  const current = await loadSettings()
  await chrome.storage.local.set({ settings: { ...current, ...patch } })
}
