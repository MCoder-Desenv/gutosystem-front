import { AxiosResponse } from "axios";
import { httpClient } from "../http";
import { Produto } from "../models/produtos";
import { ApiResponse, Page } from "../models/common/page";

const resourceURL: string = "/api/produtos"

export const useProdutoService = () => {

    const salvar = async (produto: Produto): Promise<ApiResponse<Produto>> => {
        try {
            const url: string = `${resourceURL}/salvar`;
            const response: AxiosResponse<ApiResponse<Produto>> = await httpClient.post<ApiResponse<Produto>>(url, produto);
            return response.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error;
        }
    }

    const atualizar = async (produto: Produto): Promise<ApiResponse<Produto>> => {
        try {
            const url: string = `${resourceURL}/atualizar/${produto.id}`;
            const response: AxiosResponse<ApiResponse<Produto>> = await httpClient.put<ApiResponse<Produto>>(url, produto);
            return response.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    const carregarProduto = async (id: number) : Promise<ApiResponse<Produto>> => {
        try {
            const url: string = `${resourceURL}/buscar/${id}`;
            const response: AxiosResponse<ApiResponse<Produto>> = await httpClient.get(url);
            return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    const findProdutos = async (
            descricao: string = '',
            status: string = '',
            categoriaId: string = '',
            page: number = 0,
            size: number = 10
        ) : Promise<ApiResponse<Page<Produto>>> =>{
            try {            
                const url = `${resourceURL}/buscarProdutosDescricao?descricao=${descricao}&status=${status}&categoriaId=${categoriaId}&page=${page}&size=${size}`
                const response: AxiosResponse<ApiResponse<Page<Produto>>> = await httpClient.get(url);
                return response.data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                throw error; // Ou tratar o erro de uma forma mais específica
            }
    }

    const findProdutosPedido = async (descricao: string = '') : Promise<ApiResponse<Produto[]>> =>{
        try{
            const url = `${resourceURL}/produtosPedido?descricao=${descricao}`
            const response: AxiosResponse<ApiResponse<Produto[]>> = await httpClient.get(url);
            return response.data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    return { salvar, atualizar, carregarProduto, findProdutos, findProdutosPedido }

}