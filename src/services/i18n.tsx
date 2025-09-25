import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { storageService } from '@/services/storage';

type Lang = 'zh-CN' | 'en-US';

type Messages = Record<string, string>;

const DEFAULT_LANG: Lang = 'zh-CN';

const zhCN: Messages = {
  app_welcome: '欢迎使用小说阅读器',
  app_select_menu: '选择左侧菜单开始阅读',
  library_title: '我的书架',
  library_search: '搜索书架中的图书',
  favorites_title: '我的收藏',
  favorites_search: '搜索收藏的图书',
  import_book: '导入图书',
  empty_library_title: '书架空空如也',
  empty_library_desc: '还没有添加任何图书，从书城导入或本地上传吧',
  empty_fav_title: '收藏夹空空如也',
  empty_fav_desc: '还没有收藏任何图书，从书架选择心仪的图书收藏吧',
  back_to_library: '返回书架',
};

const enUS: Messages = {
  app_welcome: 'Welcome to Novel Reader',
  app_select_menu: 'Choose from the left menu to start reading',
  library_title: 'My Library',
  library_search: 'Search books in library',
  favorites_title: 'My Favorites',
  favorites_search: 'Search favorites',
  import_book: 'Import Books',
  empty_library_title: 'Your shelf is empty',
  empty_library_desc: 'No books yet. Import from store or upload locally.',
  empty_fav_title: 'No favorites yet',
  empty_fav_desc: 'Pick some books from library and add to favorites.',
  back_to_library: 'Back to Library',
};

const LANGUAGE_KEY = 'novel-reader-lang';

function getSavedLangSync(): Lang {
  const s = storageService.loadSettings();
  const lang = s[LANGUAGE_KEY] as Lang | undefined;
  return lang ?? DEFAULT_LANG;
}

async function saveLang(lang: Lang) {
  const s = await storageService.loadSettingsAsync();
  s[LANGUAGE_KEY] = lang;
  await storageService.saveSettings(s);
}

const I18nContext = createContext<{
  lang: Lang;
  t: (key: string) => string;
  setLang: (lang: Lang) => void;
} | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // 先用同步缓存/默认值渲染，挂载后异步回填真实设置
  const [lang, setLangState] = useState<Lang>(getSavedLangSync());

  useEffect(() => {
    (async () => {
      const settings = await storageService.loadSettingsAsync();
      const l = (settings[LANGUAGE_KEY] as Lang | undefined) ?? DEFAULT_LANG;
      setLangState(l);
    })();
  }, []);

  const messages = useMemo(() => (lang === 'zh-CN' ? zhCN : enUS), [lang]);

  const t = useCallback((key: string) => messages[key] ?? key, [messages]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    saveLang(l);
  }, []);

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export type { Lang };

