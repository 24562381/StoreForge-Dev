import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { validateSafeUrl, maskSensitiveLogString } from '../../common/utils/security';

const MODEL_TEMPLATE_REGEX = /%%model%%/gi;
const APIKEY_TEMPLATE_REGEX = /%%apikey%%/gi;

const DEFAULT_AI_AGENTS = [
  {
    id: 'gemini',
    name: 'Google Gemini AI',
    protocol: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    keyLabel: 'Google AI Studio Key',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyPlaceholder: 'AIzaSy...',
    models: ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'],
    selectedModel: 'gemini-2.5-flash',
    isCustom: false,
    sortOrder: 1,
  },
  {
    id: 'groq',
    name: 'Groq Cloud (Ultra Fast LLaMA 3.3)',
    protocol: 'openai',
    baseUrl: 'https://api.groq.com/openai/v1',
    keyLabel: 'Groq API Key',
    keyUrl: 'https://console.groq.com/keys',
    keyPlaceholder: 'gsk_...',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'deepseek-r1-distill-llama-70b'],
    selectedModel: 'llama-3.3-70b-versatile',
    isCustom: false,
    sortOrder: 2,
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-4o & GPT-4o-mini)',
    protocol: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    keyLabel: 'OpenAI API Key',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyPlaceholder: 'sk-proj-...',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o3-mini'],
    selectedModel: 'gpt-4o-mini',
    isCustom: false,
    sortOrder: 3,
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude (3.5 Sonnet & Haiku)',
    protocol: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    keyLabel: 'Anthropic API Key',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    keyPlaceholder: 'sk-ant-...',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    selectedModel: 'claude-3-5-sonnet-20241022',
    isCustom: false,
    sortOrder: 4,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek AI (V3 & R1)',
    protocol: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    keyLabel: 'DeepSeek API Key',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    keyPlaceholder: 'sk-...',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    selectedModel: 'deepseek-chat',
    isCustom: false,
    sortOrder: 5,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (Universal Multi-LLM)',
    protocol: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    keyLabel: 'OpenRouter API Key',
    keyUrl: 'https://openrouter.ai/keys',
    keyPlaceholder: 'sk-or-v1-...',
    models: ['google/gemini-2.5-flash', 'meta-llama/llama-3.3-70b-instruct', 'anthropic/claude-3.5-sonnet', 'deepseek/deepseek-r1'],
    selectedModel: 'google/gemini-2.5-flash',
    isCustom: false,
    sortOrder: 6,
  },
  {
    id: 'mistral',
    name: 'Mistral AI (Mistral Large & Small)',
    protocol: 'openai',
    baseUrl: 'https://api.mistral.ai/v1',
    keyLabel: 'Mistral API Key',
    keyUrl: 'https://console.mistral.ai/api-keys',
    keyPlaceholder: '...',
    models: ['mistral-large-latest', 'mistral-small-latest', 'codestral-latest'],
    selectedModel: 'mistral-small-latest',
    isCustom: false,
    sortOrder: 7,
  },
  {
    id: 'ollama',
    name: 'Ollama / Local Server',
    protocol: 'openai',
    baseUrl: 'http://localhost:11434/v1',
    keyLabel: 'API Key (Optional for Local)',
    keyUrl: 'https://ollama.com',
    keyPlaceholder: 'ollama',
    models: ['llama3.2', 'qwen2.5', 'mistral', 'deepseek-r1:8b'],
    selectedModel: 'llama3.2',
    isCustom: false,
    sortOrder: 8,
  },
];

@Injectable()
export class AiService {
  // OPTIMIZATION: In-memory cache for AI agent configurations and active default provider.
  // Minimizes DB hits during generation queries and automations.
  private agentsCache: any[] | null = null;
  private defaultProviderCache: string | null = null;
  private lastCacheTime = 0;
  private readonly CACHE_TTL_MS = 60000;

  constructor(private readonly prisma: PrismaService) {}

  private invalidateCache() {
    this.agentsCache = null;
    this.defaultProviderCache = null;
    this.lastCacheTime = 0;
  }

  private formatEndpointUrl(baseUrl: string, model = '', apiKey = '') {
    if (!baseUrl) return '';
    let url = baseUrl.trim();
    url = url.replace(MODEL_TEMPLATE_REGEX, encodeURIComponent(model || ''));
    url = url.replace(APIKEY_TEMPLATE_REGEX, encodeURIComponent(apiKey || ''));
    return url;
  }

