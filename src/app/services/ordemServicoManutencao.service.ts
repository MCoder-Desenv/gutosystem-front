import { AxiosResponse } from "axios";
import { ApiResponse, Page } from "../models/common";
import { OrdemServicoManutencao, OrdemServicoManutencaoDto } from "../models/ordemServicoManutencao";
import { httpClient } from "../http";

const resourceURL: string = "/api/ordens-servico-manutencao"

export const useOrdemServicoManutencaoService = () => {

    const salvar = async (ordem: OrdemServicoManutencao): Promise<ApiResponse<OrdemServicoManutencao>> => {
        const response: AxiosResponse<ApiResponse<OrdemServicoManutencao>> = await httpClient.post<ApiResponse<OrdemServicoManutencao>>(resourceURL, ordem);
        return response.data; // Aqui você retorna a resposta completa da API
    }

    const atualizar = async (ordem: OrdemServicoManutencao): Promise<void> => {
        try {
            const url: string = `${resourceURL}/atualizar/${ordem.id}`;
            await httpClient.put<OrdemServicoManutencao>(url, ordem);
        } catch (error) {
            console.error("Erro ao atualizar Ordem Serviço Manutenção", error);
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    const carregarOrdemServico = async (id: number) : Promise<ApiResponse<OrdemServicoManutencao>> => {
        const url: string = `${resourceURL}/buscarOrdem/${id}`;
        const response: AxiosResponse<ApiResponse<OrdemServicoManutencao>> = await httpClient.get(url);
        return response.data
    }

    //Para usar no relatorio,é o mesmo caminho da acima OBS: CUIDADO AO ALTERAR
    const findOrdemServMntPedido = async (numero: string = '') : Promise<OrdemServicoManutencaoDto[]> =>{
        const url = `${resourceURL}/ordemMntPedidoPorNumeroList?numero=${numero}`
        const response: AxiosResponse<OrdemServicoManutencaoDto[]> = await httpClient.get(url);
        return response.data
    }

    //Para usar no relatorio,é o mesmo caminho da acima OBS: CUIDADO AO ALTERAR
    const findOrdemServMntRelatorio = async (numero: string = '') : Promise<OrdemServicoManutencaoDto[]> =>{
        const url = `${resourceURL}/ordemMntPedidoPorNumeroList?numero=${numero}`
        const response: AxiosResponse<OrdemServicoManutencaoDto[]> = await httpClient.get(url);
        return response.data
    }

    const findOrdemServico = async (
        numero: string = '',
        idTerceiro: string = '',
        dataInicio: string = '',
        dataFim: string = '',
        page: number = 0,
        size: number = 10
        ): Promise<Page<OrdemServicoManutencaoDto>> => {
        // Verifica se as datas foram passadas
        if (dataInicio && dataFim) {
            const url = `${resourceURL}/ordens?numero=${numero}&idTerceiro=${idTerceiro}&dataInicio=${dataInicio}&dataFim=${dataFim}&page=${page}&size=${size}`;
            const response: AxiosResponse<Page<OrdemServicoManutencaoDto>> = await httpClient.get(url);
            return response.data;
        } else {
            const url = `${resourceURL}/ordens?numero=${numero}&idTerceiro=${idTerceiro}&page=${page}&size=${size}`
            const response: AxiosResponse<Page<OrdemServicoManutencaoDto>> = await httpClient.get(url);
            return response.data;
        }
    };
      
    const gerarRelatorioOrdemServicoManutencao = async (idOrdem: string) : Promise<Blob> => {
        const url = `${resourceURL}/relatorio/ordemServMnt?idOrdem=${idOrdem}`
        const response: AxiosResponse= await httpClient.get(url, {responseType: 'blob'})
        const bytes = response.data
        return new Blob([bytes], {type: 'application/pdf'})
    }

    return {
        salvar,
        atualizar,
        carregarOrdemServico,
        findOrdemServico,
        findOrdemServMntPedido,
        findOrdemServMntRelatorio,
        gerarRelatorioOrdemServicoManutencao
    }

}