import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type { ReadingSettings } from '@/types/reading';

interface VirtualReaderProps {
  paragraphs: string[];
  currentIndex: number;
  settings: ReadingSettings;
  onRangeChanged: (range: { startIndex: number; endIndex: number }) => void;
}

export interface VirtualReaderRef {
  scrollToProgress: (progress: number) => void;
}

const VirtualReader = forwardRef<VirtualReaderRef, VirtualReaderProps>(
  ({ paragraphs, currentIndex, settings, onRangeChanged }, ref) => {
    const virtuosoRef = useRef<any>(null);

    // 处理进度条变化（跳转到指定位置）
    const handleProgressChange = useCallback(
      (progress: number) => {
        if (!virtuosoRef.current || !paragraphs.length) return;

        // 计算目标段落索引
        const targetIndex = Math.floor((progress / 100) * paragraphs.length);
        const clampedIndex = Math.max(0, Math.min(targetIndex, paragraphs.length - 1));

        // 跳转到目标位置
        virtuosoRef.current.scrollToIndex({
          index: clampedIndex,
          align: 'start',
          behavior: 'auto',
        });
      },
      [paragraphs.length],
    );

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        scrollToProgress: handleProgressChange,
      }),
      [handleProgressChange],
    );

    // 处理范围变化
    const handleRangeChanged = useCallback(
      (range: { startIndex: number; endIndex: number }) => {
        // 更新可见区域开始索引
        onRangeChanged(range);
      },
      [onRangeChanged],
    );

    // 渲染段落内容
    const renderParagraph = useCallback(
      (index: number) => {
        const line = paragraphs[index];
        return (
          <div className="px-4 py-2 reading-content" style={{ minHeight: '3rem' }}>
            <p
              className="mb-4 whitespace-pre-wrap"
              style={{
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
                textAlign: settings.textAlign,
              }}
            >
              {line || '\u00A0'} {/* 非断行空格，保持空行 */}
            </p>
          </div>
        );
      },
      [paragraphs, settings],
    );

    return (
      <Virtuoso
        ref={virtuosoRef}
        style={{
          height: '100%', // 占满父容器
          // 隐藏滚动条
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
        className="[&::-webkit-scrollbar]:hidden" // Chrome/Safari
        totalCount={paragraphs.length}
        itemContent={renderParagraph}
        // 使用固定高度提高滚动条精度
        fixedItemHeight={48}
        // 虚拟列表性能配置（优化滚动顺滑度）
        overscan={5} // 预渲染项目，减少初始位置偏移
        increaseViewportBy={50} // 视口扩展，减少初始位置偏移
        alignToBottom={false} // 不底部对齐，保持正常阅读体验
        // 使用 rangeChanged 事件，更准确地反映用户阅读位置
        rangeChanged={handleRangeChanged}
        // 初始位置恢复，不知道为什么，Virtuoso的initialTopMostItemIndex会偏移2-3个位置
        initialTopMostItemIndex={currentIndex + 2}
      />
    );
  },
);

VirtualReader.displayName = 'VirtualReader';

export default VirtualReader;
