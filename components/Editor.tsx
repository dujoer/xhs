
import React, { useState, useRef } from 'react';
import { PosterConfig, AspectRatio, ColorPalette, FontFamily, LayoutPreset } from '../types';

const THEMES: ColorPalette[] = [
  { name: '暗夜', bg: '#121212', text: '#f5f5f7' },
  { name: '纸墨', bg: '#fdfaf1', text: '#1a1a1a' },
  { name: '森林', bg: '#1a2e1a', text: '#e8f3e8' },
  { name: '深海', bg: '#0f172a', text: '#e2e8f0' },
  { name: '复古', bg: '#4a3728', text: '#f4ecd8' },
  { name: '极简', bg: '#ffffff', text: '#121212' },
  { name: '晚樱', bg: '#fff5f7', text: '#702459' },
  { name: '午夜', bg: '#0b0e14', text: '#e0e6ed' },
  { name: '奶油', bg: '#f9f6f2', text: '#4a453e' },
  { name: '抹茶', bg: '#f1f8e9', text: '#33691e' },
];

const FONTS: { name: string; id: FontFamily; class: string }[] = [
  { name: '宋体', id: 'serif', class: 'font-serif-sc' },
  { name: '黑体', id: 'sans', class: 'font-sans-sc' },
  { name: '毛笔', id: 'mashan', class: 'font-mashan' },
  { name: '小薇', id: 'xiaowei', class: 'font-xiaowei' },
  { name: '行书', id: 'longcang', class: 'font-longcang' },
  { name: '黄油', id: 'huangyou', class: 'font-huangyou' },
  { name: '快乐', id: 'kuaile', class: 'font-kuaile' },
  { name: '毛草', id: 'maocao', class: 'font-maocao' },
  { name: '至芒', id: 'zhimang', class: 'font-zhimang' },
];

const RATIOS: AspectRatio[] = ['3:4', '9:16', 'custom'];

const MARKERS = [
  { label: '强调', start: '**', end: '**' },
  { label: '高亮', start: '==', end: '==' },
  { label: '警告', start: '!!', end: '!!' },
  { label: '删除', start: '~~', end: '~~' },
  { label: '下划线', start: '__', end: '__' },
  { label: '金句', start: '""', end: '""' },
  { label: '代码', start: '``', end: '``' },
  { label: '渐变', start: '%%', end: '%%' },
  { label: '虚线', start: '##', end: '##' },
  { label: '次要', start: '((', end: '))' },
  { label: '边框', start: '[[', end: ']]' },
];

interface EditorProps {
  config: PosterConfig;
  onUpdate: (updates: Partial<PosterConfig>) => void;
  presets: LayoutPreset[];
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  onApplyPreset: (preset: LayoutPreset) => void;
  onResetPresets: () => void;
}

