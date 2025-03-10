"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ArquivoFicha } from "@/app/models/fichaOrcamento";

interface TemplateImagemProps {
    arquivo: ArquivoFicha;
    podeCadastrar: boolean;
    onRemoveArquivo: () => void;
    carregarMidia: (arquivo: ArquivoFicha) => Promise<string | null>;
}

export const TemplateImagem = ({ arquivo, podeCadastrar, onRemoveArquivo, carregarMidia }: TemplateImagemProps) => {
    if (!arquivo?.id) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (!arquivo?.caminho || !arquivo?.tipo) return;

        setIsLoading(true);

        carregarMidia(arquivo)
            .then((url) => setMediaUrl(url))
            .catch(() => setMediaUrl(null))
            .finally(() => setIsLoading(false));
    }, [arquivo, carregarMidia]);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "15px" }}>
            <div style={{ position: "relative", display: "inline-block", width: "100%", maxWidth: "500px" }}>
                {isLoading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>Carregando...</div>
                ) : arquivo?.tipo.startsWith("video/") && mediaUrl ? (
                    <video key={mediaUrl} controls width="97%">
                        <source src={mediaUrl} type={arquivo.tipo} />
                    </video>
                ) : arquivo?.tipo.startsWith("image/") && mediaUrl ? (
                    <Image 
                        src={mediaUrl} 
                        alt={arquivo?.nome ?? "Imagem"} 
                        width={350} 
                        height={150} 
                        style={{ borderRadius: "8px", width: "auto", height: "auto" }} 
                    />
                ) : null}
            </div>

            <button
                type="button"
                onClick={onRemoveArquivo} // Agora chama a função corretamente
                style={{
                    marginTop: "10px",
                    padding: "10px 20px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    textTransform: "uppercase"
                }}
                disabled={!podeCadastrar}
                title="Remover arquivo"
            >
                Deletar ❌
            </button>
        </div>
    );
};
