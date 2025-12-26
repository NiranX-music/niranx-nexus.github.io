import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Bot, Sparkles, Zap, Brain, MessageSquare, Cpu, Globe, Star } from 'lucide-react';

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  models: { id: string; name: string; description?: string }[];
  requiresApiKey: boolean;
  apiKeyName?: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 models via OpenRouter',
    icon: <Bot className="h-4 w-4" />,
    models: [
      { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Most capable' },
      { id: 'openai/gpt-4', name: 'GPT-4', description: 'High quality' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast & efficient' },
    ],
    requiresApiKey: true,
    apiKeyName: 'OPENROUTER_API_KEY',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 3 models via OpenRouter',
    icon: <Brain className="h-4 w-4" />,
    models: [
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: 'Most intelligent' },
      { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced' },
      { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast' },
    ],
    requiresApiKey: true,
    apiKeyName: 'OPENROUTER_API_KEY',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Gemini Pro models via OpenRouter',
    icon: <Sparkles className="h-4 w-4" />,
    models: [
      { id: 'google/gemini-pro', name: 'Gemini Pro', description: 'Advanced reasoning' },
      { id: 'google/gemini-pro-vision', name: 'Gemini Pro Vision', description: 'With vision' },
    ],
    requiresApiKey: true,
    apiKeyName: 'OPENROUTER_API_KEY',
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference',
    icon: <Zap className="h-4 w-4" />,
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Powerful & fast' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Instant responses' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Great for code' },
    ],
    requiresApiKey: true,
    apiKeyName: 'GROQ_API_KEY',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Specialized coding model',
    icon: <Cpu className="h-4 w-4" />,
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'General purpose' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Code specialist' },
    ],
    requiresApiKey: true,
    apiKeyName: 'DEEPSEEK_API_KEY',
  },
  {
    id: 'aiml',
    name: 'AIML API',
    description: 'Various AI models',
    icon: <MessageSquare className="h-4 w-4" />,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Multimodal' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Latest Claude' },
    ],
    requiresApiKey: true,
    apiKeyName: 'AIML_API_KEY',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access 100+ models',
    icon: <Globe className="h-4 w-4" />,
    models: [
      { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', description: 'Largest open model' },
      { id: 'mistralai/mistral-large', name: 'Mistral Large', description: 'Powerful Mistral' },
      { id: 'cohere/command-r-plus', name: 'Command R+', description: 'Great for RAG' },
    ],
    requiresApiKey: true,
    apiKeyName: 'OPENROUTER_API_KEY',
  },
  {
    id: 'lovable',
    name: 'Lovable AI',
    description: 'Built-in AI (No API key needed)',
    icon: <Star className="h-4 w-4 text-yellow-500" />,
    models: [
      { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast & capable' },
      { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable' },
      { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Balanced performance' },
    ],
    requiresApiKey: false,
  },
];

interface AIProviderSelectorProps {
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (providerId: string) => void;
  onModelChange: (modelId: string) => void;
  compact?: boolean;
  label?: string;
}

export function AIProviderSelector({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  compact = false,
  label = 'AI Provider',
}: AIProviderSelectorProps) {
  const provider = AI_PROVIDERS.find((p) => p.id === selectedProvider) || AI_PROVIDERS[AI_PROVIDERS.length - 1];

  const handleProviderChange = (providerId: string) => {
    onProviderChange(providerId);
    const newProvider = AI_PROVIDERS.find((p) => p.id === providerId);
    if (newProvider && newProvider.models.length > 0) {
      onModelChange(newProvider.models[0].id);
    }
  };

  return (
    <div className={compact ? 'flex items-center gap-2' : 'space-y-3'}>
      <div className={compact ? 'flex-1' : ''}>
        {!compact && <Label className="text-sm font-medium mb-1.5 block">{label}</Label>}
        <Select value={selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger className={compact ? 'w-[180px]' : 'w-full'}>
            <SelectValue placeholder="Select provider">
              <div className="flex items-center gap-2">
                {provider.icon}
                <span>{provider.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {AI_PROVIDERS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center gap-2">
                  {p.icon}
                  <div>
                    <span className="font-medium">{p.name}</span>
                    {!compact && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {p.requiresApiKey ? '(API Key required)' : '(Free)'}
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={compact ? 'flex-1' : ''}>
        {!compact && <Label className="text-sm font-medium mb-1.5 block">Model</Label>}
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className={compact ? 'w-[200px]' : 'w-full'}>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {provider.models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div>
                  <span className="font-medium">{model.name}</span>
                  {model.description && (
                    <span className="text-xs text-muted-foreground ml-2">- {model.description}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Hook for persisting AI provider selection per feature
export function useAIProvider(featureKey: string) {
  const storageKey = `ai-provider-${featureKey}`;
  
  const getStoredSelection = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading AI provider from storage:', e);
    }
    // Default to Lovable AI
    return {
      provider: 'lovable',
      model: 'google/gemini-2.5-flash',
    };
  };

  const [selection, setSelection] = React.useState(getStoredSelection);

  const updateSelection = React.useCallback(
    (provider: string, model: string) => {
      const newSelection = { provider, model };
      setSelection(newSelection);
      try {
        localStorage.setItem(storageKey, JSON.stringify(newSelection));
      } catch (e) {
        console.error('Error saving AI provider to storage:', e);
      }
    },
    [storageKey]
  );

  return {
    provider: selection.provider,
    model: selection.model,
    setProvider: (provider: string) => {
      const providerData = AI_PROVIDERS.find((p) => p.id === provider);
      const defaultModel = providerData?.models[0]?.id || selection.model;
      updateSelection(provider, defaultModel);
    },
    setModel: (model: string) => updateSelection(selection.provider, model),
  };
}
