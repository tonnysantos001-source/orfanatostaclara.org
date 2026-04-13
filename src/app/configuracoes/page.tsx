"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Eye, EyeOff, Loader2, Save } from "lucide-react";

interface ApiSetting {
  id: string;
  key: string;
  value: string; // always masked on the client side
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SUGGESTED_KEYS = [
  { key: "SERASA_API_KEY", description: "Chave da API Serasa Experian" },
  { key: "SPC_API_KEY", description: "Chave da API SPC Brasil" },
  { key: "ANTIFRAUDE_API_KEY", description: "Chave do serviço Antifraude" },
  { key: "BIGDATA_API_KEY", description: "Chave BigData Corp" },
  { key: "RECEITA_API_KEY", description: "Chave da API Receita Federal" },
];

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<ApiSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New setting form
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [showValue, setShowValue] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      setSettings(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!newKey.trim() || !newValue.trim()) {
      setFormError("Chave e valor são obrigatórios.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newKey.trim().toUpperCase(),
          value: newValue.trim(),
          description: newDescription.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setFormError(json.error ?? "Erro ao salvar.");
        return;
      }
      setFormSuccess("Configuração salva com sucesso!");
      setNewKey("");
      setNewValue("");
      setNewDescription("");
      await fetchSettings();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(key: string) {
    if (!confirm(`Remover a chave "${key}"?`)) return;
    await fetch(`/api/settings?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
    });
    await fetchSettings();
  }

  return (
    <div className="page-container">
      {/* Add New Setting */}
      <div className="card">
        <h2 className="card-title">
          <Plus size={18} /> Adicionar Configuração de API
        </h2>
        <form onSubmit={handleSave} className="settings-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Chave</label>
              <input
                list="suggested-keys"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                className="form-input"
                placeholder="SERASA_API_KEY"
                id="settings-key"
              />
              <datalist id="suggested-keys">
                {SUGGESTED_KEYS.map((k) => (
                  <option key={k.key} value={k.key} label={k.description} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label">Valor (será criptografado)</label>
              <div className="login-input-wrapper">
                <input
                  type={showValue ? "text" : "password"}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="form-input"
                  placeholder="••••••••••••••••"
                  id="settings-value"
                />
                <button
                  type="button"
                  onClick={() => setShowValue((v) => !v)}
                  className="input-icon-btn"
                >
                  {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group form-col-2">
              <label className="form-label">Descrição (opcional)</label>
              <input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="form-input"
                placeholder="Ex: Chave de produção da Serasa"
                id="settings-description"
              />
            </div>
          </div>

          {formError && <div className="form-api-error">{formError}</div>}
          {formSuccess && <div className="form-success">{formSuccess}</div>}

          <button
            type="submit"
            disabled={saving}
            className="btn-analisar"
            id="btn-save-setting"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />
                Salvar Configuração
              </>
            )}
          </button>
        </form>
      </div>

      {/* Existing Settings */}
      <div className="card">
        <h2 className="card-title">Configurações Salvas</h2>
        {loading ? (
          <div className="table-loading">
            <Loader2 size={20} className="animate-spin" /> Carregando...
          </div>
        ) : settings.length === 0 ? (
          <p className="empty-state">
            Nenhuma chave configurada ainda. Adicione acima.
          </p>
        ) : (
          <div className="settings-list">
            {settings.map((s) => (
              <div key={s.id} className="setting-item">
                <div className="setting-item-info">
                  <div className="setting-key">{s.key}</div>
                  <div className="setting-value">{s.value}</div>
                  {s.description && (
                    <div className="setting-description">{s.description}</div>
                  )}
                </div>
                <div className="setting-item-actions">
                  <span
                    className={`status-dot ${s.isActive ? "status-active" : "status-inactive"}`}
                  >
                    {s.isActive ? "Ativo" : "Inativo"}
                  </span>
                  <button
                    onClick={() => handleDelete(s.key)}
                    className="btn-delete"
                    title="Remover"
                    id={`btn-delete-${s.key}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plugin Status */}
      <div className="card">
        <h2 className="card-title">Status dos Plugins</h2>
        <div className="plugins-grid">
          {[
            {
              name: "Serasa Experian",
              key: "SERASA_API_KEY",
              status: "Não configurado",
            },
            {
              name: "SPC Brasil",
              key: "SPC_API_KEY",
              status: "Não configurado",
            },
            {
              name: "Antifraude",
              key: "ANTIFRAUDE_API_KEY",
              status: "Não configurado",
            },
          ].map((plugin) => {
            const configured = settings.some(
              (s) => s.key === plugin.key && s.isActive
            );
            return (
              <div key={plugin.key} className="plugin-card">
                <div className="plugin-name">{plugin.name}</div>
                <span
                  className={`status-dot ${configured ? "status-active" : "status-inactive"}`}
                >
                  {configured ? "Configurado" : plugin.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
