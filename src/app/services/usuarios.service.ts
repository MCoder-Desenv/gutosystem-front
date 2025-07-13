import { AxiosResponse } from "axios";
import { ApiResponse } from "../models/common";
import { httpClient } from "../http";
import { Perfil, UsuarioFuncao, UsuarioProjection, Usuarios } from "../models/usuarios";

const resourceURL: string = "/api/users"

export const useUsuarioService = () => {

    const salvar = async (user: Usuarios): Promise<ApiResponse<Usuarios>> => {
        const url = `${resourceURL}/salvar`;
        const response: AxiosResponse<ApiResponse<Usuarios>> = await httpClient.post<ApiResponse<Usuarios>>(url, user);
        return response.data; // Aqui você retorna a resposta completa da API
    }

    const atualizar = async (user: Usuarios): Promise<ApiResponse<Usuarios>> => {
        try {
            console.log('console aqui: ', user)
            const url: string = `${resourceURL}/${user.id}/atualizar`;
            const response: AxiosResponse<ApiResponse<Usuarios>> = await httpClient.put<ApiResponse<Usuarios>>(url, user);
            return response.data; // Aqui você retorna a resposta completa da API
        } catch (error) {
            console.error("Erro ao atualizar Usuario", error);
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    const forcarAtualizacaoSenha = async (userId: string): Promise<ApiResponse<string> | null> => {
        const url = `${resourceURL}/forcar-atualizacao-senha/${userId}`;
    
        try {
            const response: AxiosResponse<ApiResponse<string>> = await httpClient.post<ApiResponse<string>>(url);
            return response.data; // Retorna a resposta bem-sucedida da API
        } catch (error) {
            console.error("Erro ao redefinir senha:", error);
            throw error;
        }
    };

    const excluirUsuario = async (userId: string): Promise<ApiResponse<string> | null> => {
        const url = `${resourceURL}/excluir/${userId}`;
    
        try {
            const response: AxiosResponse<ApiResponse<string>> = await httpClient.delete<ApiResponse<string>>(url);
            return response.data; // Retorna a resposta bem-sucedida da API
        } catch (error) {
            throw error;
        }
    };
    

    const atualizarPerfil = async (
        id: string,
        user: Perfil,
        senhaAnterior?: string,
        senhaNova?: string
    ): Promise<ApiResponse<Perfil>> => {
        const url = `${resourceURL}/${id}/atualizarPerfil`;
    
        const params = new URLSearchParams();
        if (senhaAnterior) params.append('senhaAnterior', senhaAnterior);
        if (senhaNova) params.append('senhaNova', senhaNova);
    
        try {
            const response: AxiosResponse<ApiResponse<Perfil>> = await httpClient.put<ApiResponse<Perfil>>(
                url,
                user,
                { params }
            );
            return response.data; // Retorna dados em caso de sucesso
        } catch (error) {
            if (error) {
                // Retorna a resposta de erro da API
                throw error;
            }
            // Erro inesperado (rede, timeout, etc.)
            throw new Error('Erro ao atualizar o perfil');
        }
    };

    //Busca os Usuarios Ativas
    const findUser = async (): Promise<UsuarioProjection[]> => {
        const url = `${resourceURL}/buscar`;
        const response: AxiosResponse<UsuarioProjection[]> = await httpClient.get(url);
        return response.data;
    };

    //Busca os Usuarios Ativas
    const findPerfil = async (id: string): Promise<ApiResponse<Perfil>> => {
        const url = `${resourceURL}/perfil/${id}`;
        const response: AxiosResponse<ApiResponse<Perfil>> = await httpClient.get(url);
        return response.data;
    };

    const userAuthFuncoes = async (userId: string, tela: string): Promise<UsuarioFuncao> => {
        const url = `${resourceURL}/auth/usuario/${userId}/tela/${tela}`;
        const response: AxiosResponse<UsuarioFuncao> = await httpClient.get(url);
        return response.data;
    };

    const carregarUsuario = async (id: number) : Promise<ApiResponse<Usuarios>> => {
            const url: string = `${resourceURL}/usuario/${id}`;
            const response: AxiosResponse<ApiResponse<Usuarios>> = await httpClient.get(url);
            return response.data
        }

    return {
        salvar,
        atualizar,
        findUser,
        carregarUsuario,
        userAuthFuncoes,
        findPerfil,
        atualizarPerfil,
        forcarAtualizacaoSenha,
        excluirUsuario
    }

}