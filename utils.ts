
import { AspectRatio, PosterConfig } from './types';

export const countWords = (text: string): number => {
  if (!text) return 0;
  // 统计时排除格式化标记字符
  const cleanText = text.replace(/\*\*|==|!!|~~|__|""|``|%%|##|(\(\()|(\)\))|(\[\[)|(\]\])/g, '');
  return cleanText.replace(/\s+/g, '').length;
};

export const calculateReadingTime = (count: number): number => {
  const speed = 400; 
  return Math.ceil(count / speed);
};

const countVisualLines = (text: string, charsPerLine: number): number => {
  if (!text) return 0;
  // 计算行数时，先去掉标注符号，因为它们不占物理渲染空间
  const cleanText = text.replace(/\*\*|==|!!|~~|__|""|``|%%|##|(\(\()|(\)\))|(\[\[)|(\]\])/g, '');
  
  return cleanText.split('\n').reduce((acc, curr) => {
    if (curr.length === 0) return acc + 1;
    const estimatedLines = Math.ceil(curr.length / charsPerLine);
    return acc + Math.max(1, Math.ceil(estimatedLines * 1.05));
  }, 0);
};

export const paginateText = (config: PosterConfig): string[] => {
  if (!config.content) return [];

  const baseW = 1000;
  let baseH = 1000;
  if (config.aspectRatio === 'custom') {
    baseH = (baseW / config.customWidth) * config.customHeight;
  } else {
    const [w, h] = config.aspectRatio.split(':').map(Number);
    baseH = (baseW / w) * h;
  }

  const usableW = baseW * 0.82; 
  const totalUsableH = baseH * 0.76; 
  
  const lineHeightPx = config.fontSize * config.lineHeight;
  const paraGapPx = config.fontSize * config.paragraphGap;
  
  const charsPerLine = Math.floor(usableW / (config.fontSize * 1.2)); 

  const inputParagraphs = config.content.replace(/\r\n/g, '\n').split('\n');
  const queue = [...inputParagraphs];
  const pages: string[] = [];
  
  let currentPageParagraphs: string[] = [];
  let currentHeight = 0;

  const getPageCapacity = (first: boolean) => {
    if (!first) return totalUsableH;
    const titleCharsPerLine = Math.floor(usableW / (config.titleFontSize * 1.2));
    const titleLines = Math.ceil(config.title.length / Math.max(1, titleCharsPerLine));
    const titleBlockHeight = (config.titleFontSize * 1.4 * titleLines) + 240;
    return Math.max(totalUsableH * 0.2, totalUsableH - titleBlockHeight);
  };

  let pageLimit = getPageCapacity(true);

  while (queue.length > 0) {
    const para = queue.shift()!;
    if (para.trim() === '' && currentHeight === 0) continue;

    const lines = countVisualLines(para, charsPerLine);
    const effectiveParaHeight = (lines * lineHeightPx) + (currentHeight > 0 ? paraGapPx : 0) + (lineHeightPx * 0.3);

    if (currentHeight + effectiveParaHeight <= pageLimit) {
      currentPageParagraphs.push(para);
      currentHeight += effectiveParaHeight;
    } else {
      const availableH = pageLimit - currentHeight - (currentHeight > 0 ? paraGapPx : 0);
      const possibleLines = Math.floor(availableH / lineHeightPx) - 2;

      if (possibleLines >= 2) {
        // 分割时需要考虑标注标签的完整性
        const splitIndex = possibleLines * charsPerLine;
        let safeSplit = -1;
        const puncs = ['。', '！', '？', '；', '”', '』', '》', '>', '.', '!', '?', ';'];
        for (const punc of puncs) {
          const idx = para.lastIndexOf(punc, splitIndex);
          if (idx > splitIndex * 0.4) {
            safeSplit = Math.max(safeSplit, idx);
          }
        }
        
        const finalSplit = safeSplit !== -1 ? safeSplit + 1 : splitIndex;
        
        // 确保不会切断 ** 或 == 或 !! 或 ~~ 或 (( 或 [[ 标记
        let adjustedSplit = finalSplit;
        const sub = para.substring(0, finalSplit);
        
        const checkMarkers = [
          { marker: '**', count: (sub.match(/\*\*/g) || []).length },
          { marker: '==', count: (sub.match(/==/g) || []).length },
          { marker: '!!', count: (sub.match(/!!/g) || []).length },
          { marker: '~~', count: (sub.match(/~~/g) || []).length },
          { marker: '__', count: (sub.match(/__/g) || []).length },
          { marker: '""', count: (sub.match(/""/g) || []).length },
          { marker: '``', count: (sub.match(/``/g) || []).length },
          { marker: '%%', count: (sub.match(/%%/g) || []).length },
          { marker: '##', count: (sub.match(/##/g) || []).length },
          { marker: '((', count: (sub.match(/\(\(/g) || []).length, close: '))' },
          { marker: '[[', count: (sub.match(/\[\[/g) || []).length, close: ']]' }
        ];

        for (const m of checkMarkers) {
          if (m.count % 2 !== 0) {
            adjustedSplit = para.lastIndexOf(m.marker, finalSplit);
            break;
          }
        }

        const part1 = para.substring(0, adjustedSplit);
        const part2 = para.substring(adjustedSplit);

        if (part1.trim()) currentPageParagraphs.push(part1);
        if (part2.trim()) queue.unshift(part2);
        
        pages.push(currentPageParagraphs.join('\n'));
        currentPageParagraphs = [];
        currentHeight = 0;
        pageLimit = getPageCapacity(false);
      } else {
        queue.unshift(para);
        if (currentPageParagraphs.length > 0) {
          pages.push(currentPageParagraphs.join('\n'));
          currentPageParagraphs = [];
          currentHeight = 0;
        }
        pageLimit = getPageCapacity(false);
      }
    }
  }

  if (currentPageParagraphs.length > 0) {
    pages.push(currentPageParagraphs.join('\n'));
  }

  return pages;
};

export const getFormattedDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
};

export const slugify = (text: string): string => {
  if (!text) return 'poster';
  return text.substring(0, 10).replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '_');
};