export const Editor: React.FC<EditorProps> = ({ 
  config, 
  onUpdate, 
  presets, 
  onSavePreset, 
  onDeletePreset, 
  onApplyPreset,
  onResetPresets
}) => {
  const [newPresetName, setNewPresetName] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleApplyMarker = (startMarker: string, endMarker: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = config.content;
    const selectedText = text.substring(start, end);
    
    const newText = 
      text.substring(0, start) + 
      startMarker + selectedText + endMarker + 
      text.substring(end);

    onUpdate({ content: newText });

    // 重新聚焦并设置选择范围
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + startMarker.length,
        end + startMarker.length
      );
    }, 0);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* 0. 排版预设 */}
      <section className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 space-y-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[11px] font-black text-indigo-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            排版预设
          </label>
          <button 
            onClick={onResetPresets}
            className="text-[9px] font-bold text-indigo-300 hover:text-indigo-500 transition-colors"
          >
            重置默认
          </button>
        </div>
        
        <div className="space-y-4">
          {['小红书', '专业', '可爱', '轻松', '复古', '艺术', '其他'].map(cat => {
            const catPresets = presets.filter(p => (p.category || '其他') === cat);
            if (catPresets.length === 0) return null;
            
            return (
              <div key={cat} className="space-y-2">
                <h5 className="text-[9px] font-black text-indigo-300 uppercase tracking-tighter pl-1">{cat}风格</h5>
                <div className="flex flex-wrap gap-2">
                  {catPresets.map(preset => (
                    <div key={preset.id} className="group relative">
                      <button
                        onClick={() => onApplyPreset(preset)}
                        className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 text-[10px] font-bold rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        {preset.name}
                      </button>
                      <button
                        onClick={() => onDeletePreset(preset.id)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {presets.length === 0 && (
            <span className="text-[10px] text-indigo-300 font-medium">暂无预设，保存当前配置以快速切换</span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="预设名称..."
            className="flex-1 px-3 py-2 bg-white border border-indigo-100 rounded-lg outline-none text-[10px] font-bold"
          />
          <button
            onClick={() => {
              if (newPresetName.trim()) {
                onSavePreset(newPresetName.trim());
                setNewPresetName('');
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-lg hover:bg-indigo-700 transition-all"
          >
            保存当前
          </button>
        </div>
      </section>

      {/* 1. 作者名称 */}
      <section>
        <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
          作者名称
        </label>
        <input
          type="text"
          value={config.author || ''}
          onChange={(e) => onUpdate({ author: e.target.value })}
          placeholder="输入作者名..."
          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all text-slate-800 font-sans-sc font-bold text-sm"
        />
      </section>

      {/* 2. 文章标题 */}
      <section>
        <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
          文章标题
        </label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="给你的文章起个好听的名字..."
          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all text-slate-800 font-serif-sc font-black text-base"
        />
      </section>

      {/* 3. 正文内容 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            正文内容
          </label>
        </div>
        <textarea
          ref={textareaRef}
          rows={10}
          value={config.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder={'在这里输入内容...支持标注：\n**强调**、==高亮==、!!警告!!、~~删除~~、__下划线__、""金句""、``代码``、%%渐变%%、##虚线##、((次要))、[[边框]]'}
          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all text-slate-800 leading-relaxed font-serif-sc resize-none text-sm placeholder:text-slate-300"
        />
        
        {/* 点击标注 */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MARKERS.map((marker) => (
            <button
              key={marker.label}
              onClick={() => handleApplyMarker(marker.start, marker.end)}
              className="px-2 py-1 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 text-slate-500 text-[10px] font-bold rounded-md transition-all border border-slate-200 hover:border-indigo-200"
              title={`${marker.start}文字${marker.end}`}
            >
              {marker.label}
            </button>
          ))}
        </div>

        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">使用指南 & 标注语法</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 pb-4 border-b border-slate-200/60">
            {MARKERS.map(m => (
              <div key={m.label} className="flex items-center justify-between text-[9px]">
                <span className="font-bold text-slate-400">{m.label}</span>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-500 font-mono">{m.start}内容{m.end}</code>
              </div>
            ))}
          </div>
          <ul className="text-[10px] text-slate-500 space-y-1.5 font-medium">
            <li>• <span className="font-bold text-slate-700">快速标注</span>：选中文字后点击上方按钮，或手动输入上述符号。</li>
            <li>• <span className="font-bold text-slate-700">嵌套组合</span>：标注支持嵌套（如：<code className="text-[9px]">**==强调高亮==**</code>），请务必成对闭合。</li>
            <li>• <span className="font-bold text-slate-700">自动分页</span>：长内容会自动切分为多张海报，系统会自动避开标注块防止截断。</li>
            <li>• <span className="font-bold text-slate-700">下载顺序</span>：点击“下载全部”将从最后一张开始倒序保存，防止浏览器拦截。</li>
          </ul>
        </div>
      </section>

      {/* 4. 画布比例 */}
      <section className="space-y-4">
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">画布比例</label>
        <div className="flex flex-wrap gap-2">
          {RATIOS.map((ratio) => (
            <button
              key={ratio}
              onClick={() => onUpdate({ aspectRatio: ratio })}
              className={`px-3 py-2 text-[10px] font-black rounded-lg transition-all border-2 ${
                config.aspectRatio === ratio 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
        
        {config.aspectRatio === 'custom' && (
          <div className="grid grid-cols-2 gap-4 animate-slide-up">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">宽度比例</label>
              <input
                type="number"
                value={config.customWidth}
                onChange={(e) => onUpdate({ customWidth: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">高度比例</label>
              <input
                type="number"
                value={config.customHeight}
                onChange={(e) => onUpdate({ customHeight: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none text-sm font-bold"
              />
            </div>
          </div>
        )}
      </section>

      {/* 5. 字体风格 */}
      <section>
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">字体风格</label>
        <div className="grid grid-cols-3 gap-2">
          {FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => onUpdate({ fontFamily: font.id })}
              className={`px-2 py-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                config.fontFamily === font.id
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
              }`}
            >
              <span className={`text-base leading-none ${font.class}`}>文</span>
              <span className="text-[10px] font-bold tracking-tighter truncate w-full text-center">{font.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 6. 视觉主题 */}
      <section>
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">视觉主题</label>
        <div className="grid grid-cols-5 gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.name}
              onClick={() => onUpdate({ themeColor: theme.bg, textColor: theme.text })}
              className="flex flex-col gap-1.5 p-0.5 group"
              title={theme.name}
            >
              <div 
                className={`w-full h-10 rounded-lg border-2 transition-all shadow-sm flex items-center justify-center overflow-hidden ${
                  config.themeColor === theme.bg ? 'border-indigo-500 scale-105 shadow-md' : 'border-transparent group-hover:border-slate-200'
                }`}
                style={{ backgroundColor: theme.bg }}
              >
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: theme.text }} />
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter text-center truncate">{theme.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 7. 排版参数 */}
      <section className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-8">
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">排版参数</label>
        
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-bold text-slate-500">
            <span>标题字号</span>
            <span className="text-indigo-600 font-black">{config.titleFontSize}px</span>
          </div>
          <input 
            type="range" min="24" max="80" step="1"
            value={config.titleFontSize}
            onChange={(e) => onUpdate({ titleFontSize: parseInt(e.target.value) })}
            className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-bold text-slate-500">
            <span>元信息字号 (作者/字数)</span>
            <span className="text-indigo-600 font-black">{config.metadataFontSize}px</span>
          </div>
          <input 
            type="range" min="8" max="24" step="1"
            value={config.metadataFontSize}
            onChange={(e) => onUpdate({ metadataFontSize: parseInt(e.target.value) })}
            className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-bold text-slate-500">
            <span>正文字号</span>
            <span className="text-indigo-600 font-black">{config.fontSize}px</span>
          </div>
          <input 
            type="range" min="12" max="40" step="1"
            value={config.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-bold text-slate-500">
            <span>行间距</span>
            <span className="text-indigo-600 font-black">{config.lineHeight}x</span>
          </div>
          <input 
            type="range" min="1.2" max="2.5" step="0.1"
            value={config.lineHeight}
            onChange={(e) => onUpdate({ lineHeight: parseFloat(e.target.value) })}
            className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">首行缩进 (2字)</span>
          <button 
            onClick={() => onUpdate({ useIndentation: !config.useIndentation })}
            className={`w-10 h-5 rounded-full transition-all relative ${config.useIndentation ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.useIndentation ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </section>
    </div>
  );
};
