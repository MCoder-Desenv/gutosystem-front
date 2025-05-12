import { AxiosResponse } from "axios";
import { httpClient } from "../http";
import { FichaOrcamento, FichaOrcamentoDto } from "../models/fichaOrcamento";
import { ApiResponse, Page } from "../models/common";
import { TarefaFicha } from "../models/tarefa";

const resourceURL: string = "/api/fichas-orcamento";

export const useFichaOrcamentoService = () => {

    // Método para criar uma ficha (POST)
    const salvar = async (ficha: FichaOrcamento,arquivos?: File[]): Promise<ApiResponse<FichaOrcamento>> => {
        const formData = new FormData();

        // Adiciona os dados da ficha como JSON na parte 'form'
        formData.append("form", new Blob([JSON.stringify(ficha)], { type: "application/json" }));

        // Adiciona os arquivos ao FormData, se existirem
        if (arquivos) {
            arquivos.forEach((arquivo) => {
                formData.append("arquivos", arquivo);
            });
        }

        // Faz o envio no formato multipart/form-data
        const response: AxiosResponse<ApiResponse<FichaOrcamento>> = await httpClient.post<ApiResponse<FichaOrcamento>>(
            resourceURL,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );

        return response.data;
    };

    // Método para atualizar uma ficha (PUT)
    const atualizar = async (ficha: FichaOrcamento, arquivos?: File[]): Promise<ApiResponse<FichaOrcamento>> => {
        const url: string = `${resourceURL}/${ficha.id}`;
        const formData = new FormData();
    
        formData.append("form", new Blob([JSON.stringify(ficha)], { type: "application/json" }));
    
        if (arquivos) {
            arquivos.forEach((arquivo) => {
                formData.append("arquivos", arquivo);
            });
        }
    
        try {
            const response: AxiosResponse<ApiResponse<FichaOrcamento>> = await httpClient.put<ApiResponse<FichaOrcamento>>(
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
                throw new Error("Erro de conexão ou inesperado ao atualizar ficha.");
            }
        }
    };   

    const carregarFichaTarefa = async (nomeCliente: string = '', telefone: string = '') : Promise<ApiResponse<TarefaFicha[]>> => {
        try {
            const url: string = `${resourceURL}/buscarFichaTarefa?nomeCliente=${nomeCliente}&telefone=${telefone}`;
            const response: AxiosResponse<ApiResponse<TarefaFicha[]>> = await httpClient.get(url);
            return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    // Método para carregar uma ficha pelo ID (GET)
    const carregarFicha = async (id: string): Promise<ApiResponse<FichaOrcamento>> => {
        const url: string = `${resourceURL}/${id}/ficha`;
        const response: AxiosResponse<ApiResponse<FichaOrcamento>> = await httpClient.get(url);
        return response.data;
    };

    const findFichas = async (
            nomeCliente: string = '',
            telefone: string = '',
            codigo: string = '',
            dataInicio: string = '',
            dataFim: string = '',
            page: number = 0,
            size: number = 10
          ): Promise<Page<FichaOrcamentoDto>> => {
            // Verifica se as datas foram passadas
            if (dataInicio && dataFim) {
              const url = `${resourceURL}/fichas?nomeCliente=${nomeCliente}&telefone=${telefone}&codigo=${codigo}&dataInicio=${dataInicio}&dataFim=${dataFim}&page=${page}&size=${size}`;
              const response: AxiosResponse<Page<FichaOrcamentoDto>> = await httpClient.get(url);
              return response.data;
            } else {
              const url = `${resourceURL}/fichas?nomeCliente=${nomeCliente}&telefone=${telefone}&codigo=${codigo}&page=${page}&size=${size}`;
              const response: AxiosResponse<Page<FichaOrcamentoDto>> = await httpClient.get(url);
              return response.data;
            }
        };

    // Método para buscar fichas sem paginação OBS: CUIDADO AO REMOVER O CAMINHO fichasPedido
    const findFichasPedido = async (nomeCliente: string = '', codigo: string = '', status: string = ''): Promise<FichaOrcamentoDto[]> => {
        const url = `${resourceURL}/fichasPedido?nomeCliente=${nomeCliente}&codigo=${codigo}&status=${status}`;
        const response: AxiosResponse<FichaOrcamentoDto[]> = await httpClient.get(url);
        return response.data;
    };

    // Método para buscar fichas sem paginação OBS:CUIDADO AO REMOVER O CAMINHO fichasPedido
    const findFichasRelatorio = async (nomeCliente: string = '', codigo: string = ''): Promise<FichaOrcamentoDto[]> => {
        const url = `${resourceURL}/fichasPedido?nomeCliente=${nomeCliente}&codigo=${codigo}`;
        const response: AxiosResponse<FichaOrcamentoDto[]> = await httpClient.get(url);
        return response.data;
    };

    const gerarRelatorioFichaOrcamento = async (idFicha: string): Promise<Blob | null> => {
        try {
            const url = `${resourceURL}/relatorio/fichaOrcamento?idFicha=${idFicha}`;
            const response: AxiosResponse = await httpClient.get(url, { responseType: 'blob' });
            const bytes = response.data;
            return new Blob([bytes], { type: 'application/pdf' });
        } catch (error) {
            throw error; // Retorna null em caso de erro
        }
    };
    

    return {
        salvar,
        atualizar,
        carregarFicha,
        findFichas,
        findFichasPedido,
        gerarRelatorioFichaOrcamento,
        findFichasRelatorio,
        carregarFichaTarefa
    };
};
