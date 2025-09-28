import { ReactNode, cloneElement, isValidElement, ReactElement } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTextOverflow } from '@/hooks/use-text-overflow';
import { cn } from '@/lib/utils';

interface TextWithTooltipProps {
  text: string;
  children: ReactNode;
  className?: string;
  tooltipContent?: string;
  maxWidth?: string;
}

/**
 * 带溢出检测的文本组件
 * 内部管理溢出检测逻辑，当文本溢出时显示 tooltip
 */
export function TextWithTooltip({
  text,
  children,
  className,
  tooltipContent,
  maxWidth = 'max-w-full',
}: TextWithTooltipProps) {
  // 内部使用溢出检测 hook
  const [overflow, ref] = useTextOverflow(text);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {
            // 如果 children 是合法的 React 元素，则克隆一份并在其上注入 ref 与合并后的 className
            // 说明：
            // - isValidElement(children): 仅当 children 是 ReactElement 才能被 cloneElement 处理
            // - cloneElement: 在不改变原元素类型的前提下，追加/覆盖 props（这里注入 ref 与 className）
            // - asChild: TooltipTrigger 会把触发行为委托给子元素本身
            // - ref: 绑定到实际文本元素上，用于溢出检测（useTextOverflow）
            // - className 合并策略：
            //    1) 'truncate'：单行溢出省略号
            //    2) maxWidth（外部可控）：限制最大宽度以触发溢出
            //    3) (children.props as any).className：保留原有子元素的类名
            //    4) className：允许调用方再追加类名
            isValidElement(children)
              ? cloneElement(children as ReactElement<{ className?: string; ref?: any }>, {
                  ref,
                  className: cn('truncate', maxWidth, (children.props as any).className, className),
                })
              : children
          }
        </TooltipTrigger>
        {overflow && (
          <TooltipContent>
            {/* 当检测到文本溢出时，展示 tooltip；优先使用 tooltipContent，否则回退显示原始 text */}
            <p className="max-w-xs break-words">{tooltipContent || text}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

