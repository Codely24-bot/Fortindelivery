import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, Store, User } from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import { supabase } from "../supabase";

const initialForm = {
  ownerName: "",
  storeName: "",
  docId: "",
  email: "",
  password: "",
  confirmPassword: ""
};

const normalizeDoc = (value) => value.replace(/[^\d]/g, "");

function AdminSignupPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const updateField = (field) => (event) => {
    const nextValue = event.target.value;
    setForm((current) => ({
      ...current,
      [field]: field === "docId" ? normalizeDoc(nextValue) : nextValue
    }));
  };

  const validate = () => {
    if (!form.ownerName.trim()) return "Informe o nome do proprietario.";
    if (!form.storeName.trim()) return "Informe o nome da loja.";
    if (!form.docId.trim()) return "Informe o CPF ou CNPJ.";
    if (!form.email.trim()) return "Informe o e-mail.";
    if (!form.password) return "Informe a senha.";
    if (form.password.length < 6) return "A senha precisa ter no minimo 6 caracteres.";
    if (form.password !== form.confirmPassword) return "As senhas nao coincidem.";
    return "";
  };

  const handleSubmit = async () => {
    setMessage("");
    const error = validate();
    if (error) {
      setMessage(error);
      return;
    }

    if (!supabase) {
      setMessage("Supabase nao configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            owner_name: form.ownerName.trim(),
            store_name: form.storeName.trim(),
            doc_id: form.docId.trim()
          }
        }
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      setMessage("Conta criada! Confirme o email para acessar o painel.");
      setForm(initialForm);
    } catch (err) {
      setMessage(err.message || "Falha ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell centered admin-login">
      <div className="login-card">
        <BrandLogo
          subtitle="Cadastro administrativo com confirmacao por email"
          variant="login"
          className="login-brand"
        />
        <span className="eyebrow">Cadastro de administrador</span>
        <h1>Crie seu acesso</h1>
        <p>Preencha os dados abaixo e confirme o email para liberar o painel.</p>

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
              <Store size={16} />
              <input value={form.storeName} onChange={updateField("storeName")} />
            </div>
          </label>
          <label>
            <span>CPF ou CNPJ</span>
            <div className="input-with-icon">
              <ShieldCheck size={16} />
              <input value={form.docId} onChange={updateField("docId")} />
            </div>
          </label>
          <label>
            <span>Email</span>
            <div className="input-with-icon">
              <Mail size={16} />
              <input type="email" value={form.email} onChange={updateField("email")} />
            </div>
          </label>
          <label>
            <span>Senha</span>
            <input type="password" value={form.password} onChange={updateField("password")} />
          </label>
          <label>
            <span>Confirmar senha</span>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={updateField("confirmPassword")}
            />
          </label>
        </div>

        <button
          type="button"
          className="button button-primary button-block"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
        <Link to="/admin" className="button button-outline button-block">
          Ja tenho conta
        </Link>
        <Link to="/" className="button button-muted button-block">
          Voltar para loja
        </Link>

        {message ? <div className="toast-inline">{message}</div> : null}
      </div>
    </div>
  );
}

export default AdminSignupPage;
