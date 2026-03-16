import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, FileText, Mail, User } from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import { supabase } from "../supabase";

const emptyForm = {
  ownerName: "",
  storeName: "",
  docId: "",
  email: "",
  password: "",
  confirmPassword: ""
};

const normalizeDoc = (value) => value.replace(/[^\d]/g, "");

function AdminAccountPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!supabase) {
        setMessage("Supabase nao configurado.");
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        setMessage("Faca login para editar sua conta.");
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      setConfirmed(Boolean(userData?.user?.email_confirmed_at));

      const { data, error } = await supabase
        .from("admin_profiles")
        .select("owner_name,store_name,doc_id,email")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message || "Falha ao carregar perfil.");
        setLoading(false);
        return;
      }

      setForm({
        ownerName: data?.owner_name || "",
        storeName: data?.store_name || "",
        docId: data?.doc_id || "",
        email: data?.email || user.email || "",
        password: "",
        confirmPassword: ""
      });
      setLoading(false);
    };

    loadProfile();
  }, []);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [field]: field === "docId" ? normalizeDoc(value) : value
    }));
  };

  const handleSave = async () => {
    setMessage("");

    if (!form.ownerName.trim()) {
      setMessage("Informe o nome do proprietario.");
      return;
    }
    if (!form.storeName.trim()) {
      setMessage("Informe o nome da loja.");
      return;
    }
    if (!form.docId.trim()) {
      setMessage("Informe o CPF ou CNPJ.");
      return;
    }

    if (!supabase) {
      setMessage("Supabase nao configurado.");
      return;
    }

    setSaving(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) {
      setMessage("Sessao expirada. Faca login novamente.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("admin_profiles")
      .update({
        owner_name: form.ownerName.trim(),
        store_name: form.storeName.trim(),
        doc_id: form.docId.trim()
      })
      .eq("user_id", user.id);

    if (error) {
      setMessage(error.message || "Falha ao salvar.");
      setSaving(false);
      return;
    }

    if (form.password) {
      if (form.password.length < 6) {
        setMessage("A senha precisa ter no minimo 6 caracteres.");
        setSaving(false);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setMessage("As senhas nao coincidem.");
        setSaving(false);
        return;
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password: form.password
      });
      if (passwordError) {
        setMessage(passwordError.message || "Falha ao atualizar senha.");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setForm((current) => ({ ...current, password: "", confirmPassword: "" }));
    setMessage("Dados atualizados com sucesso.");
  };

  if (loading) {
    return (
      <div className="page-shell centered">
        <div className="loading-card">
          <span className="eyebrow">Carregando conta</span>
          <h1>Buscando seus dados</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell centered admin-login">
      <div className="login-card">
        <BrandLogo subtitle="Minha conta administrativa" variant="login" className="login-brand" />
        <span className="eyebrow">Minha conta</span>
        <h1>Dados do administrador</h1>
        <p>Atualize as informacoes do proprietario e da loja.</p>
        <div className="admin-badges">
          <span className={`status-badge ${confirmed ? "is-ok" : "is-warn"}`}>
            {confirmed ? "Conta confirmada" : "Email nao confirmado"}
          </span>
        </div>

        <div className="field-grid">
          <label>
            <span>Nome do proprietario</span>
            <div className="input-with-icon">
              <User size={16} />
              <input value={form.ownerName} onChange={updateField("ownerName")} />
            </div>
          </label>
          <label>
            <span>Nome da loja</span>
            <div className="input-with-icon">
              <Building2 size={16} />
              <input value={form.storeName} onChange={updateField("storeName")} />
            </div>
          </label>
          <label>
            <span>CPF ou CNPJ</span>
            <div className="input-with-icon">
              <FileText size={16} />
              <input value={form.docId} onChange={updateField("docId")} />
            </div>
          </label>
          <label>
            <span>Email</span>
            <div className="input-with-icon">
              <Mail size={16} />
              <input type="email" value={form.email} readOnly />
            </div>
          </label>
          <label>
            <span>Nova senha</span>
            <input
              type="password"
              value={form.password}
              onChange={updateField("password")}
              placeholder="Deixe vazio para manter"
            />
          </label>
          <label>
            <span>Confirmar nova senha</span>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={updateField("confirmPassword")}
              placeholder="Repita a nova senha"
            />
          </label>
        </div>

        <button
          type="button"
          className="button button-primary button-block"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar dados"}
        </button>
        <button
          type="button"
          className="button button-outline button-block"
          onClick={() => navigate("/admin")}
        >
          Voltar ao painel
        </button>
        <Link to="/" className="button button-muted button-block">
          Voltar para loja
        </Link>

        {message ? <div className="toast-inline">{message}</div> : null}
      </div>
    </div>
  );
}

export default AdminAccountPage;
