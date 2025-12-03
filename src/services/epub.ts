import JSZip from 'jszip';
import type { Block } from '../types/block';
import type { ChapterMetadata } from '../types/book';

/**
 * EPUB 解析结果（包含 blocks 和章节元数据）
 */
export interface ParsedEpubContent {
  blocks: Block[]; // 扁平化的所有内容 blocks（h3、p、img 等）
  chapters: ChapterMetadata[]; // 章节元数据列表
}

/**
 * 将 Blob 转换为 Data URL
 */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * 解析相对路径（处理 ../ 和 ./）
 */
function resolvePath(basePath: string, relativePath: string): string {
  if (relativePath.startsWith('/')) {
    return relativePath.substring(1);
  }

  const baseDir = basePath.substring(0, basePath.lastIndexOf('/') + 1);
  const fullPath = baseDir + relativePath;
  const parts = fullPath.split('/');
  const resolved: string[] = [];

  for (const part of parts) {
    if (part === '' || part === '.') {
      continue;
    } else if (part === '..') {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }

  return resolved.join('/');
}

/**
 * 使用 DOMParser 解析 XML
 */
function parseXML(xmlString: string): Document {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(`XML 解析失败: ${parserError.textContent}`);
  }

  return doc;
}

/**
 * EPUB 元数据（包括封面）
 */
export interface EpubMetadata {
  title?: string;
  author?: string;
  cover?: string; // Data URL 格式的封面图片
}

/**
 * 提取 EPUB 文件的元数据（标题、作者、封面）
 */
export async function extractEpubMetadata(file: File): Promise<EpubMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  try {
    // 1. 读取 container.xml 找到 OPF 文件路径
    const containerXml = await zip.file('META-INF/container.xml')?.async('string');
    if (!containerXml) {
      throw new Error('无法找到 META-INF/container.xml');
    }

    const containerDoc = parseXML(containerXml);
    const rootfileNode = containerDoc.querySelector('rootfile');
    if (!rootfileNode) {
      throw new Error('container.xml 中找不到 rootfile');
    }

    const opfPath = rootfileNode.getAttribute('full-path');
    if (!opfPath) {
      throw new Error('rootfile 中找不到 full-path 属性');
    }

    // 2. 读取 OPF 文件
    const opfXml = await zip.file(opfPath)?.async('string');
    if (!opfXml) {
      throw new Error(`无法找到 OPF 文件: ${opfPath}`);
    }

    const opfDoc = parseXML(opfXml);
    const packageNode = opfDoc.querySelector('package');
    if (!packageNode) {
      throw new Error('OPF 文件中找不到 package 节点');
    }

    const metadata: EpubMetadata = {};

    // 3. 提取元数据（标题、作者）
    const metadataNode = packageNode.querySelector('metadata');
    if (metadataNode) {
      // EPUB 2.0 使用 <dc:title>
      const titleNode =
        metadataNode.querySelector('title') || metadataNode.querySelector('dc\\:title');
      if (titleNode) {
        metadata.title = titleNode.textContent?.trim();
      }

      // EPUB 2.0 使用 <dc:creator>
      const creatorNode =
        metadataNode.querySelector('creator') || metadataNode.querySelector('dc\\:creator');
      if (creatorNode) {
        metadata.author = creatorNode.textContent?.trim();
      }
    }

    // 4. 提取封面图片
    // 方法1: 查找 <meta name="cover" content="cover-image-id"/>
    const coverMeta = packageNode.querySelector('metadata meta[name="cover"]');
    let coverId: string | null = null;

    if (coverMeta) {
      coverId = coverMeta.getAttribute('content');
    } else {
      // 方法2: 查找 manifest 中 id 为 "cover-image" 或 "cover" 的项
      const manifestNode = packageNode.querySelector('manifest');
      if (manifestNode) {
        const coverItem = manifestNode.querySelector('item[id="cover-image"], item[id="cover"]');
        if (coverItem) {
          coverId = coverItem.getAttribute('id');
        }
      }
    }

    // 5. 如果有封面 ID，从 manifest 中获取路径并提取图片
    if (coverId) {
      const manifestNode = packageNode.querySelector('manifest');
      if (manifestNode) {
        const coverItem = manifestNode.querySelector(`item[id="${coverId}"]`);
        if (coverItem) {
          const coverHref = coverItem.getAttribute('href');
          const coverMediaType = coverItem.getAttribute('media-type');

          if (coverHref && coverMediaType?.startsWith('image/')) {
            const coverPath = resolvePath(opfPath, coverHref);
            const coverFile = zip.file(coverPath);

            if (coverFile) {
              try {
                const blob = await coverFile.async('blob');
                metadata.cover = await blobToDataURL(blob);
              } catch (err) {
                console.warn('[EPUB] 封面图片提取失败:', err);
              }
            }
          }
        }
      }
    }

    // 如果没找到封面，尝试查找第一个图片作为封面
    if (!metadata.cover) {
      const manifestNode = packageNode.querySelector('manifest');
      if (manifestNode) {
        const imageItems = manifestNode.querySelectorAll('item[media-type^="image/"]');
        for (const item of imageItems) {
          const href = item.getAttribute('href');
          const mediaType = item.getAttribute('media-type');

          if (href && mediaType?.startsWith('image/')) {
            const imagePath = resolvePath(opfPath, href);
            const imageFile = zip.file(imagePath);

            if (imageFile) {
              try {
                const blob = await imageFile.async('blob');
                metadata.cover = await blobToDataURL(blob);
                break; // 找到第一个图片就停止
              } catch (err) {
                console.warn('[EPUB] 图片提取失败:', err);
              }
            }
          }
        }
      }
    }

    return metadata;
  } catch (err) {
    console.error('[EPUB] 元数据提取失败:', err);
    return {};
  }
}

