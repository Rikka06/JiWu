
import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_API_KEY, DEFAULT_MODEL, VISION_MODELS } from './constants';
import { TagState, Model, GeneratedResult, ChatMessage, PERSONAS, BUDGETS, FOCUS_POINTS, MOODS, STYLES, DISHES, MOTIVATIONS } from './types';
import { fetchModels, generateReview } from './services/api';
import { SettingsModal } from './components/SettingsModal';
import { TagSystem } from './components/TagSystem';

export default function App() {
  // --- State ---
  const [apiKey, setApiKey] = useState(localStorage.getItem('sf_api_key') || DEFAULT_API_KEY);
  const [models, setModels] = useState<Model[]>([]);
  // Use DEFAULT_MODEL if local storage is empty
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('sf_model') || DEFAULT_MODEL);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [image, setImage] = useState<string | null>(null); // Base64
  const [tags, setTags] = useState<TagState>({
    persona: PERSONAS[0],
    motivation: MOTIVATIONS[0],
    people: 2, // Default 2 people
    wordCount: 60, // Default 60 words
    budget: BUDGETS[1], // Default normal budget
    focus: FOCUS_POINTS[1],
    mood: MOODS[0],
    stars: 5,
    style: STYLES[0],
    dishes: [],
    useEmoji: true,
    structure: 'paragraph'
  });
  const [customInput, setCustomInput] = useState('');
  
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if current model supports vision
  const isVisionSupported = VISION_MODELS.includes(selectedModel);

  // --- Effects ---
  
  // Persist settings
  useEffect(() => {
    localStorage.setItem('sf_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('sf_model', selectedModel);
    }
    // If we switch to a non-vision model, clear the image to avoid confusion
    if (!VISION_MODELS.includes(selectedModel) && image) {
      setImage(null);
    }
  }, [selectedModel, image]);

  // Initial Data Load
  useEffect(() => {
    const initModels = async () => {
      setIsLoadingModels(true);
      const fetchedModels = await fetchModels(apiKey);
      setModels(fetchedModels);
      setIsLoadingModels(false);
    };
    initModels();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]); // Refetch if API Key changes

  // --- Handlers ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (!isVisionSupported) {
      alert('请先在右上角设置中切换至支持视觉的模型（如 Qwen-VL 系列）才能使用图片功能。');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleRandomize = () => {
    // Helper to pick random element
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    // Pick 1-4 random dishes
    const shuffledDishes = [...DISHES].sort(() => 0.5 - Math.random());
    const randomDishCount = Math.floor(Math.random() * 4) + 1; 
    const selectedDishes = shuffledDishes.slice(0, randomDishCount);

    // Weighted stars: 60% 5-star, 30% 4-star, 10% 3-star
    const rand = Math.random();
    let star = 5;
    if (rand > 0.9) star = 3;
    else if (rand > 0.6) star = 4;

    // Weighted people count (mostly 2-4)
    const randPeople = Math.random();
    let people = 2;
    if (randPeople > 0.8) people = Math.floor(Math.random() * 5) + 5; // 5-9
    else if (randPeople > 0.4) people = Math.floor(Math.random() * 3) + 2; // 2-4
    else people = 1;

    // Random word count 30-100
    const randWordCount = Math.floor(Math.random() * 70) + 30;

    setTags({
      persona: pick(PERSONAS),
      motivation: pick(MOTIVATIONS),
      people: people,
      wordCount: randWordCount,
      budget: pick(BUDGETS),
      focus: pick(FOCUS_POINTS),
      mood: pick(MOODS),
      style: pick(STYLES),
      stars: star,
      dishes: selectedDishes,
      useEmoji: Math.random() > 0.5,
      structure: Math.random() > 0.5 ? 'paragraph' : 'segmented'
    });
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      // 1. Construct System Prompt - Dazhong Dianping Specific
      const systemPrompt = "你是一位在大众点评写评价的真实顾客。你需要模拟普通人的语气，写出真实、自然、生活化的餐厅评价。切忌写成小红书风格（不要堆砌浮夸形容词，不要过度使用表情，不要像营销号）。";

      // 2. Logic toggles
      const emojiInstruction = tags.useEmoji 
        ? "允许使用少量Emoji（如😋、👍），但不要泛滥，最多1-2个。" 
        : "严禁使用任何Emoji表情。";
        
      const structureInstruction = tags.structure === 'segmented'
        ? "采用分点叙述或分段结构，逻辑清晰。"
        : "输出为一整段话，中间不要换行。";

      // 3. Construct User Prompt with detailed requirements
      const userTextDetails = `
任务：为日式烤肉店“极屋鮨牛”写一条评价。

【必须包含的关键点】
1. **核心服务**：一定要提到是“店员全程帮烤肉”，强调不用自己动手这一点（是加分项）。
2. **顾客画像**：你是一个“${tags.persona}”，今天${tags.people}人来用餐。
3. **真实感**：加入一点小细节或小瑕疵（例如排队久、环境有点吵、蘸料味道、价格小贵等），让评价看起来像真人写的。
4. **语气风格**：${tags.style}。句子要长短结合，允许出现口语化的倒装、断句或轻微语病。不要像AI写的那么完美。
5. **消费动机**：${tags.motivation}。
6. **关注重点**：${tags.focus}。
7. **推荐菜品**：${tags.dishes.length > 0 ? tags.dishes.join('、') : '肉都很不错'}。如果是视觉模型，请结合图片描述肉的纹理或色泽。

【格式要求】
- 字数：控制在 ${tags.wordCount} 字左右（10-100字之间）。
- ${emojiInstruction}
- ${structureInstruction}
- 不要带标题，不要带“风格：xxx”的前缀，直接输出评价内容。
- 总体是好评（${tags.stars}星），但要显得客观中立。

额外补充信息：${customInput || '无'}
      `.trim();

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt }
      ];

      if (image && isVisionSupported) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: userTextDetails },
            { type: 'image_url', image_url: { url: image } }
          ]
        });
      } else {
        messages.push({
          role: 'user',
          content: userTextDetails
        });
      }

      // 3. Call API
      const res = await generateReview(apiKey, selectedModel, messages);
      setResult(res);

    } catch (err: any) {
      setError(err.message || '生成失败，请检查网络或API配置');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      if (navigator.vibrate) navigator.vibrate(50);
      alert('已复制到剪贴板');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative overflow-x-hidden selection:bg-rose-500/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-rose-200/30 blur-[100px] rounded-full mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-100/60 blur-[100px] rounded-full mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto pb-24">
        
        {/* Navigation */}
        <nav className="flex justify-between items-center px-6 py-5 sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm">
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              极屋鮨牛
            </h1>
            <span className="text-[10px] text-rose-500 font-bold tracking-widest uppercase">AI 评价大师 Pro</span>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </nav>

        {/* Main Content */}
        <main className="px-5 pt-6 space-y-8">
          
          {/* Vision Input */}
          <section>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
            <div 
              onClick={handleImageClick}
              className={`relative w-full aspect-[2/1] rounded-3xl border-2 border-dashed transition-all duration-300 group cursor-pointer overflow-hidden shadow-sm flex flex-col items-center justify-center
                ${isVisionSupported
                  ? (image ? 'border-white bg-white' : 'border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.99]')
                  : 'scale-90 opacity-60 bg-slate-100 border-slate-200 grayscale cursor-not-allowed'
                }
              `}
            >
              {!isVisionSupported ? (
                 <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 rounded-full bg-slate-200 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-400 font-medium">视觉功能不可用 (需切换模型)</span>
                 </div>
              ) : image ? (
                <>
                  <img src={image} alt="Upload" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-4">
                    <span className="inline-flex self-center px-3 py-1 bg-black/50 backdrop-blur text-white text-xs rounded-full">点击重新拍摄</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                  <div className="p-4 rounded-full bg-slate-100 text-slate-400 group-hover:text-rose-500 group-hover:bg-rose-50 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-500 font-medium">拍摄或上传菜品</span>
                </div>
              )}
            </div>
          </section>

          {/* Tags */}
          <TagSystem 
            tags={tags} 
            setTags={setTags} 
            onRandomize={handleRandomize} 
          />

          {/* Custom Input */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">补充说明</h3>
            <div className="relative group">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="例如：今天排队很久但值得..."
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
              />
            </div>
          </section>

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full relative overflow-hidden rounded-2xl py-4 font-bold text-lg tracking-wide transition-all duration-300 shadow-xl ${
              isGenerating 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-500/20 active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI 正在构思...
              </span>
            ) : (
              '生成评价 ✨'
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="animate-[slideUp_0.6s_cubic-bezier(0.2,0.8,0.2,1)]">
              <div className="relative bg-white rounded-3xl p-7 shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-violet-500"></div>
                
                {/* Content */}
                <div className="font-sans text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap tracking-wide mb-6">
                  {result.text}
                </div>

                {/* Footer Stats */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-t border-slate-100 pt-5">
                  <div className="text-[10px] text-slate-400 space-y-1 font-mono">
                    <p className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      {result.model}
                    </p>
                    {result.usage && (
                      <p>Tokens: {result.usage.total_tokens}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 uppercase tracking-wider transition-all active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    复制内容
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        models={models}
        isLoadingModels={isLoadingModels}
      />
      
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}