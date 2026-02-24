
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M8 7h6"></path><path d="M8 11h8"></path><path d="M8 15h6"></path></svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Editorial Poster</h1>
          <p className="text-xs text-slate-500 font-medium">高品质文章海报生成器</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6">
        <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">设计规范</a>
        <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">字体</a>
        <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">关于</a>
      </div>
    </header>
  );
};