  async getDefaultProviderId(): Promise<string> {
    const now = Date.now();
    if (this.defaultProviderCache && now - this.lastCacheTime < this.CACHE_TTL_MS) {
      return this.defaultProviderCache;
    }

    try {
      const setting = await this.prisma.setting.findUnique({
        where: { key: 'ai_default_provider' },
      });
      if (setting && setting.value) {
        this.defaultProviderCache = setting.value.trim();
        return this.defaultProviderCache;
      }
    } catch {}

    // Fallback: check if any agent has an API key configured
    try {
      const configured = await this.prisma.aiAgent.findFirst({
        where: { apiKey: { not: '' } },
        orderBy: { sortOrder: 'asc' },
      });
      if (configured) {
        this.defaultProviderCache = configured.id;
        return configured.id;
      }
    } catch {}

    this.defaultProviderCache = 'gemini';
    return 'gemini';
  }

  async setDefaultProviderId(providerId: string) {
    if (!providerId) throw new BadRequestException('Provider ID is required');
    const res = await this.prisma.setting.upsert({
      where: { key: 'ai_default_provider' },
      update: { value: providerId },
      create: {
        key: 'ai_default_provider',
        value: providerId,
        description: 'Active primary AI provider for store automations',
      },
    });
    this.invalidateCache();
    return res;
  }

  async getAllAgents() {
    const now = Date.now();
    if (this.agentsCache && now - this.lastCacheTime < this.CACHE_TTL_MS) {
      return this.agentsCache;
    }

    let agents = await this.prisma.aiAgent.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    if (agents.length === 0) {
      for (const d of DEFAULT_AI_AGENTS) {
        await this.prisma.aiAgent.create({ data: d });
      }
      agents = await this.prisma.aiAgent.findMany({
        orderBy: { sortOrder: 'asc' },
      });
    }

    const defaultProviderId = await this.getDefaultProviderId();

    const result = agents.map((agent) => ({
      ...agent,
      isPrimary: agent.id === defaultProviderId,
    }));

    this.agentsCache = result;
    this.lastCacheTime = now;
    return result;
  }

  async updateAgent(id: string, data: any) {
    if (data.baseUrl) {
      try {
        validateSafeUrl(data.baseUrl);
      } catch (err: any) {
        throw new BadRequestException(err.message || 'Invalid baseUrl');
      }
    }
    const res = await this.prisma.aiAgent.update({
      where: { id },
      data: {
        name: data.name,
        protocol: data.protocol,
        apiKey: data.apiKey ?? '',
        baseUrl: data.baseUrl ?? '',
        models: data.models,
        selectedModel: data.selectedModel,
        sortOrder: data.sortOrder,
      },
    });
    this.invalidateCache();
    return res;
  }

  async createAgent(data: any) {
    if (data.baseUrl) {
      try {
        validateSafeUrl(data.baseUrl);
      } catch (err: any) {
        throw new BadRequestException(err.message || 'Invalid baseUrl');
      }
    }
    const agentId = data.id
      ? data.id.toLowerCase().replace(/[^a-z0-9_-]/g, '_')
      : `custom_${Date.now()}`;

    const res = await this.prisma.aiAgent.create({
      data: {
        id: agentId,
        name: data.name || 'Custom AI Provider',
        protocol: data.protocol || 'openai',
        apiKey: data.apiKey || '',
        baseUrl: data.baseUrl || '',
        keyLabel: data.keyLabel || 'API Key',
        keyUrl: data.keyUrl || '',
        keyPlaceholder: data.keyPlaceholder || 'Enter API Key...',
        models: data.models || ['default-model'],
        selectedModel: data.selectedModel || 'default-model',
        isCustom: true,
        sortOrder: data.sortOrder || 20,
      },
    });
    this.invalidateCache();
    return res;
  }

  async deleteAgent(id: string) {
    const res = await this.prisma.aiAgent.delete({ where: { id } });
    this.invalidateCache();
    return res;
  }

