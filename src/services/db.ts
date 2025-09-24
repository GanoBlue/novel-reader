// IndexedDB 简易封装：用于存储大文本正文，避免 localStorage 空间限制

const DB_NAME = 'novel-reader-db';
const DB_VERSION = 1;
const STORE_CONTENT = 'bookContents';

export interface BookContentRecord {
  id: number; // bookId
  content: string; // 纯文本正文
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_CONTENT)) {
        db.createObjectStore(STORE_CONTENT, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveBookContentDB(id: number, content: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_CONTENT, 'readwrite');
    const store = tx.objectStore(STORE_CONTENT);
    const req = store.put({ id, content } as BookContentRecord);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function loadBookContentDB(id: number): Promise<string | undefined> {
  const db = await openDB();
  return await new Promise<string | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_CONTENT, 'readonly');
    const store = tx.objectStore(STORE_CONTENT);
    const req = store.get(id);
    req.onsuccess = () => {
      const record = req.result as BookContentRecord | undefined;
      resolve(record?.content);
    };
    req.onerror = () => reject(req.error);
  });
}
