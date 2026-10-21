'use client';

import React, { useState, useCallback } from 'react';
import {
  Sparkles,
  Zap,
  Bot,
  Plus,
  Trash2,
  Edit,
  Save,
  RefreshCw,
  Star,
  ExternalLink,
  Check,
  X,
  Send,
  Eye,
  EyeOff,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';

export interface AiAgent {
  id: string;
  name: string;
  protocol: string;
  apiKey?: string;
  baseUrl?: string;
  keyUrl?: string;
  keyLabel?: string;
  keyPlaceholder?: string;
  models?: string[];
  selectedModel?: string;
  isCustom?: boolean;
  isPrimary?: boolean;
  sortOrder?: number;
}

interface AiStudioSectionProps {
  aiAgents: AiAgent[];
  setAiAgents: React.Dispatch<React.SetStateAction<AiAgent[]>>;
  loadAiAgents: () => Promise<void>;
}

export const AiStudioSection = React.memo(function AiStudioSection({ aiAgents, setAiAgents, loadAiAgents }: AiStudioSectionProps) {
  const { showSuccess, showError, showWarning, showConfirm } = useAdminModal();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('gemini');
  const [agentForm, setAgentForm] = useState<Partial<AiAgent>>({});
  const [testPrompt, setTestPrompt] = useState('Write a 1-sentence luxury description of a wooden world map.');
  const [testResponse, setTestResponse] = useState<string>('');
  const [testingAi, setTestingAi] = useState(false);
  const [savingAgent, setSavingAgent] = useState(false);
  const [showAiKey, setShowAiKey] = useState(false);
  const [newModelInput, setNewModelInput] = useState('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Custom AI Provider Creator State
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [customForm, setCustomForm] = useState({
    id: '',
    name: '',
    protocol: 'openai',
    baseUrl: '',
    apiKey: '',
    models: '',
    selectedModel: '',
  });

  const handleAgentSelect = useCallback((agentId: string) => {
    setSelectedAgentId(agentId);
    const agent = aiAgents.find((a) => a.id === agentId);
    if (agent) {
      setAgentForm(agent);
      setTestResponse('');
      setNewModelInput('');
    }
  }, [aiAgents]);

  const handleOpenConfigModal = useCallback((agentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedAgentId(agentId);
    const agent = aiAgents.find((a) => a.id === agentId);
    if (agent) {
      setAgentForm({ ...agent });
      setTestResponse('');
      setNewModelInput('');
    }
    setIsConfigModalOpen(true);
  }, [aiAgents]);

  const handleAgentFormChange = useCallback((key: keyof AiAgent, value: any) => {
    setAgentForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSelectPrimary = useCallback((providerId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedAgentId(providerId);
    setAiAgents((prev) =>
      prev.map((a) => ({
        ...a,
        isPrimary: a.id === providerId,
      }))
    );
    const agent = aiAgents.find((a) => a.id === providerId);
    if (agent) {
      setAgentForm({ ...agent, isPrimary: true });
      setTestResponse('');
      setNewModelInput('');
    }
  }, [aiAgents, setAiAgents]);

  const handleSaveAllAi = useCallback(async () => {
    if (!selectedAgentId) return;
    setSavingAgent(true);
    try {
      await fetchApi(`/ai/agents/${selectedAgentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentForm),
      });

      if (agentForm.isPrimary) {
        await fetchApi('/ai/default-provider', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId: selectedAgentId }),
        });
      }

      await loadAiAgents();
      setIsConfigModalOpen(false);
      showSuccess(`✨ AI Provider "${agentForm.name || selectedAgentId}" settings saved successfully!`);
    } catch (err: any) {
      showError(err.message || 'Failed to save AI configuration');
    } finally {
      setSavingAgent(false);
    }
  }, [selectedAgentId, agentForm, loadAiAgents, showSuccess, showError]);

  const handleAddModelToAgent = useCallback(() => {
    const trimmed = newModelInput.trim();
    if (!trimmed) return;
    const currentModels = Array.isArray(agentForm.models) ? [...agentForm.models] : [];
    if (!currentModels.includes(trimmed)) {
      currentModels.push(trimmed);
      setAgentForm((prev) => ({
        ...prev,
        models: currentModels,
        selectedModel: prev.selectedModel || trimmed,
      }));
      setNewModelInput('');
    }
  }, [newModelInput, agentForm.models]);

  const handleDeleteModelFromAgent = useCallback((modelToDelete: string) => {
    const currentModels = Array.isArray(agentForm.models) ? agentForm.models : [];
    const updated = currentModels.filter((m) => m !== modelToDelete);
    setAgentForm((prev) => ({
      ...prev,
      models: updated,
      selectedModel: prev.selectedModel === modelToDelete ? (updated[0] || '') : prev.selectedModel,
    }));
  }, [agentForm.models]);

  const handleCreateCustomProvider = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.name.trim()) {
      showWarning('Please enter a Provider Name');
      return;
    }
    setCreatingCustom(true);
    try {
      const modelsList = customForm.models
        ? customForm.models.split(',').map((m) => m.trim()).filter(Boolean)
        : [customForm.selectedModel.trim() || 'default-model'];
      const selModel = customForm.selectedModel.trim() || modelsList[0] || 'default-model';

      const created = await fetchApi('/ai/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: customForm.id.trim() || undefined,
          name: customForm.name.trim(),
          protocol: customForm.protocol,
          baseUrl: customForm.baseUrl.trim(),
          apiKey: customForm.apiKey.trim(),
          models: modelsList,
          selectedModel: selModel,
          keyLabel: 'API Key',
          keyPlaceholder: 'Enter API Key...',
        }),
      });

      setIsAddingCustom(false);
      setCustomForm({
        id: '',
        name: '',
        protocol: 'openai',
        baseUrl: '',
        apiKey: '',
        models: '',
        selectedModel: '',
      });
      await loadAiAgents();
      if (created?.id) {
        handleAgentSelect(created.id);
      }
      showSuccess('Custom AI Provider added successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to create AI provider');
    } finally {
      setCreatingCustom(false);
    }
  }, [customForm, loadAiAgents, handleAgentSelect, showWarning, showSuccess, showError]);

  const handleDeleteProvider = useCallback(async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await showConfirm(`Are you sure you want to remove the "${name}" AI provider?`, {
      title: 'Remove AI Provider',
      confirmText: 'Remove Provider',
      confirmVariant: 'danger',
    });
    if (!confirmed) return;
    try {
      await fetchApi(`/ai/agents/${id}`, { method: 'DELETE' });
      await loadAiAgents();
      showSuccess(`AI Provider "${name}" removed.`);
    } catch (err: any) {
      showError(err.message || 'Failed to delete provider');
    }
  }, [showConfirm, loadAiAgents, showSuccess, showError]);

  const handleTestAi = useCallback(async () => {
    if (!testPrompt.trim()) return;
    setTestingAi(true);
    setTestResponse('');
    try {
      const res = await fetchApi('/ai/complete', {
        method: 'POST',
        body: JSON.stringify({
          provider: selectedAgentId,
          apiKey: agentForm.apiKey,
          model: agentForm.selectedModel,
          customBaseUrl: agentForm.baseUrl,
          protocol: agentForm.protocol,
          prompt: testPrompt,
          systemInstruction: 'You are a helpful e-commerce AI assistant. Output JSON with a "response" field.',
        }),
      });
      setTestResponse(
        typeof res === 'object'
          ? JSON.stringify(res, null, 2)
          : String(res)
      );
    } catch (err: any) {
      setTestResponse(`❌ Error: ${err.message || 'AI generation failed'}`);
    } finally {
      setTestingAi(false);
    }
  }, [testPrompt, selectedAgentId, agentForm.apiKey, agentForm.selectedModel, agentForm.baseUrl, agentForm.protocol]);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Multi-Agent AI Studio & Provider Hub</h2>
            <p className="text-xs text-slate-500">
              Configure Google Gemini, OpenAI, Claude, DeepSeek, Ollama, and custom AI endpoints
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAddingCustom(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-purple-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom AI Provider</span>
          </button>
        </div>
      </div>

      {/* Redundancy Banner */}
      <div className="p-3.5 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 rounded-xl border border-purple-200/70 flex items-start gap-3">
        <Zap className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-950 space-y-0.5">
          <p className="font-bold">Intelligent Multi-Provider Redundancy & Auto-Failover</p>
          <p className="text-purple-800 text-[11px] leading-relaxed">
            The active provider marked with <span className="font-bold text-amber-700">⭐ Primary</span> will be used for all store operations. If that provider goes offline, encounters rate limits, or is unavailable, the system automatically falls back to your other configured AI providers in real-time.
          </p>
        </div>
      </div>

      {/* Custom AI Provider Creator Form Modal / Card */}
      {isAddingCustom && (
        <form onSubmit={handleCreateCustomProvider} className="p-5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-purple-200/60 pb-2.5">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
              <Plus className="w-4 h-4 text-purple-600" />
              <span>Create New Custom AI Provider / Endpoint</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Provider Display Name *</label>
              <input
                type="text"
                required
                value={customForm.name}
                onChange={(e) => setCustomForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Together AI / Mistral Cloud"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Protocol / API Compatibility</label>
              <select
                value={customForm.protocol}
                onChange={(e) => setCustomForm((p) => ({ ...p, protocol: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-purple-600 font-mono"
              >
                <option value="openai">OpenAI Compatible (Default / v1)</option>
                <option value="gemini">Google Gemini Protocol</option>
                <option value="anthropic">Anthropic Claude Protocol</option>
                <option value="cohere">Cohere Chat Protocol</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Base URL / Endpoint</label>
              <input
                type="text"
                value={customForm.baseUrl}
                onChange={(e) => setCustomForm((p) => ({ ...p, baseUrl: e.target.value }))}
                placeholder="e.g. https://api.together.xyz/v1"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">API Key</label>
              <input
                type="password"
                value={customForm.apiKey}
                onChange={(e) => setCustomForm((p) => ({ ...p, apiKey: e.target.value }))}
                placeholder="sk-..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Models (comma-separated)</label>
              <input
                type="text"
                value={customForm.models}
                onChange={(e) => setCustomForm((p) => ({ ...p, models: e.target.value }))}
                placeholder="model-1, model-2, model-3"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Default Model Identifier</label>
              <input
                type="text"
                value={customForm.selectedModel}
                onChange={(e) => setCustomForm((p) => ({ ...p, selectedModel: e.target.value }))}
                placeholder="e.g. model-1"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-purple-200/60">
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-white text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingCustom}
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {creatingCustom ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Register Provider</span>
            </button>
          </div>
        </form>
      )}

      {/* AI Providers Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Available AI Providers ({aiAgents.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Click <span className="font-bold text-purple-700">Edit</span> to configure API keys, models, & settings in popup
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {aiAgents.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            const hasKey = Boolean(agent.apiKey || agent.baseUrl?.includes('localhost'));
            const isPrimary = Boolean(agent.isPrimary);

            return (
              <div
                key={agent.id}
                onClick={() => handleOpenConfigModal(agent.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                  isPrimary
                    ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400 shadow-2xs'
                    : isSelected
                    ? 'border-purple-300 bg-purple-50/40 hover:border-purple-400 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-600 uppercase">
                      {agent.protocol}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isPrimary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold shadow-2xs">
                          <Star className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                          <span>Primary</span>
                        </span>
                      )}
                      {hasKey ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          No Key
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 truncate mb-0.5">{agent.name}</h4>
                  <p className="text-[11px] text-slate-600 font-mono truncate">
                    {agent.selectedModel || 'No model chosen'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {Array.isArray(agent.models) ? `${agent.models.length} models available` : '0 models'}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-[11px]">
                  <button
                    type="button"
                    onClick={(e) => handleSelectPrimary(agent.id, e)}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1 ${
                      isPrimary
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    <Star className={`w-2.5 h-2.5 ${isPrimary ? 'fill-amber-600 text-amber-600' : 'text-slate-400'}`} />
                    <span>{isPrimary ? 'Primary' : 'Set Primary'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {agent.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteProvider(agent.id, agent.name, e)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete custom provider"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleOpenConfigModal(agent.id, e)}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Provider Configuration Popup Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 bg-white border-b border-slate-200">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Configure: {agentForm.name || selectedAgentId}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-mono font-bold uppercase">
                      {agentForm.protocol}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Manage credentials, model deletion, and real-time generation tests
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/50">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(agentForm.isPrimary)}
                    onChange={(e) => {
                      handleAgentFormChange('isPrimary', e.target.checked);
                      if (e.target.checked) {
                        setAiAgents((prev) =>
                          prev.map((a) => ({ ...a, isPrimary: a.id === selectedAgentId }))
                        );
                      }
                    }}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Star className={`w-3.5 h-3.5 ${agentForm.isPrimary ? 'text-amber-600 fill-amber-600' : 'text-slate-400'}`} />
                    <span>Set as Primary Default</span>
                  </span>
                </label>

                {agentForm.keyUrl && (
                  <a
                    href={agentForm.keyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 hover:border-purple-300 text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Get API Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Provider Name</label>
                  <input
                    type="text"
                    value={agentForm.name || ''}
                    onChange={(e) => handleAgentFormChange('name', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-purple-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Protocol / Compatibility</label>
                  <select
                    value={agentForm.protocol || 'openai'}
                    onChange={(e) => handleAgentFormChange('protocol', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600 shadow-2xs"
                  >
                    <option value="gemini">Google Gemini Protocol (generateContent)</option>
                    <option value="openai">OpenAI Compatible (chat/completions)</option>
                    <option value="anthropic">Anthropic Claude Protocol (v1/messages)</option>
                    <option value="cohere">Cohere Chat Protocol (v2/chat)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {agentForm.keyLabel || 'API Key'}
                  </label>
                  <div className="relative">
                    <input
                      type={showAiKey ? 'text' : 'password'}
                      value={agentForm.apiKey || ''}
                      onChange={(e) => handleAgentFormChange('apiKey', e.target.value)}
                      placeholder={agentForm.keyPlaceholder || 'Enter API Key...'}
                      className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAiKey(!showAiKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showAiKey ? 'Hide key' : 'Show key'}
                    >
                      {showAiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Custom Base URL / API Endpoint (Optional for Official Cloud APIs)
                  </label>
                  <input
                    type="text"
                    value={agentForm.baseUrl || ''}
                    onChange={(e) => handleAgentFormChange('baseUrl', e.target.value)}
                    placeholder="e.g. https://api.openai.com/v1 or http://localhost:11434/v1"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-purple-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Models Management Section */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Manage Models & Active Selection
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {Array.isArray(agentForm.models) ? `${agentForm.models.length} models available` : '0 models'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Active Model for Generations:
                  </label>
                  {Array.isArray(agentForm.models) && agentForm.models.length > 0 ? (
                    <select
                      value={agentForm.selectedModel || ''}
                      onChange={(e) => handleAgentFormChange('selectedModel', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600"
                    >
                      {agentForm.models.map((m) => (
                        <option key={m} value={m}>
                          {m} {m === agentForm.selectedModel ? '(Active Default)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={agentForm.selectedModel || ''}
                      onChange={(e) => handleAgentFormChange('selectedModel', e.target.value)}
                      placeholder="Model identifier (e.g. gpt-4o)"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600"
                    />
                  )}
                </div>

                {Array.isArray(agentForm.models) && agentForm.models.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                      Configured Models (Click to set active, or ✕ to delete):
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {agentForm.models.map((m) => {
                        const isActive = agentForm.selectedModel === m;
                        return (
                          <div
                            key={m}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                              isActive
                                ? 'bg-purple-100 text-purple-900 border border-purple-300 font-bold ring-1 ring-purple-400 shadow-2xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span
                              onClick={() => handleAgentFormChange('selectedModel', m)}
                              className="cursor-pointer hover:underline flex items-center gap-1"
                              title="Click to select this model"
                            >
                              {isActive && <Check className="w-3 h-3 text-purple-700" />}
                              {m}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteModelFromAgent(m)}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-0.5 rounded transition-colors cursor-pointer"
                              title={`Delete model ${m}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newModelInput}
                    onChange={(e) => setNewModelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddModelToAgent();
                      }
                    }}
                    placeholder="Add custom model identifier (e.g. deepseek-r1)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddModelToAgent}
                    className="px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Model</span>
                  </button>
                </div>
              </div>

              {/* Live AI Test Console */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    ⚡ Live AI Test Console ({agentForm.name || selectedAgentId})
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Tests credentials with "{agentForm.selectedModel || 'active model'}"
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Enter test prompt..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={handleTestAi}
                    disabled={testingAi}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shrink-0"
                  >
                    {testingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{testingAi ? 'Testing...' : 'Test Model'}</span>
                  </button>
                </div>

                {testResponse && (
                  <div className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-40 border border-slate-800 animate-in fade-in duration-200">
                    <pre className="whitespace-pre-wrap">{testResponse}</pre>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 bg-white border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAllAi}
                disabled={savingAgent}
                className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {savingAgent ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save AI Configuration</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AiStudioSection;