/**
 * TOC 条目接口
 */
interface TocEntry {
  title: string;
  href: string; // 可能包含锚点，如 "chapter1.xhtml#section1"
  order: number;
}

/**
 * 解析 EPUB 2.0 的 toc.ncx 文件
 */
async function parseTocNcx(
  zip: JSZip,
  opfPath: string,
  manifestMap: Map<string, { href: string; mediaType: string; path: string }>,
): Promise<TocEntry[]> {
  // 从 manifest 中查找 toc.ncx
  let ncxPath: string | null = null;
  for (const [, item] of manifestMap) {
    if (item.mediaType === 'application/x-dtbncx+xml' || item.href.endsWith('.ncx')) {
      ncxPath = item.path;
      break;
    }
  }

  if (!ncxPath) {
    return [];
  }

  try {
    const ncxXml = await zip.file(ncxPath)?.async('string');
    if (!ncxXml) {
      return [];
    }

    const ncxDoc = parseXML(ncxXml);
    const navPoints = ncxDoc.querySelectorAll('navPoint');
    const tocEntries: TocEntry[] = [];

    navPoints.forEach((navPoint, index) => {
      const navLabel = navPoint.querySelector('navLabel text');
      const content = navPoint.querySelector('content');

      if (navLabel && content) {
        const title = navLabel.textContent?.trim() || '';
        const href = content.getAttribute('src') || '';

        if (title && href) {
          tocEntries.push({
            title,
            href,
            order: index,
          });
        }
      }
    });

    return tocEntries;
  } catch (err) {
    console.warn('[EPUB] toc.ncx 解析失败:', err);
    return [];
  }
}

/**
 * 解析 EPUB 3.0 的 nav.xhtml 文件
 */
