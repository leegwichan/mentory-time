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
