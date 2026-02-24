
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { PosterConfig, PageData, LayoutPreset } from './types';
import { countWords, calculateReadingTime, paginateText } from './utils';
import { Editor } from './components/Editor';
import { Previewer, PreviewerRef } from './components/Previewer';

const DEFAULT_CONFIG: PosterConfig = {
  title: '优质小红书审美排版指南',
  content: '这是一份关于如何制作优质小红书笔记的排版指南。\n\n**核心原则**：\n1. ==极简主义==：不要堆砌过多的元素，保持呼吸感。\n2. !!视觉重点!!：通过标注引导读者的视线。\n3. ""审美一致性""：选择一套配色方案并坚持使用。\n\n%%尝试使用渐变标注%% 来增加现代感，或者使用 ``代码块`` 来展示专业术语。\n\n希望这些小技巧能帮到你！',
  author: '乌鸦想搞钱',
  themeColor: '#ffffff', 
  textColor: '#1a1a1a',
  fontSize: 22,
  titleFontSize: 52,
  metadataFontSize: 14,
  lineHeight: 1.8,
  paragraphGap: 1.6,
  useIndentation: true,
  aspectRatio: '3:4',
  customWidth: 3,
  customHeight: 4,
  fontFamily: 'serif'
};

const PRESETS_KEY = 'editorial_presets_v1';