async function parseNavXhtml(
  zip: JSZip,
  opfPath: string,
  manifestMap: Map<string, { href: string; mediaType: string; path: string }>,
): Promise<TocEntry[]> {
  // 从 manifest 中查找 nav 文档
  let navPath: string | null = null;
  for (const [, item] of manifestMap) {
    if (
      item.mediaType === 'application/xhtml+xml' &&
      (item.href.includes('nav') || item.href.includes('toc'))
    ) {
      navPath = item.path;
      break;
    }
  }

  if (!navPath) {
    return [];
  }

  try {
    const navHtml = await zip.file(navPath)?.async('string');
    if (!navHtml) {
      return [];
    }

    const parser = new DOMParser();
    const navDoc = parser.parseFromString(navHtml, 'text/html');

    // 查找 <nav epub:type="toc"> 或 <nav role="doc-toc">
    const tocNav =
      navDoc.querySelector('nav[epub\\:type="toc"]') ||
      navDoc.querySelector('nav[role="doc-toc"]') ||
      navDoc.querySelector('nav');

    if (!tocNav) {
      return [];
    }

    const tocEntries: TocEntry[] = [];
    const links = tocNav.querySelectorAll('a[href]');

    links.forEach((link, index) => {
      const title = link.textContent?.trim() || '';
      const href = link.getAttribute('href') || '';

      if (title && href) {
        tocEntries.push({
          title,
          href,
          order: index,
        });
      }
    });

    return tocEntries;
  } catch (err) {
    console.warn('[EPUB] nav.xhtml 解析失败:', err);
    return [];
  }
}

/**
 * 从 TOC 条目中提取文件路径（去除锚点）
 */
function extractFilePathFromHref(href: string): string {
  // 去除锚点部分（#section1）
  const hashIndex = href.indexOf('#');
  return hashIndex >= 0 ? href.substring(0, hashIndex) : href;
}

/**
 * 使用 JSZip 解析 EPUB 文件为 Block 数组和章节元数据
 * EPUB 本质是一个 ZIP 文件，包含：
 * - META-INF/container.xml（指向 OPF 文件）
 * - OPF 文件（定义 manifest 和 spine）
 * - HTML 章节文件
 * - 图片等资源文件
 */
