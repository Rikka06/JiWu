
export const DEFAULT_API_KEY = 'sk-hhpxxelodcqeusliiavhonhbohljpbckhfsyrkkbyrjcgdwb';
export const API_BASE_URL = 'https://api.siliconflow.cn/v1';

export const DEFAULT_MODEL = 'deepseek-ai/DeepSeek-V3.2-Exp';

export const VISION_MODELS = [
  'Qwen/Qwen3-VL-32B-Instruct',
  'Qwen/Qwen3-VL-32B-Thinking',
  'Qwen/Qwen3-VL-8B-Instruct',
  'Qwen/Qwen3-VL-8B-Thinking',
  'Qwen/Qwen3-VL-30B-A3B-Instruct',
  'Qwen/Qwen3-VL-30B-A3B-Thinking',
  'Qwen/Qwen3-VL-235B-A22B-Instruct',
  'Qwen/Qwen3-VL-235B-A22B-Thinking',
  'Qwen/Qwen3-Omni-30B-A3B-Instruct',
  'Qwen/Qwen3-Omni-30B-A3B-Thinking',
  'Qwen/Qwen3-Omni-30B-A3B-Captioner',
  'deepseek-ai/DeepSeek-OCR',
  'zai-org/GLM-4.5V',
  'stepfun-ai/step3',
  'THUDM/GLM-4.1V-9B-Thinking',
  'Pro/THUDM/GLM-4.1V-9B-Thinking',
  'Qwen/Qwen2.5-VL-32B-Instruct',
  'Qwen/Qwen2.5-VL-72B-Instruct',
  'Pro/Qwen/Qwen2.5-VL-7B-Instruct',
  'Qwen/QVQ-72B-Preview',
  'Qwen/Qwen2-VL-72B-Instruct',
  'deepseek-ai/deepseek-vl2'
];

export const FALLBACK_MODELS = [
  { id: 'deepseek-ai/DeepSeek-V3.2-Exp', object: 'model', created: 1700000000, owned_by: 'deepseek' },
  { id: 'deepseek-ai/DeepSeek-V3', object: 'model', created: 1700000000, owned_by: 'deepseek' },
  { id: 'Qwen/Qwen2.5-72B-Instruct', object: 'model', created: 1700000000, owned_by: 'alibaba' },
  { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', object: 'model', created: 1700000000, owned_by: 'alibaba' },
  { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct', object: 'model', created: 1700000000, owned_by: 'meta' }
];
