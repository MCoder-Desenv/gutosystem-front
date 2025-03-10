import { AxiosResponse } from "axios";
import { ApiResponse, Page } from "../models/common";
import { PedidoOrcamento, PedidoOrcamentoDto } from "../models/pedidoOrcamento";
import { httpClient } from "../http";

const resourceURL: string = "/api/pedidos-orcamento"

export const usePedidoOrcamentoService = () => {

    const salvar = async (pedido: PedidoOrcamento): Promise<ApiResponse<PedidoOrcamento>> => {
        const response: AxiosResponse<ApiResponse<PedidoOrcamento>> = await httpClient.post<ApiResponse<PedidoOrcamento>>(resourceURL, pedido);
        return response.data; // Aqui você retorna a resposta completa da API
    }

    const atualizar = async (pedido: PedidoOrcamento): Promise<void> => {
        try {
            const url: string = `${resourceURL}/${pedido.id}/atualizar`;
            await httpClient.put<PedidoOrcamento>(url, pedido);
        } catch (error) {
            console.error("Erro ao atualizar Pedido Orçamento", error);
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    const carregarPedido = async (id: number) : Promise<ApiResponse<PedidoOrcamento>> => {
        const url: string = `${resourceURL}/${id}/pedido`;
        const response: AxiosResponse<ApiResponse<PedidoOrcamento>> = await httpClient.get(url);
        return response.data
    }

    const findPedidosAutoComplete = async (identificador: string = '', status: string = '') : Promise<PedidoOrcamentoDto[]> =>{
        const url = `${resourceURL}/pedidoPorIdentificador?identificador=${identificador}&status=${status}`
        const response: AxiosResponse<PedidoOrcamentoDto[]> = await httpClient.get(url);
        return response.data
    }

    const findPedidosAutoCompleteRelatorio = async (identificador: string = '') : Promise<PedidoOrcamentoDto[]> =>{
        const url = `${resourceURL}/pedidoPorIdentificador?identificador=${identificador}`
        const response: AxiosResponse<PedidoOrcamentoDto[]> = await httpClient.get(url);
        return response.data
    }

    const findPedidoCodigo = async (codigo: string = '') : Promise<PedidoOrcamentoDto> =>{
        const url = `${resourceURL}/pedidoPorCodigo?codigo=${codigo}`
        const response: AxiosResponse<PedidoOrcamentoDto> = await httpClient.get(url);
        return response.data
    }

    const findPedidos = async (
        identificador: string = '',
        idTerceiro: string = '',
        dataInicio: string = '',
        dataFim: string = '',
        page: number = 0,
        size: number = 10
      ): Promise<Page<PedidoOrcamentoDto>> => {
        // Verifica se as datas foram passadas
        if (dataInicio && dataFim) {
          const url = `${resourceURL}/pedidos?identificador=${identificador}&idTerceiro=${idTerceiro}&dataInicio=${dataInicio}&dataFim=${dataFim}&page=${page}&size=${size}`;
          const response: AxiosResponse<Page<PedidoOrcamentoDto>> = await httpClient.get(url);
          return response.data;
        } else {
          const url = `${resourceURL}/pedidos?identificador=${identificador}&idTerceiro=${idTerceiro}&page=${page}&size=${size}`;
          const response: AxiosResponse<Page<PedidoOrcamentoDto>> = await httpClient.get(url);
          return response.data;
        }
    };

    //relatórios
    const gerarRelatorioInformacaoComplementar = async (idPedido: string) : Promise<Blob> => {
        const url = `${resourceURL}/relatorio/infoRastreamento?idPedido=${idPedido}`
        const response: AxiosResponse= await httpClient.get(url, {responseType: 'blob'})
        const bytes = response.data
        return new Blob([bytes], {type: 'application/pdf'})
    }
    
    const gerarRelatorioPedidoOrcamento = async (idPedido: string) : Promise<Blob> => {
        const url = `${resourceURL}/relatorio/pedidoOrcamento?idPedido=${idPedido}`
        const response: AxiosResponse= await httpClient.get(url, {responseType: 'blob'})
        const bytes = response.data
        return new Blob([bytes], {type: 'application/pdf'})
    }

    return {
        salvar,
        atualizar,
        carregarPedido,
        findPedidos,
        findPedidosAutoComplete,
        findPedidosAutoCompleteRelatorio,
        gerarRelatorioInformacaoComplementar,
        gerarRelatorioPedidoOrcamento,
        findPedidoCodigo
    }

}