export async function parseEpubFileToBlocks(file: File): Promise<ParsedEpubContent> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const blocks: Block[] = [];
  const chapters: ChapterMetadata[] = [];
  const makeId = () => Math.random().toString(36).slice(2);

  try {
    // 1. 读取 container.xml 找到 OPF 文件路径
    const containerXml = await zip.file('META-INF/container.xml')?.async('string');
    if (!containerXml) {
      throw new Error('无法找到 META-INF/container.xml');
    }

    const containerDoc = parseXML(containerXml);
    const rootfileNode = containerDoc.querySelector('rootfile');
    if (!rootfileNode) {
      throw new Error('container.xml 中找不到 rootfile');
    }

    const opfPath = rootfileNode.getAttribute('full-path');
    if (!opfPath) {
      throw new Error('rootfile 中找不到 full-path 属性');
    }

    // 2. 读取 OPF 文件
    const opfXml = await zip.file(opfPath)?.async('string');
    if (!opfXml) {
      throw new Error(`无法找到 OPF 文件: ${opfPath}`);
    }

    const opfDoc = parseXML(opfXml);
    const packageNode = opfDoc.querySelector('package');
    if (!packageNode) {
      throw new Error('OPF 文件中找不到 package 节点');
    }

    // 3. 解析 manifest（所有资源）
    const manifestNode = packageNode.querySelector('manifest');
    if (!manifestNode) {
      throw new Error('OPF 文件中找不到 manifest 节点');
    }

    const manifestItems = manifestNode.querySelectorAll('item');
    const manifestMap = new Map<string, { href: string; mediaType: string; path: string }>();

    for (const item of manifestItems) {
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      const mediaType = item.getAttribute('media-type');

      if (id && href) {
        manifestMap.set(id, {
          href,
          mediaType: mediaType || '',
          path: resolvePath(opfPath, href),
        });
      }
    }

    // 4. 解析 TOC（目录）
    // 尝试解析 EPUB 3.0 的 nav.xhtml，如果失败则尝试 EPUB 2.0 的 toc.ncx
    let tocEntries = await parseNavXhtml(zip, opfPath, manifestMap);
    if (tocEntries.length === 0) {
      tocEntries = await parseTocNcx(zip, opfPath, manifestMap);
    }

    // 创建 TOC 映射：文件路径 -> 标题
    const tocMap = new Map<string, string>();
    for (const entry of tocEntries) {
      const filePath = extractFilePathFromHref(entry.href);
      const fullPath = resolvePath(opfPath, filePath);
      tocMap.set(fullPath, entry.title);
    }

    if (tocEntries.length > 0) {
      console.log(`[EPUB] 成功从 TOC 中提取 ${tocEntries.length} 个章节标题`);
    } else {
      console.log('[EPUB] 未找到 TOC，将从 HTML 中提取章节标题');
    }

    // 5. 解析 spine（章节顺序）
    const spineNode = packageNode.querySelector('spine');
    if (!spineNode) {
      throw new Error('OPF 文件中找不到 spine 节点');
    }

    const spineItems = spineNode.querySelectorAll('itemref');

    // 6. 遍历所有章节
    let chapterIndex = 0;
    for (const itemRef of spineItems) {
      const idref = itemRef.getAttribute('idref');
      if (!idref) continue;

      const manifestItem = manifestMap.get(idref);
      if (!manifestItem) {
        console.warn(`[EPUB] 找不到章节资源: ${idref}`);
        continue;
      }

      const chapterPath = manifestItem.path;
      const blockStartIndex = blocks.length; // 记录章节起始位置

      try {
        // 读取章节 HTML
        const chapterHtml = await zip.file(chapterPath)?.async('string');
        if (!chapterHtml) {
          console.warn(`[EPUB] 无法读取章节: ${chapterPath}`);
          continue;
        }

        // 解析 HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(chapterHtml, 'text/html');

        // 提取章节标题
        // 优先使用 TOC 中的标题，如果 TOC 不存在或没有对应条目，则回退到从 HTML 中提取
        let chapterTitle = tocMap.get(chapterPath) || ''; // 初始为空

        // 如果 TOC 中没有找到标题，尝试从 HTML 中提取
        if (!chapterTitle) {
          const titleElement = doc.querySelector('title');
          if (titleElement && titleElement.textContent?.trim()) {
            chapterTitle = titleElement.textContent.trim();
          } else {
            // 如果没有 title 元素，尝试从第一个 h1-h3 元素获取
            const headingElement = doc.querySelector('h1, h2, h3');
            if (headingElement && headingElement.textContent?.trim()) {
              chapterTitle = headingElement.textContent.trim();
            }
          }
        }

        // 如果仍然没有标题，使用默认标题
        if (!chapterTitle) {
          chapterTitle = `第 ${chapterIndex + 1} 章`;
          console.warn(`[EPUB] 章节 ${chapterPath} 缺少标题，使用默认标题: ${chapterTitle}`);
        }

        // 处理图片路径：将相对路径转换为 Data URL
        const processImages = async (element: Element): Promise<void> => {
          const imgs = element.querySelectorAll('img');
          for (const img of imgs) {
            const src = img.getAttribute('src');
            if (!src) continue;

            // 如果是绝对路径或 Data URL，直接使用
            if (/^(?:https?:|data:)/i.test(src)) {
              continue;
            }

            // 相对路径：解析为完整路径并从 ZIP 中读取
            const imagePath = resolvePath(chapterPath, src);

            try {
              const imageFile = zip.file(imagePath);
              if (!imageFile) {
                console.warn(`[EPUB] ZIP 中找不到图片: ${imagePath}`);
                // 保留图片元素但添加错误提示，而不是直接移除
                img.setAttribute('alt', img.getAttribute('alt') || '图片加载失败');
                img.setAttribute('title', '图片资源缺失');
                continue;
              }

              const blob = await imageFile.async('blob');
              const dataUrl = await blobToDataURL(blob);
              img.setAttribute('src', dataUrl);
            } catch (err) {
              console.warn(`[EPUB] 图片处理失败 [${imagePath}]:`, err);
              // 保留图片元素但添加错误提示
              img.setAttribute('alt', img.getAttribute('alt') || '图片加载失败');
              img.setAttribute('title', '图片处理失败');
            }
          }
        };

        // 处理所有图片
        await processImages(doc.body);

        // 处理内联样式中的背景图片等资源
        const processInlineStyles = async (element: Element): Promise<void> => {
          const elementsWithStyle = element.querySelectorAll('[style*="url("]');
          for (const el of elementsWithStyle) {
            const style = el.getAttribute('style');
            if (!style) continue;

            // 提取 url() 中的路径
            const urlMatches = style.match(/url\(['"]?([^'")]+)['"]?\)/gi);
            if (!urlMatches) continue;

            let newStyle = style;
            for (const urlMatch of urlMatches) {
              const pathMatch = urlMatch.match(/url\(['"]?([^'")]+)['"]?\)/i);
              if (!pathMatch) continue;

              const relativePath = pathMatch[1];
              if (/^(?:https?:|data:)/i.test(relativePath)) continue;

              const resourcePath = resolvePath(chapterPath, relativePath);
              try {
                const resourceFile = zip.file(resourcePath);
                if (resourceFile) {
                  const blob = await resourceFile.async('blob');
                  const dataUrl = await blobToDataURL(blob);
                  newStyle = newStyle.replace(pathMatch[0], `url("${dataUrl}")`);
                }
              } catch (err) {
                console.warn(`[EPUB] 资源处理失败 [${resourcePath}]:`, err);
              }
            }
            el.setAttribute('style', newStyle);
          }
        };

        await processInlineStyles(doc.body);

        // 提取主要内容元素，保留 HTML 格式
        // 优先查找 body > * 或 body > section > * 或 body > div > *
        const body = doc.body;
        if (!body) {
          console.warn(`[EPUB] 章节 HTML 中没有 body 元素: ${chapterPath}`);
          continue;
        }

        // 获取所有直接子元素或主要内容元素
        const contentElements = Array.from(body.children);

        // 如果没有直接子元素，尝试查找常见的内容容器
        if (contentElements.length === 0) {
          const sections = body.querySelectorAll('section, div, article');
          if (sections.length > 0) {
            contentElements.push(...Array.from(sections));
          }
        }

        // 如果还是没有，使用所有有内容的元素
        if (contentElements.length === 0) {
          const allElements = body.querySelectorAll(
            'p, h1, h2, h3, h4, h5, h6, div, span, blockquote, pre, ul, ol, li, table, tr, td, th',
          );
          contentElements.push(...Array.from(allElements));
        }

        // 按文档顺序处理元素，保留 HTML 格式
        const walkElements = (element: Element): void => {
          // 跳过非内容元素（meta、link、script、style、title 等）
          const nonContentTags = ['SCRIPT', 'STYLE', 'META', 'LINK', 'NOSCRIPT', 'HEAD', 'TITLE'];
          if (nonContentTags.includes(element.tagName)) {
            return;
          }

          // 检查是否是图片 - 创建独立的 image block
          if (element.tagName === 'IMG') {
            const img = element as HTMLImageElement;
            const src = img.getAttribute('src');
            if (src) {
              blocks.push({
                id: makeId(),
                type: 'image',
                src,
                alt: img.getAttribute('alt') || undefined,
              });
            }
            return;
          }

          // 检查是否是视频 - 创建独立的 video block
          if (element.tagName === 'VIDEO') {
            const video = element as HTMLVideoElement;
            const src = video.getAttribute('src');
            if (src) {
              blocks.push({
                id: makeId(),
                type: 'video',
                src,
                poster: video.getAttribute('poster') || undefined,
              });
            }
            return;
          }

          // 检查是否有文本内容
          const textContent = element.textContent?.trim();
          const hasText = textContent && textContent.length > 0;

          // 检查是否有子元素（非文本节点）
          const hasChildElements = Array.from(element.children).length > 0;

          // 内容块级元素标签列表 - 这些元素应该创建独立的 blocks
          const contentBlockTags = [
            'P',
            'H1',
            'H2',
            'H3',
            'H4',
            'H5',
            'H6',
            'BLOCKQUOTE',
            'PRE',
            'LI',
            'TD',
            'TH',
          ];

          // 容器元素标签列表 - 这些元素应该递归处理子元素
          const containerTags = [
            'DIV',
            'SECTION',
            'ARTICLE',
            'HEADER',
            'FOOTER',
            'ASIDE',
            'NAV',
            'UL',
            'OL',
            'TABLE',
            'TBODY',
            'THEAD',
            'TR',
          ];

          // 如果是内容块级元素（h3、p 等），创建独立的 block
          if (contentBlockTags.includes(element.tagName)) {
            const html = element.innerHTML.trim();
            if (html && hasText) {
              blocks.push({
                id: makeId(),
                type: 'html',
                html,
                tag: element.tagName.toLowerCase(),
              });
              return; // 不处理子元素，避免重复
            }
          }

          // 如果是容器元素，递归处理所有子元素
          if (containerTags.includes(element.tagName) || hasChildElements) {
            for (const child of Array.from(element.children)) {
              walkElements(child);
            }
          } else if (hasText) {
            // 叶子节点且有文本，包装成 HTML block
            const html = element.innerHTML.trim();
            if (html) {
              blocks.push({
                id: makeId(),
                type: 'html',
                html,
                tag: element.tagName.toLowerCase(),
              });
            }
          }
        };

        // 遍历内容元素
        for (const element of contentElements) {
          walkElements(element);
        }

        // 如果没有提取到任何内容，尝试提取所有段落
        const blockStartForThisChapter = blockStartIndex;
        if (blocks.length === blockStartForThisChapter) {
          const paragraphs = body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span');
          for (const p of paragraphs) {
            const html = p.innerHTML.trim();
            const text = p.textContent?.trim();
            if (html && text) {
              blocks.push({
                id: makeId(),
                type: 'html',
                html,
                tag: p.tagName.toLowerCase(),
              });
            }
          }
        }

        // 记录章节结束位置并创建章节元数据
        const blockEndIndex = blocks.length;

        // 检查章节内容是否为空
        if (blockStartIndex === blockEndIndex) {
          console.warn(`[EPUB] 章节 ${chapterPath} 内容为空`);
          // 即使内容为空，也创建章节元数据，以便用户可以看到章节存在
        }

        chapters.push({
          id: idref,
          title: chapterTitle,
          index: chapterIndex,
          blockStartIndex,
          blockEndIndex,
        });

        chapterIndex++;
      } catch (err) {
        console.error(`[EPUB] 章节解析失败 [${chapterPath}]:`, err);
        // 即使解析失败，也创建章节元数据（但可能没有 blocks）
        const blockEndIndex = blocks.length;
        const errorTitle = `第 ${chapterIndex + 1} 章 (解析失败)`;
        chapters.push({
          id: idref,
          title: errorTitle,
          index: chapterIndex,
          blockStartIndex,
          blockEndIndex,
        });
        chapterIndex++;
        // 显示友好的错误提示
        console.warn(`[EPUB] 已跳过解析失败的章节，章节标题: ${errorTitle}`);
      }
    }

    // 如果没有解析到任何内容，提供友好的错误提示
    if (blocks.length === 0) {
      console.warn('[EPUB] 未能从 EPUB 文件中提取任何内容');
      throw new Error('EPUB 文件可能为空或格式不正确，未能提取到任何可读内容');
    }

    console.log(`[EPUB] 解析完成: ${chapters.length} 个章节, ${blocks.length} 个内容块`);
    return { blocks, chapters };
  } catch (err) {
    console.error('[EPUB] EPUB 解析失败:', err);

    // 提供更友好的错误消息
    if (err instanceof Error) {
      // 如果是我们自己抛出的错误，直接传递
      if (err.message.includes('EPUB 文件可能为空')) {
        throw err;
      }
      // 否则，包装成更友好的错误消息
      throw new Error(`EPUB 文件解析失败: ${err.message}`);
    }

    throw new Error('EPUB 文件解析失败，请确保文件格式正确且未损坏');
  }
}

