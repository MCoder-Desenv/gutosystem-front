import { AxiosResponse } from "axios";
import { httpClient } from "../http";
import { TerceirosCaracteristicasDescricao } from "../models/terceiros";

const resourceURL: string = "/api/terceiroCaracteristica"

export const useTerceiroCaracteristicaService = () => {


    const findClienteTelefoneFicha = async (id: string = '', tipo: string = 'TELEFONE') : Promise<TerceirosCaracteristicasDescricao[]> =>{
        const url = `${resourceURL}/${id}/descricao?tipo=${tipo}`
        const response: AxiosResponse<TerceirosCaracteristicasDescricao[]> = await httpClient.get(url);
        return response.data
    }

    const findClienteTelefoneFichaTipoIn = async (id: string = '', tipos: string[] = ['TELEFONE', 'CELULAR']): Promise<TerceirosCaracteristicasDescricao[]> => {
        const url = `${resourceURL}/${id}/descricaoTipoIn?${tipos.map(tipo => `tipos=${encodeURIComponent(tipo)}`).join('&')}`;
        const response: AxiosResponse<TerceirosCaracteristicasDescricao[]> = await httpClient.get(url);
        return response.data;
    };
    

    return {
        findClienteTelefoneFicha,
        findClienteTelefoneFichaTipoIn
    }

}