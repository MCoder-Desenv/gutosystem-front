import { AxiosResponse } from "axios";
import { ApiResponse } from "../models/common";
import { httpClient } from "../http";
import { DashProdutoVendas, DashVendas } from "../models/dashVendas";

const resourceURL: string = "/api/dashboard-vendas"

export const useDashVendasService = () => {

    const carregarDashVendas = async (dataInicio: Date, dataFim: Date) : Promise<ApiResponse<DashVendas[]>> => {
        try {
            // Convertendo para string no formato YYYY-MM-DD
            const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
            const dataFimFormatada = dataFim.toISOString().split('T')[0];
            const url: string = `${resourceURL}/dash-vendas-periodo?dataInicio=${dataInicioFormatada}&dataFim=${dataFimFormatada}`;
            const response: AxiosResponse<ApiResponse<DashVendas[]>> = await httpClient.get(url);
            return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    const carregarDashVendasProduto = async (dataInicio: Date, dataFim: Date) : Promise<ApiResponse<DashProdutoVendas[]>> => {
        try {
            // Convertendo para string no formato YYYY-MM-DD
            const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
            const dataFimFormatada = dataFim.toISOString().split('T')[0];
            const url: string = `${resourceURL}/dash-vendas-categoria-periodo?dataInicio=${dataInicioFormatada}&dataFim=${dataFimFormatada}`;
            const response: AxiosResponse<ApiResponse<DashProdutoVendas[]>> = await httpClient.get(url);
            return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    return {
        carregarDashVendas,
        carregarDashVendasProduto
    }

}