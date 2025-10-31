export type ParagraphBlock = {
  id: string;
  type: 'paragraph';
  text: string; // 纯文本，已清洗
};

export type HtmlBlock = {
  id: string;
  type: 'html';
  html: string; // HTML 内容，保留格式
  tag?: string; // 原始标签名（如 p, h1, h2, div 等）
};

export type ImageBlock = {
  id: string;
  type: 'image';
  src: string;
  alt?: string;
};

export type VideoBlock = {
  id: string;
  type: 'video';
  src: string;
  poster?: string;
};

export type EmbedBlock = {
  id: string;
  type: 'embed';
  component: string; // 未来用于自定义组件标识
  props?: Record<string, unknown>;
};

export type Block = ParagraphBlock | HtmlBlock | ImageBlock | VideoBlock | EmbedBlock;