const DEFAULT_PRESETS: LayoutPreset[] = [
  // 小红书审美风格
  {
    id: 'xhs-1',
    name: '多巴胺粉',
    category: '小红书',
    config: {
      themeColor: '#fff0f3',
      textColor: '#ff4d6d',
      fontSize: 22,
      titleFontSize: 54,
      metadataFontSize: 14,
      lineHeight: 1.8,
      paragraphGap: 1.6,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'kuaile'
    }
  },
  {
    id: 'xhs-2',
    name: '莫兰迪绿',
    category: '小红书',
    config: {
      themeColor: '#f1f3f0',
      textColor: '#4a5d4e',
      fontSize: 21,
      titleFontSize: 50,
      metadataFontSize: 14,
      lineHeight: 1.7,
      paragraphGap: 1.5,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'serif'
    }
  },
  {
    id: 'xhs-3',
    name: '极简白',
    category: '小红书',
    config: {
      themeColor: '#ffffff',
      textColor: '#1a1a1a',
      fontSize: 22,
      titleFontSize: 52,
      metadataFontSize: 14,
      lineHeight: 1.8,
      paragraphGap: 1.6,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'serif'
    }
  },
  {
    id: 'xhs-4',
    name: '高级灰',
    category: '小红书',
    config: {
      themeColor: '#f8f9fa',
      textColor: '#343a40',
      fontSize: 21,
      titleFontSize: 48,
      metadataFontSize: 14,
      lineHeight: 1.7,
      paragraphGap: 1.5,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'sans'
    }
  },
  // 专业风格
  {
    id: 'default-1',
    name: '经典社论',
    category: '专业',
    config: {
      themeColor: '#fdfaf1',
      textColor: '#1a1a1a',
      fontSize: 22,
      titleFontSize: 48,
      metadataFontSize: 15,
      lineHeight: 1.8,
      paragraphGap: 1.5,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'serif'
    }
  },
  {
    id: 'default-2',
    name: '现代极简',
    category: '专业',
    config: {
      themeColor: '#ffffff',
      textColor: '#121212',
      fontSize: 20,
      titleFontSize: 42,
      metadataFontSize: 15,
      lineHeight: 1.6,
      paragraphGap: 1.2,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'sans'
    }
  },
  {
    id: 'default-3',
    name: '暗夜深思',
    category: '专业',
    config: {
      themeColor: '#121212',
      textColor: '#f5f5f7',
      fontSize: 24,
      titleFontSize: 52,
      metadataFontSize: 15,
      lineHeight: 1.9,
      paragraphGap: 1.8,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'serif'
    }
  },
  {
    id: 'default-4',
    name: '格调灰阶',
    category: '专业',
    config: {
      themeColor: '#f1f3f5',
      textColor: '#495057',
      fontSize: 21,
      titleFontSize: 44,
      metadataFontSize: 15,
      lineHeight: 1.7,
      paragraphGap: 1.4,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'sans'
    }
  },
  // 可爱风格
  {
    id: 'default-5',
    name: '奶油草莓',
    category: '可爱',
    config: {
      themeColor: '#fff5f7',
      textColor: '#d81b60',
      fontSize: 24,
      titleFontSize: 50,
      metadataFontSize: 15,
      lineHeight: 1.7,
      paragraphGap: 1.4,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'kuaile'
    }
  },
  {
    id: 'default-6',
    name: '萌动黄油',
    category: '可爱',
    config: {
      themeColor: '#fffde7',
      textColor: '#f57f17',
      fontSize: 23,
      titleFontSize: 48,
      metadataFontSize: 15,
      lineHeight: 1.6,
      paragraphGap: 1.3,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'huangyou'
    }
  },
  {
    id: 'default-cute-3',
    name: '蜜桃甜心',
    category: '可爱',
    config: {
      themeColor: '#fce4ec',
      textColor: '#880e4f',
      fontSize: 22,
      titleFontSize: 46,
      metadataFontSize: 15,
      lineHeight: 1.8,
      paragraphGap: 1.5,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'kuaile'
    }
  },
  {
    id: 'default-cute-4',
    name: '薄荷苏打',
    category: '可爱',
    config: {
      themeColor: '#e0f2f1',
      textColor: '#00695c',
      fontSize: 22,
      titleFontSize: 46,
      metadataFontSize: 15,
      lineHeight: 1.8,
      paragraphGap: 1.5,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'sans'
    }
  },
  // 轻松风格
  {
    id: 'default-7',
    name: '午后慵懒',
    category: '轻松',
    config: {
      themeColor: '#faf9f6',
      textColor: '#5d4037',
      fontSize: 22,
      titleFontSize: 46,
      metadataFontSize: 15,
      lineHeight: 1.9,
      paragraphGap: 1.6,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'serif'
    }
  },
  {
    id: 'default-8',
    name: '海风轻抚',
    category: '轻松',
    config: {
      themeColor: '#e1f5fe',
      textColor: '#01579b',
      fontSize: 21,
      titleFontSize: 44,
      metadataFontSize: 15,
      lineHeight: 1.7,
      paragraphGap: 1.4,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'sans'
    }
  },
  {
    id: 'default-relaxed-3',
    name: '晨间咖啡',
    category: '轻松',
    config: {
      themeColor: '#fdfbf7',
      textColor: '#4e342e',
      fontSize: 22,
      titleFontSize: 46,
      metadataFontSize: 15,
      lineHeight: 1.8,
      paragraphGap: 1.5,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'serif'
    }
  },
  {
    id: 'default-relaxed-4',
    name: '暮色森林',
    category: '轻松',
    config: {
      themeColor: '#f1f8e9',
      textColor: '#33691e',
      fontSize: 22,
      titleFontSize: 46,
      metadataFontSize: 15,
      lineHeight: 1.8,
      paragraphGap: 1.5,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'sans'
    }
  },
  // 复古风格
  {
    id: 'default-retro-1',
    name: '羊皮纸卷',
    category: '复古',
    config: {
      themeColor: '#f5e6d3',
      textColor: '#5d4037',
      fontSize: 22,
      titleFontSize: 48,
      metadataFontSize: 15,
      lineHeight: 1.8,
      paragraphGap: 1.5,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'serif'
    }
  },
  {
    id: 'default-retro-2',
    name: '胶片时代',
    category: '复古',
    config: {
      themeColor: '#263238',
      textColor: '#cfd8dc',
      fontSize: 21,
      titleFontSize: 44,
      metadataFontSize: 15,
      lineHeight: 1.7,
      paragraphGap: 1.4,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'maocao'
    }
  },
  {
    id: 'default-retro-3',
    name: '报纸头条',
    category: '复古',
    config: {
      themeColor: '#eeeeee',
      textColor: '#212121',
      fontSize: 20,
      titleFontSize: 52,
      metadataFontSize: 15,
      lineHeight: 1.6,
      paragraphGap: 1.2,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'serif'
    }
  },
  {
    id: 'default-retro-4',
    name: '黄金年代',
    category: '复古',
    config: {
      themeColor: '#3e2723',
      textColor: '#d4af37',
      fontSize: 22,
      titleFontSize: 48,
      metadataFontSize: 15,
      lineHeight: 1.8,
      paragraphGap: 1.5,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'zhimang'
    }
  },
  // 艺术风格
  {
    id: 'default-art-1',
    name: '水墨丹青',
    category: '艺术',
    config: {
      themeColor: '#ffffff',
      textColor: '#000000',
      fontSize: 24,
      titleFontSize: 56,
      metadataFontSize: 15,
      lineHeight: 2.0,
      paragraphGap: 2.0,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'mashan'
    }
  },
  {
    id: 'default-art-2',
    name: '极光幻境',
    category: '艺术',
    config: {
      themeColor: '#1a237e',
      textColor: '#80deea',
      fontSize: 21,
      titleFontSize: 46,
      metadataFontSize: 15,
      lineHeight: 1.7,
      paragraphGap: 1.4,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'sans'
    }
  },
  {
    id: 'default-art-3',
    name: '霓虹都市',
    category: '艺术',
    config: {
      themeColor: '#000000',
      textColor: '#ff00ff',
      fontSize: 20,
      titleFontSize: 48,
      metadataFontSize: 15,
      lineHeight: 1.6,
      paragraphGap: 1.2,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'huangyou'
    }
  },
  {
    id: 'default-art-4',
    name: '极简留白',
    category: '艺术',
    config: {
      themeColor: '#fafafa',
      textColor: '#9e9e9e',
      fontSize: 18,
      titleFontSize: 36,
      metadataFontSize: 15,
      lineHeight: 2.2,
      paragraphGap: 1.8,
      useIndentation: true,
      aspectRatio: '3:4',
      customWidth: 3,
      customHeight: 4,
      fontFamily: 'sans'
    }
  }
];

