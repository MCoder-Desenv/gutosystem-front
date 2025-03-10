import { httpClient } from "../http"
import { AxiosResponse } from "axios"
import { Funcao } from "../models/funcoes"
import { ApiResponse } from "../models/common/page"

const resourceURL: string = "/api/funcoes"

export const useFuncoesService = () => {

    const salvar = async (func: Funcao[]): Promise<ApiResponse<Funcao[]>> => {
        const url = `${resourceURL}/salvar`;
        const response: AxiosResponse<ApiResponse<Funcao[]>> = await httpClient.post<ApiResponse<Funcao[]>>(url, func);
        return response.data; // Aqui você retorna a resposta completa da API
    }

    const findFuncoesNome = async (nome: string = '') : Promise<Funcao[]> =>{
        const url = `${resourceURL}/buscar/autoCompleteNome?nome=${nome}`
        const response: AxiosResponse<Funcao[]> = await httpClient.get(url);
        return response.data
    }

    //Busca as Categorias Ativas
    const findAllFuncoes = async (): Promise<Funcao[]> => {
        const url = `${resourceURL}/buscar`;
        const response: AxiosResponse<Funcao[]> = await httpClient.get(url);
        return response.data;
    };

    return {
        salvar, findFuncoesNome, findAllFuncoes
    }
}