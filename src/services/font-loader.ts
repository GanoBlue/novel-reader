/**
 * 字体按需加载服务
 * 只在用户选择字体时才加载对应的字体文件
 */

// 已加载的字体集合
const loadedFonts = new Set<string>();

// 字体 CDN 映射（使用国内可访问的镜像）
const fontCDNMap: { [key: string]: string } = {
  // 中文字体
  'Noto Sans SC':
    'https://fonts.loli.net/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap',
  'Noto Serif SC':
    'https://fonts.loli.net/css2?family=Noto+Serif+SC:wght@300;400;500;700&display=swap',
  'Ma Shan Zheng': 'https://fonts.loli.net/css2?family=Ma+Shan+Zheng&display=swap',
  'ZCOOL XiaoWei': 'https://fonts.loli.net/css2?family=ZCOOL+XiaoWei&display=swap',
  'ZCOOL QingKe HuangYou': 'https://fonts.loli.net/css2?family=ZCOOL+QingKe+HuangYou&display=swap',
  'Long Cang': 'https://fonts.loli.net/css2?family=Long+Cang&display=swap',
  'Liu Jian Mao Cao': 'https://fonts.loli.net/css2?family=Liu+Jian+Mao+Cao&display=swap',
  'Zhi Mang Xing': 'https://fonts.loli.net/css2?family=Zhi+Mang+Xing&display=swap',

  // 英文字体
  Merriweather: 'https://fonts.loli.net/css2?family=Merriweather:wght@300;400;700&display=swap',
  Lora: 'https://fonts.loli.net/css2?family=Lora:wght@400;500;700&display=swap',
  'Crimson Text': 'https://fonts.loli.net/css2?family=Crimson+Text:wght@400;600;700&display=swap',
  'Playfair Display':
    'https://fonts.loli.net/css2?family=Playfair+Display:wght@400;500;700&display=swap',
  'EB Garamond': 'https://fonts.loli.net/css2?family=EB+Garamond:wght@400;500;700&display=swap',
  'Libre Baskerville':
    'https://fonts.loli.net/css2?family=Libre+Baskerville:wght@400;700&display=swap',
};

/**
 * 从字体族字符串中提取第一个字体名称
 */
function extractFirstFontName(fontFamily: string): string {
  const fonts = fontFamily.split(',').map((f) => f.trim().replace(/['"]/g, ''));
  return fonts[0] || '';
}

/**
 * 按需加载字体
 * @param fontFamily 字体族字符串
 */
export async function loadFontOnDemand(fontFamily: string): Promise<void> {
  const fontName = extractFirstFontName(fontFamily);

  // 如果已经加载过，直接返回
  if (loadedFonts.has(fontName)) {
    return;
  }

  // 检查是否需要从 CDN 加载
  const cdnUrl = fontCDNMap[fontName];
  if (!cdnUrl) {
    // 系统字体或不需要加载的字体
    loadedFonts.add(fontName);
    return;
  }

  try {
    // 创建 link 元素加载字体
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cdnUrl;

    // 等待字体 CSS 加载完成
    await new Promise<void>((resolve, reject) => {
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load font: ${fontName}`));
      document.head.appendChild(link);
    });

    // 使用 Font Loading API 确保字体真正加载
    if ('fonts' in document) {
      try {
        // 加载字体的不同字重
        await Promise.all([
          document.fonts.load(`400 16px "${fontName}"`),
          document.fonts.load(`500 16px "${fontName}"`),
          document.fonts.load(`700 16px "${fontName}"`),
        ]);
      } catch (err) {
        // Font Loading API 失败不影响整体流程
        console.warn(`[FontLoader] Font Loading API 失败: ${fontName}`, err);
      }
    }

    loadedFonts.add(fontName);
    console.log(`[FontLoader] 字体加载成功: ${fontName}`);
  } catch (error) {
    console.warn(`[FontLoader] 字体加载失败: ${fontName}`, error);
    // 即使加载失败也标记为已尝试，避免重复加载
    loadedFonts.add(fontName);
  }
}

/**
 * 预加载所有 Web Fonts
 * 在后台静默加载，不阻塞页面渲染
 * 使用并行加载提高效率
 */
export function preloadAllFonts(): void {
  // 使用 requestIdleCallback 在浏览器空闲时加载
  const loadFonts = () => {
    const fontsToPreload = Object.keys(fontCDNMap);

    // 并行加载所有字体，浏览器会自动管理并发
    Promise.all(
      fontsToPreload.map((fontName) =>
        loadFontOnDemand(fontName).catch((err) => {
          // 静默失败，不影响其他字体加载
          console.warn(`[FontLoader] 预加载字体失败: ${fontName}`, err);
        }),
      ),
    ).then(() => {
      console.log('[FontLoader] 所有字体预加载完成');
    });
  };

  // 使用 requestIdleCallback 或 setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadFonts, { timeout: 2000 });
  } else {
    setTimeout(loadFonts, 1000);
  }
}

/**
 * 预加载常用字体
 */
export function preloadCommonFonts(): void {
  // 预加载最常用的字体
  const commonFonts = ['Noto Sans SC', 'Noto Serif SC'];

  commonFonts.forEach((fontName, index) => {
    setTimeout(() => {
      loadFontOnDemand(fontName).catch((err) => {
        console.warn(`[FontLoader] 预加载常用字体失败: ${fontName}`, err);
      });
    }, index * 300);
  });
}

/**
 * 检查字体是否已加载
 */
export function isFontLoaded(fontFamily: string): boolean {
  const fontName = extractFirstFontName(fontFamily);
  return loadedFonts.has(fontName);
}

