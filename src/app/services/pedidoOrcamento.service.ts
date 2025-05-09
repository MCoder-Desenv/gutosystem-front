import { AxiosResponse } from "axios";
import { ApiResponse, Page } from "../models/common";
import { PedidoOrcamento, PedidoOrcamentoDto, PedidoOrcamentoRecuperacaoDto } from "../models/pedidoOrcamento";
import { httpClient } from "../http";

const resourceURL: string = "/api/pedidos-orcamento"

export const usePedidoOrcamentoService = () => {

    // const salvar = async (pedido: PedidoOrcamento): Promise<ApiResponse<PedidoOrcamento>> => {
    //     const response: AxiosResponse<ApiResponse<PedidoOrcamento>> = await httpClient.post<ApiResponse<PedidoOrcamento>>(resourceURL, pedido);
    //     return response.data; // Aqui você retorna a resposta completa da API
    // }

    // Método para criar uma ficha (POST)
    const salvar = async (pedido: PedidoOrcamento,arquivos?: File[]): Promise<ApiResponse<PedidoOrcamento>> => {
        const formData = new FormData();

        // Adiciona os dados da ficha como JSON na parte 'form'
        formData.append("form", new Blob([JSON.stringify(pedido)], { type: "application/json" }));

        // Adiciona os arquivos ao FormData, se existirem
        if (arquivos) {
            arquivos.forEach((arquivo) => {
                formData.append("arquivos", arquivo);
            });
        }

        try {
            // Faz o envio no formato multipart/form-data
            const response: AxiosResponse<ApiResponse<PedidoOrcamento>> = await httpClient.post<ApiResponse<PedidoOrcamento>>(
                resourceURL,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            return response.data;
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.data) {
                // Se o erro veio da API, extrai a mensagem e os detalhes
                throw error; 
            } else {
                throw new Error("Erro ao salvar Pedido Orçamento. ", error);
            }
        }
    };

    const atualizar = async (pedido: PedidoOrcamento, arquivos?: File[]): Promise<ApiResponse<PedidoOrcamento>> => {
        const url: string = `${resourceURL}/${pedido.id}/atualizar`;
        const formData = new FormData();
    
        formData.append("form", new Blob([JSON.stringify(pedido)], { type: "application/json" }));
    
        if (arquivos) {
            arquivos.forEach((arquivo) => {
                formData.append("arquivos", arquivo);
            });
        }
            
        try {
            const response: AxiosResponse<ApiResponse<PedidoOrcamento>> = await httpClient.put<ApiResponse<PedidoOrcamento>>(
                url,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
    
            return response.data; // Retorna a resposta bem-sucedida
    
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.data) {
                // Se o erro veio da API, extrai a mensagem e os detalhes
                throw error; 
            } else {
                throw new Error("Erro ao atualizar Pedido Orçamento. ", error);
            }
        }
        // try {
        //     const url: string = `${resourceURL}/${pedido.id}/atualizar`;
        //     await httpClient.put<PedidoOrcamento>(url, pedido);
        // } catch (error) {
        //     console.error("Erro ao atualizar Pedido Orçamento", error);
        //     throw error; // Ou tratar o erro de uma forma mais específica
        // }
    }

    const carregarPedido = async (id: string) : Promise<ApiResponse<PedidoOrcamento>> => {
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

    const atualizarRecuperacaoPedido = async (func: PedidoOrcamentoRecuperacaoDto[]): Promise<ApiResponse<PedidoOrcamentoRecuperacaoDto[]>> => {
        const url = `${resourceURL}/atualizarRecuperacaoPedido`;
        const response: AxiosResponse<ApiResponse<PedidoOrcamentoRecuperacaoDto[]>> = await httpClient.put<ApiResponse<PedidoOrcamentoRecuperacaoDto[]>>(url, func);
        return response.data; // Aqui você retorna a resposta completa da API
    }

    const findAllPedidosRecuperacaoList = async (): Promise<ApiResponse<PedidoOrcamentoRecuperacaoDto[]>> => {
        const url = `${resourceURL}/pedidosRecuperacaoList`;
        const response: AxiosResponse<ApiResponse<PedidoOrcamentoRecuperacaoDto[]>> = await httpClient.get(url);
        return response.data;
    };

    const findPedidosRecuperacao = async (
        identificador: string = '',
        cliente: string = '',
        telefone: string = '',
        dataInicio: string = '',
        dataFim: string = '',
        page: number = 0,
        size: number = 10
      ): Promise<ApiResponse<Page<PedidoOrcamentoRecuperacaoDto>>> => {
        // Verifica se as datas foram passadas

        if (dataInicio && dataFim) {
            const url = `${resourceURL}/pedidosRecuperacao?dataInicio=${dataInicio}&dataFim=${dataFim}&page=${page}&size=${size}`;
            const response: AxiosResponse<ApiResponse<Page<PedidoOrcamentoRecuperacaoDto>>> = await httpClient.get(url);
            return response.data;
          } else {
            const url = `${resourceURL}/pedidosRecuperacao?identificador=${identificador}&cliente=${cliente}&telefone=${telefone}&page=${page}&size=${size}`;
            const response: AxiosResponse<ApiResponse<Page<PedidoOrcamentoRecuperacaoDto>>> = await httpClient.get(url);
            return response.data;
          }
    };

    const findPedidos = async (
        identificador: string = '',
        telefone: string = '',
        idTerceiro: string = '',
        dataInicio: string = '',
        dataFim: string = '',
        page: number = 0,
        size: number = 10
      ): Promise<Page<PedidoOrcamentoDto>> => {
        // Verifica se as datas foram passadas
        if (dataInicio && dataFim) {
          const url = `${resourceURL}/pedidos?identificador=${identificador}&telefone=${telefone}&idTerceiro=${idTerceiro}&dataInicio=${dataInicio}&dataFim=${dataFim}&page=${page}&size=${size}`;
          const response: AxiosResponse<Page<PedidoOrcamentoDto>> = await httpClient.get(url);
          return response.data;
        } else {
          const url = `${resourceURL}/pedidos?identificador=${identificador}&telefone=${telefone}&idTerceiro=${idTerceiro}&page=${page}&size=${size}`;
          const response: AxiosResponse<Page<PedidoOrcamentoDto>> = await httpClient.get(url);
          return response.data;
        }
    };

    //relatórios
    const gerarRelatorioInformacaoComplementar = async (idPedido: string, dataImpressao: string | null) : Promise<Blob> => {
        let url: string
        if (dataImpressao === null) {
            url = `${resourceURL}/relatorio/infoRastreamento?idPedido=${idPedido}`
        }
        else {
            url = `${resourceURL}/relatorio/infoRastreamento?idPedido=${idPedido}&dataImpressao=${dataImpressao}`
        }
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
        atualizarRecuperacaoPedido,
        findPedidosRecuperacao,
        findAllPedidosRecuperacaoList,
        findPedidos,
        findPedidosAutoComplete,
        findPedidosAutoCompleteRelatorio,
        gerarRelatorioInformacaoComplementar,
        gerarRelatorioPedidoOrcamento,
        findPedidoCodigo
    }

}