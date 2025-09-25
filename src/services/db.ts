// IndexedDB 简易封装
// 1) bookContents：存储大文本正文，避免 localStorage 空间限制
// 2) books：存储书籍元数据，实现与正文一致的本地持久化

const DB_NAME = 'novel-reader-db';
const DB_VERSION = 1;
const STORE_CONTENT = 'bookContents';
const STORE_BOOKS = 'books';
const STORE_SETTINGS = 'settings';

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
      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        // 以书籍 id 作为主键，存放元数据（标题/作者/进度等）
        db.createObjectStore(STORE_BOOKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        // settings 使用 key/value 结构
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
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

// 书籍元数据类型（与 store/book-store.ts 的 Book 对齐）
export interface BookMetaRecord {
  id: number;
  title: string;
  author: string;
  cover: string;
  currentChapter: number;
  totalChapters: number;
  progress: number;
  lastRead?: string;
  totalTime?: number;
  readCount?: number;
  favoriteDate?: string;
  isFavorite?: boolean;
}

// 批量保存书籍元数据（全量覆盖）：
// - 简化逻辑：先清空再写入当前内存中的完整书架
export async function saveBooksListDB(books: BookMetaRecord[]): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_BOOKS, 'readwrite');
    const store = tx.objectStore(STORE_BOOKS);
    // 清空旧数据
    const clearReq = store.clear();
    clearReq.onerror = () => reject(clearReq.error);
    clearReq.onsuccess = () => {
      // 逐条写入
      for (const b of books) {
        store.put(b);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// 读取全部书籍元数据
export async function loadBooksListDB(): Promise<BookMetaRecord[]> {
  const db = await openDB();
  return await new Promise<BookMetaRecord[]>((resolve, reject) => {
    const tx = db.transaction(STORE_BOOKS, 'readonly');
    const store = tx.objectStore(STORE_BOOKS);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as BookMetaRecord[]) || []);
    req.onerror = () => reject(req.error);
  });
}

// 应用设置存取（键值对）
export async function saveSettingsDB(settings: Record<string, unknown>): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_SETTINGS, 'readwrite');
    const store = tx.objectStore(STORE_SETTINGS);
    const clearReq = store.clear();
    clearReq.onerror = () => reject(clearReq.error);
    clearReq.onsuccess = () => {
      for (const [key, value] of Object.entries(settings)) {
        store.put({ key, value });
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadSettingsDB(): Promise<Record<string, unknown>> {
  const db = await openDB();
  return await new Promise<Record<string, unknown>>((resolve, reject) => {
    const tx = db.transaction(STORE_SETTINGS, 'readonly');
    const store = tx.objectStore(STORE_SETTINGS);
    const req = store.getAll();
    req.onsuccess = () => {
      const all = (req.result as Array<{ key: string; value: unknown }>) || [];
      const obj: Record<string, unknown> = {};
      for (const row of all) obj[row.key] = row.value;
      resolve(obj);
    };
    req.onerror = () => reject(req.error);
  });
}

