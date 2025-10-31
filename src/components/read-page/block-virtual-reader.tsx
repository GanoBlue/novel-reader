import React, { useRef, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
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

    useImperativeHandle(
      ref,
      () => ({
        scrollToProgress: handleProgressChange,
      }),
      [handleProgressChange],
    );

    const handleRangeChangedCb = useCallback(
      (range: { startIndex: number; endIndex: number }) => {
        onRangeChanged(range);
      },
      [onRangeChanged],
    );

    const renderBlock = useCallback(
      (index: number) => {
        const block = blocks[index];
        if (!block) return null;

        switch (block.type) {
          case 'paragraph':
            return (
              <div className="px-4 py-2 reading-content">
                <p
                  className="mb-4 whitespace-pre-wrap"
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: settings.lineHeight,
                    textAlign: settings.textAlign,
                    minHeight: `${settings.fontSize * settings.lineHeight}px`,
                  }}
                >
                  {block.text || '\u00A0'}
                </p>
              </div>
            );
          case 'html':
            // 使用 div 包装 HTML 内容，应用样式和格式
            return (
              <div className="px-4 py-2 reading-content">
                <div
                  className="mb-4 epub-html-content"
                  data-block-id={block.id}
                  data-original-tag={block.tag}
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: settings.lineHeight,
                    textAlign: settings.textAlign,
                    minHeight: `${settings.fontSize * settings.lineHeight}px`,
                  }}
                  dangerouslySetInnerHTML={{ __html: block.html }}
                />
              </div>
            );
          case 'image':
            return (
              <div className="px-4 py-3">
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
              <div className="px-4 py-3">
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
              <div className="px-4 py-3">
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
        // 使用可变高度模式，不设置 fixedItemHeight
        // Virtuoso 会自动测量每个项目的高度
        overscan={3}
        increaseViewportBy={100}
        alignToBottom={false}
        rangeChanged={handleRangeChangedCb}
        initialTopMostItemIndex={Math.max(0, currentIndex)}
      />
    );
  },
);

BlockVirtualReader.displayName = 'BlockVirtualReader';

export default BlockVirtualReader;