  private async callSingleProvider(agent: {
    id: string;
    protocol: string;
    apiKey: string;
    baseUrl: string;
    selectedModel: string;
  }, options: {
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
  }) {
    let { protocol, apiKey, baseUrl, selectedModel } = agent;
    const { prompt, systemInstruction = '', temperature = 0.2 } = options;

    if (!protocol) {
      if (baseUrl?.includes('googleapis.com')) protocol = 'gemini';
      else if (baseUrl?.includes('anthropic.com')) protocol = 'anthropic';
      else if (baseUrl?.includes('cohere.com')) protocol = 'cohere';
      else protocol = 'openai';
    }

    if (!selectedModel) {
      selectedModel = protocol === 'gemini' ? 'gemini-2.5-flash' : 'llama-3.3-70b-versatile';
    }

    let url = baseUrl || '';
    if (url.includes('%%model%%') || url.includes('%%apikey%%')) {
      url = this.formatEndpointUrl(url, selectedModel, apiKey);
    } else if (protocol === 'gemini') {
      if (!url) {
        url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      } else if (!url.includes('generateContent') && !url.includes(':generateContent')) {
        url = `${url.replace(/\/+$/, '')}/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      }
    } else if (protocol === 'cohere') {
      url = url || 'https://api.cohere.com/v2/chat';
    } else if (protocol === 'anthropic') {
      url = url || 'https://api.anthropic.com/v1/messages';
    } else {
      if (!url) {
        url = 'https://api.groq.com/openai/v1/chat/completions';
      } else {
        url = url.replace(/\/+$/, '');
        if (!url.endsWith('/chat/completions')) {
          url = `${url}/chat/completions`;
        }
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey && !url.includes(encodeURIComponent(apiKey)) && !baseUrl.includes('%%apikey%%')) {
      if (protocol === 'anthropic') {
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
      } else {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
    }

    let requestBody: any;
    if (protocol === 'gemini') {
      requestBody = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: 'application/json', temperature },
      };
    } else if (protocol === 'anthropic') {
      requestBody = {
        model: selectedModel,
        system: systemInstruction,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: 4096,
      };
    } else if (protocol === 'cohere') {
      requestBody = {
        model: selectedModel,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      };
    } else {
      requestBody = {
        model: selectedModel,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt },
        ],
        temperature,
        response_format: { type: 'json_object' },
      };
    }

    try {
      validateSafeUrl(url);
    } catch (err: any) {
      throw new BadRequestException(err.message || 'SSRF Blocked: Invalid or forbidden destination URL');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
      throw new Error(`[${agent.id}/${selectedModel}] ${msg}`);
    }

    const data = await response.json();
    let rawText = '';
    if (data.choices?.[0]?.message?.content) {
      rawText = data.choices[0].message.content;
    } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      rawText = data.candidates[0].content.parts[0].text;
    } else if (Array.isArray(data.content) && data.content[0]?.text) {
      rawText = data.content[0].text;
    } else if (data.message?.content?.[0]?.text) {
      rawText = data.message.content[0].text;
    }

    return this.cleanAndParseJson(rawText);
  }

  async executeAiCompletion(options: {
    provider?: string;
    apiKey?: string;
    model?: string;
    customBaseUrl?: string;
    protocol?: string;
    systemInstruction?: string;
    prompt: string;
    temperature?: number;
  }) {
    const { prompt, systemInstruction, temperature = 0.2 } = options;

    if (options.customBaseUrl) {
      try {
        validateSafeUrl(options.customBaseUrl);
      } catch (err: any) {
        throw new BadRequestException(err.message || 'Invalid customBaseUrl');
      }
    }

    // If ad-hoc credentials were provided directly (e.g. testing in settings), run with those
    if (options.apiKey || (options.customBaseUrl && options.customBaseUrl.includes('localhost'))) {
      return this.callSingleProvider(
        {
          id: options.provider || 'custom',
          protocol: options.protocol || 'openai',
          apiKey: options.apiKey || '',
          baseUrl: options.customBaseUrl || '',
          selectedModel: options.model || '',
        },
        { prompt, systemInstruction, temperature },
      ).catch((err) => {
        throw new BadRequestException(err.message || 'AI generation failed');
      });
    }

    // Determine candidate provider list for resilient failover
    const defaultId = await this.getDefaultProviderId();
    const primaryId = options.provider && options.provider !== 'default' ? options.provider : defaultId;

    const allAgents = await this.prisma.aiAgent.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    // Sort providers so the primary candidate is first, followed by other configured providers
    const candidates = [
      ...allAgents.filter((a) => a.id === primaryId),
      ...allAgents.filter((a) => a.id !== primaryId && (a.apiKey || a.baseUrl?.includes('localhost'))),
    ];

    if (candidates.length === 0) {
      throw new BadRequestException(
        'No AI Provider has an API Key configured. Please go to Admin Settings -> AI Multi-Agent Studio to configure at least one AI provider.',
      );
    }

    const errors: string[] = [];
    for (const candidate of candidates) {
      try {
        const result = await this.callSingleProvider(
          {
            id: candidate.id,
            protocol: candidate.protocol,
            apiKey: candidate.apiKey || '',
            baseUrl: candidate.baseUrl || '',
            selectedModel: candidate.selectedModel || '',
          },
          { prompt, systemInstruction, temperature },
        );
        return result;
      } catch (err: any) {
        const safeErr = maskSensitiveLogString(err.message || String(err));
        errors.push(safeErr);
        console.warn(`[AI Failover] Provider "${candidate.id}" failed: ${safeErr}. Trying next available provider...`);
      }
    }

    throw new BadRequestException(
      `All configured AI providers failed:\n${errors.join('\n')}`,
    );
  }

  private cleanAndParseJson(rawText: string) {
    let text = String(rawText || '').trim();
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    }

    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      text = match[0];
    }

    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        if (!('text' in parsed)) {
          parsed.text = rawText;
        }
      }
      return parsed;
    } catch {
      return { raw: rawText, text: rawText };
    }
  }

  async translateText(data: { text?: string; targetLang?: string; sourceLang?: string }) {
    const text = data?.text || '';
    const targetLang = data?.targetLang === 'en' ? 'English' : 'Bengali (বাংলা)';
    if (!text.trim()) {
      return { translatedText: '' };
    }
    const systemInstruction = `You are a professional luxury e-commerce localization expert. Translate the user's text into natural, fluent, elegant ${targetLang}. Return strictly a JSON object: {"translatedText": "..."}`;
    const prompt = `Translate this text into ${targetLang}:\n"${text}"`;
    const result: any = await this.executeAiCompletion({ prompt, systemInstruction, temperature: 0.2 });
    return {
      translatedText: result?.translatedText || (typeof result?.text === 'string' ? result.text.trim() : (typeof result?.raw === 'string' ? result.raw.trim() : text)),
    };
  }

  async translateProduct(data: any) {
    const systemInstruction = `You are a professional luxury e-commerce localization expert. Translate product info from Bengali to English. Return JSON schema: {"name_en": "", "tagline_en": "", "short_description_en": "", "full_description_en": "", "warning_text_en": ""}`;
    const prompt = `Translate to English: ${JSON.stringify(data)}`;
    return this.executeAiCompletion({ prompt, systemInstruction });
  }

  async proofreadProduct(data: any) {
    const systemInstruction = `You are an elite bilingual copywriter and master proofreader specialized in luxury handcrafted wooden decor and lifestyle e-commerce.
Your mission is to perform simultaneous dual AI proofreading, grammar correction, vocabulary polishing, and luxury tone refinement for BOTH English and Bengali (বাংলা) copy.

Key Guidelines:
1. Fix all typos, grammatical mistakes, awkward phrasing, and punctuation in BOTH English and Bengali text.
2. Elevate the tone to be sophisticated, prestigious, evocative, and compelling.
3. If Bengali fields are provided, refine them to sound poetic and natural in native Bengali. If empty, generate faithful, eloquent Bengali translations.
4. In 'fullDescription' and 'fullDescriptionBn', preserve and properly structure valid HTML tags (<p>, <strong>, <em>, <ul>, <li>, <h3>, etc.).
5. For the 'features' array, proofread all items (title, titleBn, description, descriptionBn).
6. Always return strictly valid JSON matching this schema:
{
  "name": "...",
  "nameBn": "...",
  "tagline": "...",
  "taglineBn": "...",
  "shortDescription": "...",
  "shortDescriptionBn": "...",
  "fullDescription": "...",
  "fullDescriptionBn": "...",
  "warningText": "...",
  "warningTextBn": "...",
  "features": [
    { "title": "...", "titleBn": "...", "description": "...", "descriptionBn": "..." }
  ]
}`;
    const prompt = `Simultaneously proofread, polish, and harmonize the following product content in English and Bengali:\n${JSON.stringify(data, null, 2)}`;
    return this.executeAiCompletion({ prompt, systemInstruction, temperature: 0.3 });
  }
}
