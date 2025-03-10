'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./resetPassword.module.css"; // Importando o novo CSS

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Se este e-mail estiver cadastrado, enviaremos um link de recuperação.");
    // Aqui você pode chamar a API para enviar o e-mail de redefinição de senha
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <img src="/favicon.ico" alt="Reset" className={styles.image} />
        {message && <p className={styles.success}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>
            Recuperar Senha
          </button>
        </form>
        <a className={styles.forgotPassword} onClick={() => router.push("/login")}>
          Voltar para o login
        </a>
      </div>
    </div>
  );
}
