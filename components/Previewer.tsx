
import React, { useImperativeHandle, forwardRef, useRef, ReactNode } from 'react';
import { PageData, PosterConfig } from '../types';
import { getFormattedDate, slugify } from '../utils';
import * as htmlToImage from 'html-to-image';

export interface PreviewerRef {
  downloadAll: () => Promise<void>;
}

interface PreviewerProps {
  pages: PageData[];
  config: PosterConfig;
}

const PRESET_RATIOS = {
  '3:4': '3/4',
  '9:16': '9/16',
};

const FONT_MAP = {
  'serif': 'font-serif-sc',
  'sans': 'font-sans-sc',
  'mashan': 'font-mashan',
  'xiaowei': 'font-xiaowei',
  'longcang': 'font-longcang',
  'huangyou': 'font-huangyou',
  'kuaile': 'font-kuaile',
  'maocao': 'font-maocao',
  'zhimang': 'font-zhimang',
};

export const Previewer = forwardRef<PreviewerRef, PreviewerProps>(({ pages, config }, ref) => {
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const downloadPage = async (index: number) => {
    const node = pageRefs.current[index];
    if (!node) return;

    try {
      // 确保字体加载完成
      await document.fonts.ready;
      
      // 额外等待一小段时间确保浏览器完成重绘
      await new Promise(resolve => setTimeout(resolve, 200));

      // 第一次调用作为预热，解决部分浏览器首次渲染不全的问题
      await htmlToImage.toPng(node);
      
      const dataUrl = await htmlToImage.toPng(node, { 
        quality: 1.0, 
        pixelRatio: 3, 
        backgroundColor: config.themeColor,
        cacheBust: true,
        preferredFontFormat: 'woff2',
        skipFonts: false, // 确保包含字体
      }); 

      const dateStr = getFormattedDate();
      const titleStr = slugify(config.title);
      const link = document.createElement('a');
      link.download = `${dateStr}_${titleStr}_P${index + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      alert('图片生成失败，可能是由于字体资源加载受阻。请尝试刷新页面或稍后再试。');
    }
  };

  useImperativeHandle(ref, () => ({
    downloadAll: async () => {
      // 从后往前下载
      for (let i = pages.length - 1; i >= 0; i--) {
        await downloadPage(i);
        // 增加间隔，防止浏览器下载队列过载
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }));

  const getAspectRatio = () => {
    if (config.aspectRatio === 'custom') {
      return `${config.customWidth}/${config.customHeight}`;
    }
    return PRESET_RATIOS[config.aspectRatio as keyof typeof PRESET_RATIOS] || '1';
  };

  const currentFontClass = FONT_MAP[config.fontFamily] || 'font-serif-sc';

  // 解析格式化标记的函数
  const renderFormattedText = (text: string): ReactNode[] => {
    const parts: ReactNode[] = [];
    let currentText = text;

    // 正则匹配 **文字** 或 ==文字== 或 !!文字!! 或 ~~文字~~ 或 __文字__ 或 ""文字"" 或 ``文字`` 或 %%文字%% 或 ##文字## 或 ((文字)) 或 [[文字]]
    // 使用非贪婪匹配
    const regex = /(\*\*.*?\*\*|==.*?==|!!.*?!!|~~.*?~~|__.*?__|"".*?""|``.*?``|%%.*?%%|##.*?##|\(\(.*?\)\)|\[\[.*?\]\])/g;
    const splitParts = currentText.split(regex);

    return splitParts.map((part, i) => {
      if (!part) return null;
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={i} className="font-black underline underline-offset-[6px] decoration-current/40 bg-current/5 px-1 rounded-sm">
            {part.slice(2, -2)}
          </span>
        );
      } else if (part.startsWith('==') && part.endsWith('==')) {
        return (
          <span key={i} className="px-2 py-0.5 rounded-lg bg-yellow-300/40 text-current font-bold border-b-2 border-yellow-400/50 mx-0.5 shadow-sm">
            {part.slice(2, -2)}
          </span>
        );
      } else if (part.startsWith('!!') && part.endsWith('!!')) {
        return (
          <span key={i} className="text-red-600 font-black px-2 py-0.5 border-2 border-red-600/30 bg-red-50 rounded-md shadow-[2px_2px_0px_rgba(220,38,38,0.2)] mx-1">
            {part.slice(2, -2)}
          </span>
        );
      } else if (part.startsWith('~~') && part.endsWith('~~')) {
        return (
          <span key={i} className="line-through opacity-30 italic decoration-2">
            {part.slice(2, -2)}
          </span>
        );
      } else if (part.startsWith('__') && part.endsWith('__')) {
        return (
          <span key={i} className="underline underline-offset-4 decoration-current/60 decoration-wavy">
            {part.slice(2, -2)}
          </span>
        );
      } else if (part.startsWith('""') && part.endsWith('""')) {
        return (
          <span key={i} className="italic font-serif-sc text-current/90 px-6 py-4 border-l-4 border-current/30 block my-6 bg-current/[0.02] rounded-r-2xl shadow-inner">
            <span className="text-4xl absolute -left-2 -top-2 opacity-10 font-serif">“</span>
            {part.slice(2, -2)}
          </span>
        );
      } else if (part.startsWith('``') && part.endsWith('``')) {
        return (
          <code key={i} className="font-mono bg-slate-800 text-slate-100 px-2 py-0.5 rounded-md text-[0.85em] shadow-md mx-1 border border-white/10">
            {part.slice(2, -2)}
          </code>
        );
      } else if (part.startsWith('%%') && part.endsWith('%%')) {
        return (
          <span key={i} className="font-black bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
            {part.slice(2, -2)}
          </span>
        );
      } else if (part.startsWith('##') && part.endsWith('##')) {
        return (
          <span key={i} className="border-b-4 border-dotted border-current/40 pb-1 px-1">
            {part.slice(2, -2)}
          </span>
        );
      } else if (part.startsWith('((') && part.endsWith('))')) {
        return (
          <span key={i} className="opacity-40 text-[0.8em] font-medium tracking-tighter italic">
            ({part.slice(2, -2)})
          </span>
        );
      } else if (part.startsWith('[[') && part.endsWith(']]')) {
        return (
          <span key={i} className="border-2 border-current/20 px-2 py-1 rounded-xl font-bold mx-1 bg-white/5 backdrop-blur-sm shadow-sm">
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col items-center gap-16 lg:gap-32 w-full">
      {pages.map((page, idx) => (
        <div 
          key={`${idx}-${config.fontSize}-${config.aspectRatio}-${pages.length}-${config.fontFamily}`}
          className="group relative w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-500 bg-white rounded-sm"
          ref={(el) => { pageRefs.current[idx] = el; }}
          style={{ 
            backgroundColor: config.themeColor,
            color: config.textColor,
            aspectRatio: getAspectRatio(),
          }}
        >
          {/* 操作按钮 */}
          <div className="absolute top-8 right-8 z-40 opacity-0 group-hover:opacity-100 transition-all duration-300 no-print">
             <button
              onClick={() => downloadPage(idx)}
              className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/30 backdrop-blur-2xl text-white rounded-full shadow-2xl active:scale-90 transition-all border border-white/20"
              style={{ color: config.textColor }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
          </div>

          <div className="absolute inset-0 p-[9%] pb-[18%] flex flex-col z-10">
              {page.isFirst && (
                <div className="animate-slide-up flex-shrink-0 mb-12">
                  <div className="mb-8 lg:mb-12 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span 
                        className="font-black uppercase tracking-[0.3em] opacity-40 font-sans mb-1"
                        style={{ fontSize: `${config.metadataFontSize - 4}px` }}
                      >
                        Reading Report
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-[2px] bg-current opacity-30"></div>
                        <span 
                          className="font-black uppercase tracking-[0.15em] opacity-90 font-sans"
                          style={{ fontSize: `${config.metadataFontSize}px` }}
                        >
                          {page.wordCount} WORDS / {page.readingTime} MIN
                        </span>
                      </div>
                    </div>
                    {page.author && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Author</span>
                        <span 
                          className="font-black uppercase tracking-[0.1em] opacity-90 font-sans px-3 py-1 bg-current/5 rounded-full border border-current/10"
                          style={{ fontSize: `${config.metadataFontSize}px` }}
                        >
                          @{page.author}
                        </span>
                      </div>
                    )}
                  </div>

                  {config.title && (
                    <div className="relative">
                      <h1 
                        className={`${currentFontClass} font-black leading-[1.1] mb-4 tracking-tighter relative z-10`}
                        style={{ fontSize: `${config.titleFontSize}px` }}
                      >
                        {config.title}
                      </h1>
                      <div className="absolute -left-4 -top-4 w-12 h-12 bg-current opacity-[0.03] rounded-full blur-2xl"></div>
                    </div>
                  )}
                  <div className="w-full h-px bg-current opacity-10 mt-6"></div>
                </div>
              )}

              <div 
                className={`${currentFontClass} text-justify tracking-wide opacity-95 transition-all duration-300 relative z-10`}
                style={{ 
                  fontSize: `${config.fontSize}px`,
                  lineHeight: config.lineHeight,
                }}
              >
                {page.content.split('\n').map((para, pIdx) => (
                  <p 
                    key={pIdx} 
                    className="mb-[var(--para-gap)] last:mb-0"
                    style={{ 
                      textIndent: config.useIndentation ? '2em' : '0',
                      '--para-gap': `${config.paragraphGap}em`
                    } as any}
                  >
                    {renderFormattedText(para)}
                  </p>
                ))}
              </div>
          </div>
          
          <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[radial-gradient(circle_at_50%_50%,currentColor_1.5px,transparent_1.5px)] bg-[length:40px_40px] z-0"></div>
          
          {/* 噪声纹理叠加 */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-start">
                <span className="text-[20px] font-serif-sc font-black opacity-30 leading-none">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="w-10 h-0.5 bg-current opacity-10 mt-1"></div>
              </div>
              <span className="text-[10px] font-sans font-black opacity-10 tracking-[0.2em] uppercase">
                Page {idx + 1}
              </span>
            </div>
            
            <div className="flex items-center gap-2 opacity-10">
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <div className="w-2 h-2 rounded-full bg-current"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

Previewer.displayName = 'Previewer';
