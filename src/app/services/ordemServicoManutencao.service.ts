import { AxiosResponse } from "axios";
import { ApiResponse, Page } from "../models/common";
import { OrdemServicoManutencao, OrdemServicoManutencaoDto } from "../models/ordemServicoManutencao";
import { httpClient } from "../http";

const resourceURL: string = "/api/ordens-servico-manutencao"

export const useOrdemServicoManutencaoService = () => {

    const salvar = async (ordem: OrdemServicoManutencao,arquivos?: File[]): Promise<ApiResponse<OrdemServicoManutencao>> => {
        const formData = new FormData();

        // Adiciona os dados da ficha como JSON na parte 'form'
        formData.append("form", new Blob([JSON.stringify(ordem)], { type: "application/json" }));

        // Adiciona os arquivos ao FormData, se existirem
        if (arquivos) {
            arquivos.forEach((arquivo) => {
                formData.append("arquivos", arquivo);
            });
        }

        try {
            // Faz o envio no formato multipart/form-data
            const response: AxiosResponse<ApiResponse<OrdemServicoManutencao>> = await httpClient.post<ApiResponse<OrdemServicoManutencao>>(
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
                throw new Error("Erro ao salvar Ordem Serviço Manutenção. ", error);
            }
        }
    };

    const atualizar = async (ordem: OrdemServicoManutencao, arquivos?: File[]): Promise<ApiResponse<OrdemServicoManutencao>> => {
        const url: string = `${resourceURL}/atualizar/${ordem.id}`;
        const formData = new FormData();
    
        formData.append("form", new Blob([JSON.stringify(ordem)], { type: "application/json" }));
    
        if (arquivos) {
            arquivos.forEach((arquivo) => {
                formData.append("arquivos", arquivo);
            });
        }
            
        try {
            const response: AxiosResponse<ApiResponse<OrdemServicoManutencao>> = await httpClient.put<ApiResponse<OrdemServicoManutencao>>(
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
                throw new Error("Erro ao atualizar Ordem Serviço Manutenção. ", error);
            }
        }
    }

    const carregarOrdemServico = async (id: string) : Promise<ApiResponse<OrdemServicoManutencao>> => {
        const url: string = `${resourceURL}/buscarOrdem/${id}`;
        const response: AxiosResponse<ApiResponse<OrdemServicoManutencao>> = await httpClient.get(url);
        return response.data
    }

    //Para usar no relatorio,é o mesmo caminho da acima OBS: CUIDADO AO ALTERAR
    const findOrdemServMntPedido = async (numero: string = '', status: string = '') : Promise<OrdemServicoManutencaoDto[]> =>{
        const url = `${resourceURL}/ordemMntPedidoPorNumeroList?numero=${numero}&status=${status}`
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
        telefone: string = '',
        dataInicio: string = '',
        dataFim: string = '',
        page: number = 0,
        size: number = 10
        ): Promise<Page<OrdemServicoManutencaoDto>> => {
        // Verifica se as datas foram passadas
        if (dataInicio && dataFim) {
            const url = `${resourceURL}/ordens?numero=${numero}&idTerceiro=${idTerceiro}&telefone=${telefone}&dataInicio=${dataInicio}&dataFim=${dataFim}&page=${page}&size=${size}`;
            const response: AxiosResponse<Page<OrdemServicoManutencaoDto>> = await httpClient.get(url);
            return response.data;
        } else {
            const url = `${resourceURL}/ordens?numero=${numero}&idTerceiro=${idTerceiro}&telefone=${telefone}&page=${page}&size=${size}`
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