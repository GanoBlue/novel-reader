// IndexedDB 存储服务
// 简化的存储架构

class IndexedDBStorage {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDatabase();
  }

  private initDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const dbOpen = indexedDB.open('novel-reader', 1);

      dbOpen.addEventListener('success', () => {
        resolve(dbOpen.result);
      });

      dbOpen.addEventListener('upgradeneeded', () => {
        const db = dbOpen.result;

        // 创建对象存储
        if (!db.objectStoreNames.contains('books')) {
          // 书籍基础信息和进度存储
          db.createObjectStore('books', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('bookContents')) {
          // 书籍内容单独存储
          db.createObjectStore('bookContents', { keyPath: 'bookId' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          // 应用设置存储
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      });

      dbOpen.addEventListener('error', () => {
        console.error('Failed to open IndexedDB');
        reject(dbOpen.error);
      });
    });
  }

  // ========== 书籍存储 ==========
  // 保存书籍基础信息和进度
  async saveBook(book: any) {
    const db = await this.dbPromise;
    const transaction = db.transaction(['books'], 'readwrite');
    const store = transaction.objectStore('books');

    return new Promise<void>((resolve, reject) => {
      const request = store.put(book);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 获取单本书籍
  async getBook(bookId: number) {
    const db = await this.dbPromise;
    const transaction = db.transaction(['books'], 'readonly');
    const store = transaction.objectStore('books');

    return new Promise<any>((resolve, reject) => {
      const request = store.get(bookId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 获取所有书籍
  async getAllBooks() {
    const db = await this.dbPromise;
    const transaction = db.transaction(['books'], 'readonly');
    const store = transaction.objectStore('books');

    return new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // 删除书籍
  async deleteBook(bookId: number) {
    const db = await this.dbPromise;
    const transaction = db.transaction(['books'], 'readwrite');
    const store = transaction.objectStore('books');

    return new Promise<void>((resolve, reject) => {
      const request = store.delete(bookId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ========== 书籍内容存储 ==========
  // 保存书籍内容
  async saveBookContent(bookId: number, content: string) {
    const db = await this.dbPromise;
    const transaction = db.transaction(['bookContents'], 'readwrite');
    const store = transaction.objectStore('bookContents');

    const contentData = {
      bookId,
      content,
      savedAt: new Date().toISOString(),
      size: content.length,
    };

    return new Promise<void>((resolve, reject) => {
      const request = store.put(contentData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 获取书籍内容
  async getBookContent(bookId: number) {
    const db = await this.dbPromise;
    const transaction = db.transaction(['bookContents'], 'readonly');
    const store = transaction.objectStore('bookContents');

    return new Promise<string | undefined>((resolve, reject) => {
      const request = store.get(bookId);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.content);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 删除书籍内容
  async deleteBookContent(bookId: number) {
    const db = await this.dbPromise;
    const transaction = db.transaction(['bookContents'], 'readwrite');
    const store = transaction.objectStore('bookContents');

    return new Promise<void>((resolve, reject) => {
      const request = store.delete(bookId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ========== 设置存储 ==========
  // 保存设置
  async saveSetting(key: string, value: any) {
    const db = await this.dbPromise;
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');

    return new Promise<void>((resolve, reject) => {
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 获取设置
  async getSetting(key: string) {
    const db = await this.dbPromise;
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');

    return new Promise<any>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.value);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 获取所有设置
  async getAllSettings() {
    const db = await this.dbPromise;
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');

    return new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }
}

// 创建全局存储实例
const storage = new IndexedDBStorage();

export default storage;

