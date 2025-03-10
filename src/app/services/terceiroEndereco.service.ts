import { AxiosResponse } from "axios";
import { TerceirosEnderecosClienteDto } from "../models/terceiros";
import { httpClient } from "../http";

const resourceURL: string = "/api/terceiroEndereco";

export const useTerceiroEnderecoService = () => {

    const findClienteEnderecoFicha = async (id: string = ''): Promise<TerceirosEnderecosClienteDto[]> => {
        const url = `${resourceURL}/${id}/enderecos`;

        try {
            const response: AxiosResponse<TerceirosEnderecosClienteDto[]> = await httpClient.get(url);

            return response.data;
        } catch (error) {
            // Log do erro em caso de falha
            console.error(`Erro ao chamar ${url}:`, error);

            throw error; // Repassa o erro para o componente tratar
        }
    };

    return {
        findClienteEnderecoFicha,
    };
};
