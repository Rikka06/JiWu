
import React from 'react';
import { TagState, PERSONAS, MOTIVATIONS, STYLES, DISHES, BUDGETS, FOCUS_POINTS, MOODS } from '../types';

interface TagSystemProps {
  tags: TagState;
  setTags: React.Dispatch<React.SetStateAction<TagState>>;
  onRandomize: () => void;
}

export const TagSystem: React.FC<TagSystemProps> = ({ tags, setTags, onRandomize }) => {
  const toggleDish = (dish: string) => {
    setTags(prev => {
      const exists = prev.dishes.includes(dish);
      if (exists) {
        return { ...prev, dishes: prev.dishes.filter(d => d !== dish) };
      }
      return { ...prev, dishes: [...prev.dishes, dish] };
    });
  };

  const renderSectionTitle = (title: string) => (
    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{title}</h3>
  );

  const renderHorizontalScroll = (
    items: string[], 
    currentValue: string, 
    field: keyof Omit<TagState, 'dishes' | 'stars' | 'people' | 'wordCount' | 'useEmoji' | 'structure'>
  ) => (
    <div className="flex space-x-2.5 overflow-x-auto no-scrollbar pb-2 px-1">
      {items.map(item => (
        <button
          key={item}
          onClick={() => setTags(prev => ({ ...prev, [field]: item }))}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-300 border whitespace-nowrap shadow-sm ${
            tags[field] === item
              ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-[1.02]'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Random Button */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">评价参数配置</h2>
        <button 
          onClick={onRandomize}
          className="group relative px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 active:scale-95 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12"></div>
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 4.992 4.992 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">一键随机</span>
          </div>
        </button>
      </div>

      {/* 1. Identity & Context */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-4 border border-white shadow-sm space-y-5">
        <div>
          {renderSectionTitle('一、基础属性 (身份)')}
          {renderHorizontalScroll(PERSONAS, tags.persona, 'persona')}
        </div>
        <div>
          {renderSectionTitle('二、消费动机')}
          {renderHorizontalScroll(MOTIVATIONS, tags.motivation, 'motivation')}
        </div>
      </div>

      {/* 2. Rating & Counts */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-4 border border-white shadow-sm space-y-5">
        {renderSectionTitle('评分与规格')}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Rating */}
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-medium">综合星级</span>
            <div className="flex justify-between items-center bg-slate-100/50 rounded-xl px-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setTags(prev => ({ ...prev, stars: star }))}
                  className="focus:outline-none transform active:scale-90 transition-transform duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-7 w-7 transition-colors duration-300 ${
                      star <= tags.stars 
                      ? 'text-amber-400 fill-current drop-shadow-sm' 
                      : 'text-slate-200'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={star <= tags.stars ? 0 : 2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            {/* People Slider */}
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">人数</span>
                <span className="text-sm font-bold text-slate-700 font-mono">{tags.people}人</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1"
                value={tags.people}
                onChange={(e) => setTags(prev => ({...prev, people: parseInt(e.target.value)}))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Word Count Slider */}
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">字数</span>
                <span className="text-sm font-bold text-slate-700 font-mono">{tags.wordCount}字</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="150" 
                step="10"
                value={tags.wordCount}
                onChange={(e) => setTags(prev => ({...prev, wordCount: parseInt(e.target.value)}))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* New: Format Settings (Emoji & Structure) */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-4 border border-white shadow-sm">
        {renderSectionTitle('格式设置')}
        <div className="flex justify-between items-center gap-4">
          
          {/* Emoji Toggle */}
          <button
            onClick={() => setTags(prev => ({ ...prev, useEmoji: !prev.useEmoji }))}
            className={`flex-1 flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
              tags.useEmoji 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${tags.useEmoji ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-400'}`}>
                😋
              </div>
              <div className="text-left">
                <div className={`text-xs font-bold ${tags.useEmoji ? 'text-orange-900' : 'text-slate-500'}`}>Emoji</div>
                <div className="text-[10px] text-slate-400">{tags.useEmoji ? '已开启' : '已关闭'}</div>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${tags.useEmoji ? 'bg-orange-500' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${tags.useEmoji ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Structure Toggle */}
          <button
            onClick={() => setTags(prev => ({ ...prev, structure: prev.structure === 'paragraph' ? 'segmented' : 'paragraph' }))}
            className={`flex-1 flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
              tags.structure === 'paragraph'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-emerald-50 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${tags.structure === 'paragraph' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {tags.structure === 'paragraph' ? '📝' : '📑'}
              </div>
              <div className="text-left">
                <div className={`text-xs font-bold ${tags.structure === 'paragraph' ? 'text-blue-900' : 'text-emerald-900'}`}>
                  {tags.structure === 'paragraph' ? '一整段' : '分段式'}
                </div>
                <div className="text-[10px] text-slate-400">排版</div>
              </div>
            </div>
            <div className="flex gap-0.5">
               {/* Visual indicator for structure */}
               <div className={`w-1.5 h-3 rounded-full ${tags.structure === 'paragraph' ? 'bg-blue-400 h-4' : 'bg-emerald-200'}`} />
               <div className={`w-1.5 h-3 rounded-full ${tags.structure === 'segmented' ? 'bg-emerald-400 h-4' : 'bg-blue-200'}`} />
            </div>
          </button>

        </div>
      </div>

      {/* 3. Focus, Mood, Budget & Style */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-4 border border-white shadow-sm space-y-5">
        <div>
          {renderSectionTitle('三、关注偏好')}
          {renderHorizontalScroll(FOCUS_POINTS, tags.focus, 'focus')}
        </div>

        <div>
          {renderSectionTitle('四、预算偏好')}
          {renderHorizontalScroll(BUDGETS, tags.budget, 'budget')}
        </div>

        <div>
          {renderSectionTitle('五、顾客心情')}
          {renderHorizontalScroll(MOODS, tags.mood, 'mood')}
        </div>
        
        <div>
          {renderSectionTitle('六、文案风格')}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {STYLES.map(s => (
              <button
                key={s}
                onClick={() => setTags(prev => ({ ...prev, style: s }))}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all duration-300 border shadow-sm ${
                  tags.style === s
                    ? 'bg-rose-500 border-rose-500 text-white shadow-rose-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Dishes */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl p-4 border border-white shadow-sm">
        {renderSectionTitle('必点推荐')}
        <div className="flex flex-wrap gap-2.5">
          {DISHES.map(d => (
            <button
              key={d}
              onClick={() => toggleDish(d)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 border flex items-center gap-1.5 shadow-sm ${
                tags.dishes.includes(d)
                  ? 'bg-amber-500 border-amber-500 text-white shadow-amber-200'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${tags.dishes.includes(d) ? 'bg-white' : 'bg-slate-300'}`} />
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};