import { AxiosResponse } from "axios";
import { httpClient } from "../http";
import { getSession } from "next-auth/react";

const resourceURL: string = "/api/media";

export const useMediaService = () => {


    const carregarVideo = async (caminho: string): Promise<string> => {
    
        try {
            const session = await getSession(); // Obtém o token da sessão
            const token = session?.accessToken; // Extrai o token da sessão
    
            if (!token) {
                throw new Error("Token de autenticação não encontrado");
            }
    
            const url = `${resourceURL}/video?caminho=${encodeURIComponent(caminho)}`;
    
            const response: AxiosResponse<Blob> = await httpClient.get(url, {
                responseType: "blob",
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`, // ✅ Adiciona o token no header
                },
            });
    
            const videoUrl = URL.createObjectURL(response.data);
            return videoUrl;
        } catch (error) {
            console.error("Erro ao carregar vídeo:", error);
            throw error;
        }
    };

    const carregarImagem = async (caminho: string): Promise<string> => {
    
        try {
            const session = await getSession();
            const token = session?.accessToken;
    
            if (!token) {
                throw new Error("Token de autenticação não encontrado");
            }
    
            const url = `${resourceURL}/imagem?caminho=${encodeURIComponent(caminho)}`;
    
            const response: AxiosResponse<Blob> = await httpClient.get(url, {
                responseType: "blob",
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const imageUrl = URL.createObjectURL(response.data);
            return imageUrl;
        } catch (error) {
            console.error("Erro ao carregar imagem:", error);
            throw error;
        }
    };

    return {
        carregarVideo,
        carregarImagem
    };
};
