export const DRAFT_KEY = 'toc_draft_v1';
export const BACKUP_PREFIX = 'toc_backup_';
export function saveWithBackup(storage: Pick<Storage, 'getItem' | 'setItem'>, name: string, raw: string) {
  const key = `toc_char_${name}`;
  const previous = storage.getItem(key);
  if (previous !== null && previous !== raw) storage.setItem(`${BACKUP_PREFIX}${name}`, previous);
  storage.setItem(key, raw);
}
export function listCharacters(storage: Storage) {
  return Object.keys(storage).filter(key => key.startsWith('toc_char_')).map(key => key.slice(9));
}