const App: React.FC = () => {
  const [config, setConfig] = useState<PosterConfig>(DEFAULT_CONFIG);
  const [presets, setPresets] = useState<LayoutPreset[]>([]);
  const previewerRef = useRef<PreviewerRef>(null);

  // Load presets on mount
  useEffect(() => {
    const saved = localStorage.getItem(PRESETS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPresets(parsed);
        } else {
          setPresets(DEFAULT_PRESETS);
        }
      } catch (e) {
        console.error('Failed to parse presets', e);
        setPresets(DEFAULT_PRESETS);
      }
    } else {
      setPresets(DEFAULT_PRESETS);
    }
  }, []);

  // Save presets when they change
  useEffect(() => {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  }, [presets]);

  const pages = useMemo(() => {
    const rawPages = paginateText(config);
    const totalWords = countWords(config.content);
    const readingTime = calculateReadingTime(totalWords);

    return rawPages.map((content, idx) => ({
      index: idx,
      isFirst: idx === 0,
      title: idx === 0 ? config.title : undefined,
      content,
      wordCount: totalWords,
      readingTime: readingTime,
      author: config.author
    }));
  }, [config]);

  const handleUpdateConfig = useCallback((updates: Partial<PosterConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSavePreset = useCallback((name: string) => {
    const { title, content, author, ...layoutConfig } = config;
    const newPreset: LayoutPreset = {
      id: Date.now().toString(),
      name,
      config: layoutConfig
    };
    setPresets(prev => [...prev, newPreset]);
  }, [config]);

  const handleDeletePreset = useCallback((id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleApplyPreset = useCallback((preset: LayoutPreset) => {
    setConfig(prev => ({
      ...prev,
      ...preset.config
    }));
  }, []);

  const handleResetPresets = useCallback(() => {
    if (window.confirm('确定要重置所有预设为默认值吗？这将删除您自定义的预设。')) {
      setPresets(DEFAULT_PRESETS);
    }
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f0f2f5] flex flex-col">
      <main className="flex-1 flex flex-row overflow-hidden">
        <aside className="w-[420px] h-full flex-shrink-0 flex flex-col border-r border-slate-200 bg-white shadow-2xl z-30">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white flex-shrink-0">
            <div>
              <h1 className="text-lg font-black tracking-tighter">EDITORIAL PRO</h1>
              <p className="text-[9px] font-bold opacity-50 uppercase tracking-[0.3em]">Full Saturate V7.0</p>
            </div>
            <div className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
              <span className="text-[11px] font-black">{pages.length} 页</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar scrolling-touch overscroll-contain">
            <Editor 
              config={config} 
              onUpdate={handleUpdateConfig} 
              presets={presets}
              onSavePreset={handleSavePreset}
              onDeletePreset={handleDeletePreset}
              onApplyPreset={handleApplyPreset}
              onResetPresets={handleResetPresets}
            />
          </div>

          <div className="p-6 border-t border-slate-100 bg-white flex-shrink-0">
            <button 
              onClick={() => previewerRef.current?.downloadAll()}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              下载全部 ({pages.length})
            </button>
          </div>
        </aside>

        <section className="flex-1 h-full overflow-y-auto no-scrollbar relative bg-[#e2e8f0]">
          <div className="min-h-full py-20 px-10 flex flex-col items-center">
            <div className="w-full max-w-[720px] space-y-24">
              <Previewer ref={previewerRef} pages={pages} config={config} />
              {pages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-40 opacity-30 animate-pulse">
                  <div className="w-20 h-20 mb-6 rounded-3xl border-4 border-dashed border-slate-400"></div>
                  <span className="text-sm font-black tracking-widest uppercase">等待输入内容...</span>
                </div>
              )}
              {pages.length > 0 && (
                <div className="h-40 flex items-center justify-center opacity-20 pointer-events-none">
                   <span className="text-[10px] font-black tracking-[1em] uppercase">End of Content</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
