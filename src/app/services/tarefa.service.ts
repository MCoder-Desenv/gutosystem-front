import { AxiosResponse } from "axios";
import { httpClient } from "../http";
import { TarefaCalendar, Tarefa, CadastroTarefa } from "../models/tarefa";
import { ApiResponse } from "../models/common";

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

    // const atualizar = async (produto: Produto): Promise<ApiResponse<Produto>> => {
    //     try {
    //         const url: string = `${resourceURL}/atualizar/${produto.id}`;
    //         const response: AxiosResponse<ApiResponse<Produto>> = await httpClient.put<ApiResponse<Produto>>(url, produto);
    //         return response.data;
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     } catch (error: any) {
    //         throw error; // Ou tratar o erro de uma forma mais específica
    //     }
    // }


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

    // const findProdutos = async (
    //         descricao: string = '',
    //         status: string = '',
    //         categoriaId: string = '',
    //         page: number = 0,
    //         size: number = 10
    //     ) : Promise<ApiResponse<Page<Produto>>> =>{
    //         try {            
    //             const url = `${resourceURL}/buscarProdutosDescricao?descricao=${descricao}&status=${status}&categoriaId=${categoriaId}&page=${page}&size=${size}`
    //             const response: AxiosResponse<ApiResponse<Page<Produto>>> = await httpClient.get(url);
    //             return response.data
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //         } catch (error: any) {
    //             throw error; // Ou tratar o erro de uma forma mais específica
    //         }
    // }

    // const findProdutosPedido = async (descricao: string = '') : Promise<ApiResponse<Produto[]>> =>{
    //     try{
    //         const url = `${resourceURL}/produtosPedido?descricao=${descricao}`
    //         const response: AxiosResponse<ApiResponse<Produto[]>> = await httpClient.get(url);
    //         return response.data
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     } catch (error: any) {
    //         throw error; // Ou tratar o erro de uma forma mais específica
    //     }
    // }

    return { criarTarefas, carregarTarefasPorFuncionario, carregarTarefa, atualizarParcial }

}