// 导入 React 提供的状态、生命周期、副作用与引用相关的 Hook 以及 Ref 类型
import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * 检测文本是否溢出的自定义 Hook
 * @param text 要检测的文本内容
 * @returns [overflow, ref] - 溢出状态和元素引用
 */
export function useTextOverflow<T extends HTMLElement = HTMLElement>(
  // 需要监听并用于重新计算溢出的文本内容
  text: string,
): [boolean, RefObject<T>] {
  // 控制是否溢出的布尔状态，初始为不溢出
  const [overflow, setOverflow] = useState(false);
  // 绑定到目标 DOM 元素的引用，用于读取尺寸信息
  const ref = useRef<T>(null);

  // 检查文本是否溢出
  const checkOverflow = (element: T | null): boolean => {
    // 若元素不存在，视为不溢出
    if (!element) return false;
    // 横向或纵向任一方向内容尺寸超过可视尺寸则视为溢出
    return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
  };

  // 监听文本变化，重新检测溢出
  useEffect(() => {
    // 当引用已绑定到实际元素后，基于当前元素尺寸计算是否溢出
    if (ref.current) {
      setOverflow(checkOverflow(ref.current));
    }
  }, [text]);

  // 监听窗口尺寸变化，进行溢出重算（覆盖全局缩放、视口变化场景）
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (ref.current) {
  //       setOverflow(checkOverflow(ref.current));
  //     }
  //   };

  //   window.addEventListener('resize', handleResize);
  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []);

  // 使用 ResizeObserver 监听元素自身尺寸变化（更精确，覆盖容器布局/样式变动）
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return;

    const element = ref.current;
    const observer = new ResizeObserver(() => {
      setOverflow(checkOverflow(element));
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref.current]);

  // 返回溢出结果与元素引用，供调用方解构使用
  return [overflow, ref];
}
