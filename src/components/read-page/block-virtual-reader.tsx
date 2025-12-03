import { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type { ReadingSettings } from '@/types/reading';
import type { Block } from '@/types/block';

interface BlockVirtualReaderProps {
  blocks: Block[];
  currentIndex: number;
  settings: ReadingSettings;
  onRangeChanged: (range: { startIndex: number; endIndex: number }) => void;
}

export interface BlockVirtualReaderRef {
  scrollToProgress: (progress: number) => void;
  scrollToIndex: (index: number) => void;
}

const BlockVirtualReader = forwardRef<BlockVirtualReaderRef, BlockVirtualReaderProps>(
  ({ blocks, currentIndex, settings, onRangeChanged }, ref) => {
    const virtuosoRef = useRef<any>(null);

    const handleProgressChange = useCallback(
      (progress: number) => {
        if (!virtuosoRef.current || !blocks.length) return;
        const targetIndex = Math.floor((progress / 100) * blocks.length);
        const clampedIndex = Math.max(0, Math.min(targetIndex, blocks.length - 1));
        virtuosoRef.current.scrollToIndex({
          index: clampedIndex,
          align: 'start',
          behavior: 'auto',
        });
      },
      [blocks.length],
    );

    const handleScrollToIndex = useCallback(
      (index: number) => {
        if (!virtuosoRef.current || !blocks.length) return;
        const clampedIndex = Math.max(0, Math.min(index, blocks.length - 1));
        virtuosoRef.current.scrollToIndex({
          index: clampedIndex,
          align: 'start',
          behavior: 'auto',
        });
      },
      [blocks.length],
    );

    useImperativeHandle(
      ref,
      () => ({
        scrollToProgress: handleProgressChange,
        scrollToIndex: handleScrollToIndex,
      }),
      [handleProgressChange, handleScrollToIndex],
    );

    const handleRangeChangedCb = useCallback(
      (range: { startIndex: number; endIndex: number }) => {
        onRangeChanged(range);
      },
      [onRangeChanged],
    );

    const computeItemKey = useCallback(
      (index: number) => blocks[index]?.id || `block-${index}`,
      [blocks],
    );

    const renderBlock = useCallback(
      (index: number) => {
        const block = blocks[index];
        if (!block) return null;

        switch (block.type) {
          case 'paragraph':
            return (
              <div className="reading-content">
                <p
                  className="whitespace-pre-wrap"
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: settings.lineHeight,
                    textAlign: settings.textAlign,
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    minHeight: `${(settings.fontSize || 16) * (settings.lineHeight || 1.5)}px`,
                  }}
                >
                  {block.text || '\u00A0'}
                </p>
              </div>
            );
          case 'html': {
            // EPUB 格式：使用原生标签，不应用外置样式，只保留 EPUB 自带的样式
            const Tag = (block.tag || 'div') as keyof React.JSX.IntrinsicElements;

            // 包裹在 epub-html-content 容器中，使 CSS 样式生效
            return (
              <div className="epub-html-content">
                <Tag data-block-id={block.id} dangerouslySetInnerHTML={{ __html: block.html }} />
              </div>
            );
          }
          case 'image':
            return (
              <div
                style={{
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                }}
              >
                <img
                  src={block.src}
                  alt={block.alt || ''}
                  className="max-w-full h-auto mx-auto"
                  loading="lazy"
                />
              </div>
            );
          case 'video':
            return (
              <div
                style={{
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                }}
              >
                <video
                  src={block.src}
                  poster={block.poster}
                  controls
                  className="w-full h-auto"
                  preload="metadata"
                />
              </div>
            );
          case 'embed':
            return (
              <div
                style={{
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                }}
              >
                {/* 占位：未来可根据 component 渲染自定义组件 */}
                <div className="text-xs text-muted-foreground">未实现的嵌入：{block.component}</div>
              </div>
            );
        }
      },
      [blocks, settings],
    );

    return (
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: '100%', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="[&::-webkit-scrollbar]:hidden"
        totalCount={blocks.length}
        itemContent={renderBlock}
        computeItemKey={computeItemKey}
        defaultItemHeight={(settings.fontSize || 16) * (settings.lineHeight || 1.5)}
        // 较小的 overscan，减少累积误差
        overscan={300}
        increaseViewportBy={40}
        alignToBottom={false}
        rangeChanged={handleRangeChangedCb}
        initialTopMostItemIndex={Math.max(0, currentIndex)}
      />
    );
  },
);

BlockVirtualReader.displayName = 'BlockVirtualReader';

export default BlockVirtualReader;

