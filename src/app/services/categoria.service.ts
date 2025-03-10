import { httpClient } from "../http"
import { Categoria } from "../models/categorias"
import { AxiosResponse } from "axios"
import { ApiResponse, Page } from "../models/common"
import { CategoriaProduto } from "../models/produtos"

const resourceURL: string = "/api/categorias"

export const useCategoriaService = () => {

    const salvar = async (categoria: Categoria) :Promise<ApiResponse<Categoria>> => {
        try {
            const url = `${resourceURL}/salvar`
            const response: AxiosResponse<ApiResponse<Categoria>> = await httpClient.post<ApiResponse<Categoria>>(url, categoria)
            return response.data;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(error: any){
            throw error
        }
    }

    const atualizar = async (categoria: Categoria): Promise<ApiResponse<Categoria>> => {
        try {
            const url: string = `${resourceURL}/atualizar/${categoria.id}`;
            const response: AxiosResponse<ApiResponse<Categoria>> = await httpClient.put<ApiResponse<Categoria>>(url, categoria);
            return response.data
        }// eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(error: any){
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    const listarCategoria = async (nome: string, id: string, page: number = 0, size: number = 10) : Promise<ApiResponse<Page<Categoria>>> =>{
        try {
            const url = `${resourceURL}/categorias?nome=${nome}&codigo=${id}&page=${page}&size=${size}`
            const response: AxiosResponse<ApiResponse<Page<Categoria>>> = await httpClient.get(url);
            return response.data
        }// eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(error: any){
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    const carregarCategoria = async (id: string) : Promise<ApiResponse<Categoria>> => {
        try {
            const url: string = `${resourceURL}/buscar/${id}`;
            const response: AxiosResponse<ApiResponse<Categoria>> = await httpClient.get(url);
            return response.data
        }// eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(error: any){
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    //Busca as Categorias Ativas
    const findAllCategoriaProduto = async (): Promise<ApiResponse<CategoriaProduto[]>> => {
        try {
            const url = `${resourceURL}/categoriaFindAll`;
            const response: AxiosResponse<ApiResponse<CategoriaProduto[]>> = await httpClient.get(url);
            return response.data;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(error: any){
            throw error
        }
    };

    return {
        salvar, atualizar, carregarCategoria, findAllCategoriaProduto, listarCategoria
    }
}