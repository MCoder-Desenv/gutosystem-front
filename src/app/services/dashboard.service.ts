import { httpClient } from "../http";
import { AxiosResponse } from "axios";
import { DashboardData, DashboardStatus, DashboardTotalFichaPeido, DashboardTotalFichaPeidoPorDia, DashboardTotaPorDia, DashboardTotaPorMesStatus } from "../models/dashboard";
import { ApiResponse } from "../models/common";

const resourceURL: string = "/api/dashboard";

export const useDashboardService = () => {

    const getTotalFichasPorMes = async (): Promise<ApiResponse<DashboardData[]>> => {
        try {
            const response: AxiosResponse<ApiResponse<DashboardData[]>> = await httpClient.get(`${resourceURL}/fichas-por-mes`);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const getTotalFichasPorData = async (dataInicio: Date, dataFim: Date): Promise<ApiResponse<DashboardData[]>> => {
        try {
            // Convertendo para string no formato YYYY-MM-DD
            const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
            const dataFimFormatada = dataFim.toISOString().split('T')[0];
    
            const url = `${resourceURL}/contar?dataInicio=${dataInicioFormatada}&dataFim=${dataFimFormatada}`;
            const response: AxiosResponse<ApiResponse<DashboardData[]>> = await httpClient.get(url);
            return response.data;
        } catch (error) {
            console.error("❌ Erro ao buscar fichas por período de data:", error);
            throw error;
        }
    };

    const getFichasPorStatus = async (dataInicio: Date, dataFim: Date, statusList: string[]): Promise<ApiResponse<DashboardStatus[]>> => {
        try {
          // Convertendo para string no formato YYYY-MM-DD
          const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
          const dataFimFormatada = dataFim.toISOString().split('T')[0];
          const url = `${resourceURL}/contar-fichas-por-status?dataInicio=${dataInicioFormatada}&dataFim=${dataFimFormatada}&status=${statusList.join(",")}`;
          const response: AxiosResponse<ApiResponse<DashboardStatus[]>> = await httpClient.get(url);
          return response.data;
        } catch (error) {
          console.error("❌ Erro ao buscar fichas por status:", error);
          throw error;
        }
    };

    const getFichasComPedido = async (dataInicio: Date, dataFim: Date): Promise<ApiResponse<DashboardTotalFichaPeido[]>> => {
        try {
          // Convertendo para string no formato YYYY-MM-DD
          const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
          const dataFimFormatada = dataFim.toISOString().split('T')[0];
          const url = `${resourceURL}/contar-ficha-com-pedido?dataInicio=${dataInicioFormatada}&dataFim=${dataFimFormatada}`;
          const response: AxiosResponse<ApiResponse<DashboardTotalFichaPeido[]>> = await httpClient.get(url);
          return response.data;
        } catch (error) {
          console.error("❌ Erro ao buscar fichas com pedido:", error);
          throw error;
        }
    };

    const getFichasComPedidoPorDia = async (dataInicio: Date, dataFim: Date): Promise<ApiResponse<DashboardTotalFichaPeidoPorDia[]>> => {
        try {
          // Convertendo para string no formato YYYY-MM-DD
          const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
          const dataFimFormatada = dataFim.toISOString().split('T')[0];
          const url = `${resourceURL}/contar-ficha-com-pedido-por-dia?dataInicio=${dataInicioFormatada}&dataFim=${dataFimFormatada}`;
          const response: AxiosResponse<ApiResponse<DashboardTotalFichaPeidoPorDia[]>> = await httpClient.get(url);
          return response.data;
        } catch (error) {
          console.error("❌ Erro ao buscar fichas com pedido:", error);
          throw error;
        }
    };

    const getFichaPorDia = async (dataInicio: Date, dataFim: Date, status: string): Promise<ApiResponse<DashboardTotaPorDia[]>> => {
        try {
          // Convertendo para string no formato YYYY-MM-DD
          const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
          const dataFimFormatada = dataFim.toISOString().split('T')[0];
          const url = `${resourceURL}/contar-ficha-por-dia?dataInicio=${dataInicioFormatada}&dataFim=${dataFimFormatada}&status=${status}`;
          const response: AxiosResponse<ApiResponse<DashboardTotaPorDia[]>> = await httpClient.get(url);
          return response.data;
        } catch (error) {
          console.error("❌ Erro ao buscar pedido por dia:", error);
          throw error;
        }
    };

    const getPedidoPorDia = async (dataInicio: Date, dataFim: Date, status: string): Promise<ApiResponse<DashboardTotaPorDia[]>> => {
        try {
          // Convertendo para string no formato YYYY-MM-DD
          const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
          const dataFimFormatada = dataFim.toISOString().split('T')[0];
          const url = `${resourceURL}/contar-pedidos-por-dia?dataInicio=${dataInicioFormatada}&dataFim=${dataFimFormatada}&status=${status}`;
          const response: AxiosResponse<ApiResponse<DashboardTotaPorDia[]>> = await httpClient.get(url);
          return response.data;
        } catch (error) {
          console.error("❌ Erro ao buscar pedido por dia:", error);
          throw error;
        }
    };

    const getOsmPorDia = async (dataInicio: Date, dataFim: Date, status: string): Promise<ApiResponse<DashboardTotaPorDia[]>> => {
        try {
          // Convertendo para string no formato YYYY-MM-DD
          const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
          const dataFimFormatada = dataFim.toISOString().split('T')[0];
          const url = `${resourceURL}/contar-osm-por-dia?dataInicio=${dataInicioFormatada}&dataFim=${dataFimFormatada}&status=${status}`;
          const response: AxiosResponse<ApiResponse<DashboardTotaPorDia[]>> = await httpClient.get(url);
          return response.data;
        } catch (error) {
          console.error("❌ Erro ao buscar pedido por dia:", error);
          throw error;
        }
    };

    // const getFichasComPedidoECliente = async (dataInicio: Date, dataFim: Date): Promise<ApiResponse<DashboardTotalFichaPeidoCliente[]>> => {
    //     try {
    //       // Convertendo para string no formato YYYY-MM-DD
    //       const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
    //       const dataFimFormatada = dataFim.toISOString().split('T')[0];
    //       const url = `${resourceURL}/contar-com-terceiro-e-pedido?dataInicio=${dataInicioFormatada}&dataFim=${dataFimFormatada}`;
    //       const response: AxiosResponse<ApiResponse<DashboardTotalFichaPeidoCliente[]>> = await httpClient.get(url);
    //       return response.data;
    //     } catch (error) {
    //       console.error("❌ Erro ao buscar fichas com pedido e cliete:", error);
    //       throw error;
    //     }
    // };
      
    const getFichaPorMesStatus = async (dataInicio: Date, dataFim: Date, status: string): Promise<ApiResponse<DashboardTotaPorMesStatus[]>> => {
        try {
          // Convertendo para string no formato YYYY-MM-DD
          const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
          const dataFimFormatada = dataFim.toISOString().split('T')[0];
          const url = `${resourceURL}/contar-fichas-por-mes-status?dataInicio=${dataInicioFormatada}&dataFim=${dataFimFormatada}&status=${status}`;
          const response: AxiosResponse<ApiResponse<DashboardTotaPorMesStatus[]>> = await httpClient.get(url);
          return response.data;
        } catch (error) {
          console.error("❌ Erro ao buscar Ficha por mes status::", error);
          throw error;
        }
    };

    const getPedidoPorMesStatus = async (dataInicio: Date, dataFim: Date, status: string): Promise<ApiResponse<DashboardTotaPorMesStatus[]>> => {
        try {
          // Convertendo para string no formato YYYY-MM-DD
          const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
          const dataFimFormatada = dataFim.toISOString().split('T')[0];
          const url = `${resourceURL}/contar-pedido-por-mes-status?dataInicio=${dataInicioFormatada}&dataFim=${dataFimFormatada}&status=${status}`;
          const response: AxiosResponse<ApiResponse<DashboardTotaPorMesStatus[]>> = await httpClient.get(url);
          return response.data;
        } catch (error) {
          console.error("❌ Erro ao buscar Pedido por mes status:", error);
          throw error;
        }
    };

    const getOsmPorMesStatus = async (dataInicio: Date, dataFim: Date, status: string): Promise<ApiResponse<DashboardTotaPorMesStatus[]>> => {
        try {
          // Convertendo para string no formato YYYY-MM-DD
          const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
          const dataFimFormatada = dataFim.toISOString().split('T')[0];
          const url = `${resourceURL}/contar-osm-por-mes-status?dataInicio=${dataInicioFormatada}&dataFim=${dataFimFormatada}&status=${status}`;
          const response: AxiosResponse<ApiResponse<DashboardTotaPorMesStatus[]>> = await httpClient.get(url);
          return response.data;
        } catch (error) {
          console.error("❌ Erro ao buscar Ordem Serviço por mes status:", error);
          throw error;
        }
    };

    return {
        getTotalFichasPorMes,
        getTotalFichasPorData,
        getFichasPorStatus,
        getFichasComPedido,
        getFichasComPedidoPorDia,
        getFichaPorDia,
        getPedidoPorDia,
        getOsmPorDia,
        getOsmPorMesStatus,
        getFichaPorMesStatus,
        getPedidoPorMesStatus
    };
};
