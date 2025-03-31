import { AxiosResponse } from "axios";
import { httpClient } from "../http";
import { UnidadeMedida } from "../models/unidadeMedida";
import { ApiResponse, Page } from "../models/common";

const resourceURL: string = "/api/unidadeMedida"

export const useUnidadeMedidaService = () => {

    const salvar = async (uniMed: UnidadeMedida): Promise<ApiResponse<UnidadeMedida>> => {
        try {
            const url: string = `${resourceURL}/salvar`;
            const response: AxiosResponse<ApiResponse<UnidadeMedida>> = await httpClient.post<ApiResponse<UnidadeMedida>>(url, uniMed);
            return response.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error;
        }
    }

    const atualizar = async (uniMed: UnidadeMedida): Promise<ApiResponse<UnidadeMedida>> => {
        try {
            const url: string = `${resourceURL}/atualizar/${uniMed.id}`;
            const response: AxiosResponse<ApiResponse<UnidadeMedida>> = await httpClient.put<ApiResponse<UnidadeMedida>>(url, uniMed);
            return response.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    const carregarUnidadeMedida = async (id: number) : Promise<ApiResponse<UnidadeMedida>> => {
        try {
            const url: string = `${resourceURL}/buscar/${id}`;
            const response: AxiosResponse<ApiResponse<UnidadeMedida>> = await httpClient.get(url);
            return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    const findAllUnidadesMedida = async (status: string = ''): Promise<ApiResponse<UnidadeMedida[]>> => {
        try {
            const url = `${resourceURL}/uniMedFindAll?status=${status}`;
            const response: AxiosResponse<ApiResponse<UnidadeMedida[]>> = await httpClient.get(url);
            return response.data;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch(error: any){
            throw error
        }
    };

    const findUnidadesMedida = async (
            unidade: string = '',
            codigo: string = '',
            page: number = 0,
            size: number = 10
        ) : Promise<ApiResponse<Page<UnidadeMedida>>> =>{
            try {            
                const url = `${resourceURL}/unidadesMedida?unidade=${unidade}&codigo=${codigo}&page=${page}&size=${size}`
                const response: AxiosResponse<ApiResponse<Page<UnidadeMedida>>> = await httpClient.get(url);
                return response.data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                throw error; // Ou tratar o erro de uma forma mais específica
            }
    }

    return { salvar, atualizar, carregarUnidadeMedida, findUnidadesMedida, findAllUnidadesMedida}

}