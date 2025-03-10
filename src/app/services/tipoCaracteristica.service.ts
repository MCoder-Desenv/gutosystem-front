import { httpClient } from "../http"
import { TiposCaracteristicas } from "../models/tiposCaracteristicas"
import { AxiosResponse } from "axios"
import { ApiResponse, Page } from "../models/common/page"

const resourceURL: string = "/api/tipcar"

export const useTipoCaracteristicaService = () => {

    const tiposCaracteristicas = async (nome: string, id: string, page: number = 0, size: number = 10) : Promise<Page<TiposCaracteristicas>> =>{
        const url = `${resourceURL}/tiposCaracteristicas?nome=${nome}&codigo=${id}&page=${page}&size=${size}`
        const response: AxiosResponse<Page<TiposCaracteristicas>> = await httpClient.get(url);
        return response.data
    }

    //type SalvarResposta = TiposCaracteristicas | { error: string };


    const salvar = async (tipCar: TiposCaracteristicas): Promise<ApiResponse<TiposCaracteristicas>> => {
        try {
            // Chama a API
            const response: AxiosResponse<ApiResponse<TiposCaracteristicas>> = await httpClient.post<ApiResponse<TiposCaracteristicas>>(resourceURL, tipCar);
            
            // Verifica se a resposta foi bem sucedida
            if (response.data && (response.data.statusCode === 200 || response.data.statusCode === 201)) {
                // Retorna os dados da resposta (os dados que estão na propriedade `data` do ApiResponse)
                return response.data;
            } else {
                // Se a resposta não for 200, lança um erro com a mensagem
                throw new Error(response.data.message || "Erro desconhecido");
            }   
        } 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (error: any) {
            if (error.data) {
                // Se o erro veio da API, extrai a mensagem e os detalhes
                throw error; 
            }
            else if (typeof error === "object" && error !== null && "message" in error) {
                // Caso o erro seja um objeto que possui a propriedade "message", trata-o
                const err = error as { message: string };
                throw new Error(err.message);
            } 
            
            else {
                throw new Error("Erro de conexão ou inesperado ao cadastar Informações Complementares." + error);
            }
        }
    };    

    const atualizar = async (tipCar: TiposCaracteristicas): Promise<ApiResponse<TiposCaracteristicas>> => {
        try {
            const url: string = `${resourceURL}/${tipCar.id}`;
            
            // Chama a API com PUT
            const response = await httpClient.put<ApiResponse<TiposCaracteristicas>>(url, tipCar);
            
            // Verifica se a resposta foi bem-sucedida
            if (response.data && (response.data.statusCode === 200 || response.data.statusCode === 201)) {
                return response.data
                // Sucesso, a resposta tem a estrutura ApiResponse com dados
            } else {
                // Caso a resposta não seja de sucesso, lança um erro
                throw new Error(response.data.message || "Erro desconhecido ao atualizar.");
            }
        } catch (error: unknown) {
            // Lida com o erro
        
            if (error instanceof Error) {
                // Se for uma instância de Error, apenas lança o erro para tratamento
                console.error("Erro ao atualizar Informações Complementares: ", error.message);
                throw error; // Lança o erro
            } else if (typeof error === "object" && error !== null && "message" in error) {
                // Caso o erro seja um objeto que possui a propriedade "message", lança o erro
                const err = error as { message: string };
                console.error("Erro ao atualizar Informações Complementares: ", err.message);
                throw new Error(err.message);
            } else {
                // Caso o erro seja desconhecido, lança um erro genérico
                console.error("Erro desconhecido ao atualizar Informações Complementares.");
                throw new Error("Erro desconhecido ao atualizar Informações Complementares.");
            }
        }
    };
    
    

    const carregarTipCar = async (id: number) : Promise<TiposCaracteristicas> => {
        const url: string = `${resourceURL}/${id}`;
        const response: AxiosResponse<TiposCaracteristicas> = await httpClient.get(url);
        return response.data
    }

    const findAllStatusList = async (status: string) : Promise<TiposCaracteristicas[]> => {
        const url: string = `${resourceURL}/findAllStatus/${status}`;
        const response: AxiosResponse<TiposCaracteristicas[]> = await httpClient.get(url);
        return response.data
    }

    const tipCarAutoComplete = async (nome: string, id: string, page: number = 0, size: number = 10) : Promise<Page<TiposCaracteristicas>> =>{
        const url = `${resourceURL}/tipCarAutoComplete?nome=${nome}&codigo=${id}&page=${page}&size=${size}`
        const response: AxiosResponse<Page<TiposCaracteristicas>> = await httpClient.get(url);
        return response.data
    }

    const findAll = async (): Promise<TiposCaracteristicas[]> => {
        const url = `${resourceURL}/findAll`;
        const response: AxiosResponse<TiposCaracteristicas[]> = await httpClient.get(url);
        return response.data;
    };

    const deletar = async (id: string): Promise<void> =>{
        const url: string = `${resourceURL}/${id}`;
        await httpClient.delete(url)
    }

    return {
        tiposCaracteristicas, salvar, atualizar, carregarTipCar, deletar, tipCarAutoComplete,findAll, findAllStatusList
    }
}