// 配置管理服务
// 借鉴 reader 项目的配置系统，支持监听机制

import storage from './storage';

interface ConfigListener {
  name: string;
  listener: (value: any) => void;
}

class ConfigManager {
  private listeners: ConfigListener[] = [];

  // 获取配置
  async get<T>(name: string, defaultValue?: T): Promise<T> {
    try {
      const value = await storage.getSetting(name);
      return value ?? defaultValue;
    } catch (error) {
      console.error(`Failed to get config ${name}:`, error);
      return defaultValue;
    }
  }

  // 设置配置
  async set<T>(name: string, value: T): Promise<T> {
    try {
      await storage.saveSetting(name, value);

      // 异步通知监听器
      Promise.resolve().then(() => {
        this.listeners.forEach((listener) => {
          if (listener.name === name) {
            listener.listener(value);
          }
        });
      });

      return value;
    } catch (error) {
      console.error(`Failed to set config ${name}:`, error);
      throw error;
    }
  }

  // 添加配置监听器
  addListener(name: string, listener: (value: any) => void): void {
    const existingIndex = this.findListener(name, listener);
    if (existingIndex === -1) {
      this.listeners.push({ name, listener });
    }
  }

  // 移除配置监听器
  removeListener(name: string, listener: (value: any) => void): void {
    const index = this.findListener(name, listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  // 查找监听器
  private findListener(name: string, listener: (value: any) => void): number {
    return this.listeners.findIndex((item) => item.name === name && item.listener === listener);
  }

  // 批量获取配置
  async getBatch<T extends Record<string, any>>(configs: T, defaults: Partial<T> = {}): Promise<T> {
    const result = {} as T;

    for (const [key, defaultValue] of Object.entries(configs)) {
      result[key as keyof T] = await this.get(key, defaultValue ?? defaults[key]);
    }

    return result;
  }

  // 批量设置配置
  async setBatch<T extends Record<string, any>>(configs: T): Promise<void> {
    const promises = Object.entries(configs).map(([key, value]) => this.set(key, value));

    await Promise.all(promises);
  }

  // 重置配置
  async reset(name: string): Promise<void> {
    try {
      // 使用新的存储API删除设置
      const db = await storage['dbPromise'];
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');

      return new Promise<void>((resolve, reject) => {
        const request = store.delete(name);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Failed to reset config ${name}:`, error);
      throw error;
    }
  }

  // 获取所有配置
  async getAll(): Promise<Record<string, any>> {
    try {
      const settings = await storage.getAllSettings();
      const result: Record<string, any> = {};
      settings.forEach((item: any) => {
        result[item.key] = item.value;
      });
      return result;
    } catch (error) {
      console.error('Failed to get all configs:', error);
      return {};
    }
  }
}

// 创建全局配置管理器实例
const config = new ConfigManager();

export default config;
