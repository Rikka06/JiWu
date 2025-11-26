
export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface TagState {
  persona: string; // 基础属性 (身份/年龄)
  motivation: string; // 消费动机
  people: number; // 用餐人数
  wordCount: number; // 字数限制
  budget: string; // 预算偏好
  focus: string; // 需求偏好
  mood: string; // 顾客心情
  stars: number;
  style: string; // 评价语气
  dishes: string[];
  useEmoji: boolean; // 是否使用表情
  structure: 'paragraph' | 'segmented'; // 结构：一段式 vs 分段
}

export interface ApiUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export interface GeneratedResult {
  text: string;
  model: string;
  usage?: ApiUsage;
}

// 一、基础属性（客观）
export const PERSONAS = [
  '学生党 (18-22)', 
  '年轻职场 (23-30)', 
  '成熟白领 (30-40)', 
  '小家庭 (带娃)', 
  '家庭客 (长辈局)', 
  '年轻情侣', 
  '老饕/探店党', 
  '游客'
];

// 二、消费动机（为什么来）
export const MOTIVATIONS = [
  '单纯想吃肉', 
  '朋友推荐', 
  '网红店慕名', 
  '约会气氛', 
  '公司聚餐', 
  '逛街顺路', 
  '想吃品质肉', 
  '尝新/特色',
  '周末外出吃饭'
];

// 三、需求偏好（关注什么）
export const FOCUS_POINTS = [
  '性价比高', 
  '肉质口感', 
  '服务态度', 
  '环境氛围', 
  '拍照出片', 
  '上菜速度', 
  '日式风格', 
  '卫生状况',
  '味道适口性'
];

// 四、预算偏好 (New)
export const BUDGETS = [
  '追求性价比',
  '普通预算',
  '品质优先',
  '不差钱/随便点'
];

// 五、顾客心情
export const MOODS = [
  '开心约会', 
  '期待已久', 
  '难得一聚', 
  '下班放松', 
  '极度解馋', 
  '心情一般', 
  '轻松惬意'
];

// 六、常见“真实评价语气”类型
export const STYLES = [
  '理性客观 (细节控)', 
  '随口一说 (生活化)', 
  '挑剔毒舌 (真实感)', 
  '惊喜感叹 (超预期)', 
  '中立偏好 (像真人)', 
  '拍照党 (颜控)', 
  '纯肉食党'
];

export const DISHES = [
  '鮨牛首创心头肉',
  '魔王腹肉',
  '爆汁牛肋条',
  '薄烧肥牛',
  '澳洲雪花肥牛',
  '半米牛五花',
  '薄烧雪花板腱',
  '鮨牛极佳小排',
  '蒜香一口牛',
  '厚切猪五花',
  '黑豚五花肉',
  '葱香松板肉',
  '鮨牛秘制鸡腿肉',
  '安格斯牛肉肠',
  '台湾墨鱼肠',
  '盐烤大虾',
  '麻辣鲜蛤',
  '迷你小汉堡',
  '冰淇淋面包',
  '胡麻豆腐',
  '味付藤椒鱼皮',
  '鮨牛肥牛盖饭',
  '鮨牛牛肉酱拌饭',
  '豚骨拉面',
  '辣牛肉汤'
];