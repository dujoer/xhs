
export type AspectRatio = '3:4' | '9:16' | 'custom';

export type FontFamily = 'serif' | 'sans' | 'mashan' | 'xiaowei' | 'longcang' | 'huangyou' | 'kuaile' | 'maocao' | 'zhimang';

export interface ColorPalette {
  name: string;
  bg: string;
  text: string;
  accent?: string;
}

export interface PosterConfig {
  title: string;
  content: string;
  author?: string;
  themeColor: string;
  textColor: string;
  fontSize: number;
  titleFontSize: number;
  metadataFontSize: number;
  lineHeight: number;
  paragraphGap: number;
  useIndentation: boolean;
  aspectRatio: AspectRatio;
  customWidth: number;
  customHeight: number;
  fontFamily: FontFamily;
}

export interface LayoutPreset {
  id: string;
  name: string;
  category?: string;
  config: Omit<PosterConfig, 'title' | 'content' | 'author'>;
}

export interface PageData {
  index: number;
  isFirst: boolean;
  title?: string;
  author?: string;
  content: string;
  wordCount: number;
  readingTime: number;
}
