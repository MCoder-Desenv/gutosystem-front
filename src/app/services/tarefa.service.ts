import { AxiosResponse } from "axios";
import { httpClient } from "../http";
import { TarefaCalendar, Tarefa, CadastroTarefa } from "../models/tarefa";
import { ApiResponse, Page } from "../models/common";

const resourceURL: string = "/api/tarefas"

export const useTarefaService = () => {

    const criarTarefas = async (cadTar: CadastroTarefa[]): Promise<ApiResponse<void>> => {
        try {
            const url: string = `${resourceURL}/cadastrar`;
            console.log('url: ' + url + cadTar)
            const response: AxiosResponse<ApiResponse<void>> = await httpClient.post(url, cadTar);
            console.log('response: ' + response)
            return response.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.data) {
                // Se o erro veio da API, extrai a mensagem e os detalhes
                throw error; 
            } else {
                throw new Error("Erro ao Cadastrar Tarefas. ", error);
            }
        }
    };

    // const atualizar = async (tarefa: Tarefa): Promise<ApiResponse<Tarefa>> => {
    //     try {
    //         const url: string = `${resourceURL}/atualizar/${tarefa.id}`;
    //         const response: AxiosResponse<ApiResponse<Tarefa>> = await httpClient.put<ApiResponse<Tarefa>>(url, tarefa);
    //         return response.data;
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     } catch (error: any) {
    //         throw error; // Ou tratar o erro de uma forma mais específica
    //     }
    // }

    // Método para atualizar uma ficha (PUT)
    const atualizar = async (ficha: Tarefa, arquivos?: File[]): Promise<ApiResponse<Tarefa>> => {
        const url: string = `${resourceURL}/${ficha.id}`;
        const formData = new FormData();
    
        formData.append("form", new Blob([JSON.stringify(ficha)], { type: "application/json" }));
    
        if (arquivos) {
            arquivos.forEach((arquivo) => {
                formData.append("arquivos", arquivo);
            });
        }
    
        try {
            const response: AxiosResponse<ApiResponse<Tarefa>> = await httpClient.put<ApiResponse<Tarefa>>(
                url,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
    
            return response.data; // Retorna a resposta bem-sucedida
    
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.data) {
                // Se o erro veio da API, extrai a mensagem e os detalhes
                throw error; 
            } else {
                throw new Error("Erro de conexão ou inesperado ao atualizar ficha.");
            }
        }
    };

    const atualizarParcial = async (
        id: number,
        updates: Record<string, unknown>,
        idsArquivosMantidos: number[],
        arquivos?: File[]
    ): Promise<ApiResponse<Tarefa>> => {
        const url = `${resourceURL}/${id}/atualizar-parcial`;
        const formData = new FormData();

        const formPayload = {
            updates,
            idsArquivosMantidos,
        };

        formData.append("form", new Blob([JSON.stringify(formPayload)], { type: "application/json" }));

        if (arquivos) {
            arquivos.forEach((arquivo) => {
                formData.append("arquivos", arquivo);
            });
        }

        try {
            const response: AxiosResponse<ApiResponse<Tarefa>> = await httpClient.put(url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            return response.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.response?.data) {
                throw error.response.data;
            } else {
                throw new Error("Erro ao atualizar tarefa.");
            }
        }
    };


    const carregarTarefasPorFuncionario = async (idFuncionario: number) : Promise<ApiResponse<TarefaCalendar[]>> => {
        try {
            const url: string = `${resourceURL}/tarefasPorFuncionario/${idFuncionario}`;
            const response: AxiosResponse<ApiResponse<TarefaCalendar[]>> = await httpClient.get(url);
            return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    const carregarTarefa = async (id: number) : Promise<ApiResponse<Tarefa>> => {
        try {
            const url: string = `${resourceURL}/buscar/${id}`;
            const response: AxiosResponse<ApiResponse<Tarefa>> = await httpClient.get(url);
            return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    const findTarefa = async (
        idFuncionario: number | null,
        idCliente: number | null,
        status: string | null,
        titulo: string | null,
        page: number = 0,
        size: number = 10
    ): Promise<ApiResponse<Page<Tarefa>>> => {
        try {
            const params = new URLSearchParams();

            if (idFuncionario !== null) params.append('idFuncionario', idFuncionario.toString());
            if (idCliente !== null) params.append('idCliente', idCliente.toString());
            if (status) params.append('status', status);
            if (titulo) params.append('titulo', titulo);

            // Sempre adiciona paginação
            params.append('page', page.toString());
            params.append('size', size.toString());

            const url: string = `${resourceURL}/filtrar?${params.toString()}`;
            const response: AxiosResponse<ApiResponse<Page<Tarefa>>> = await httpClient.get(url);
            return response.data;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error;
        }
    };


    return { criarTarefas, carregarTarefasPorFuncionario, carregarTarefa, atualizar, atualizarParcial, findTarefa }

}