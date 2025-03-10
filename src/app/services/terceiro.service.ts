import { AxiosResponse } from "axios";
import { httpClient } from "../http";
import { Terceiro, ClienteDto, FuncionarioDto, ClienteFichaDto, FornecedorDto } from "../models/terceiros";
import { ApiResponse, Page } from "../models/common/page";

const resourceURL: string = "/api/terceiros"

export const useTerceiroService = () => {

    const salvar = async (terceiro: Terceiro): Promise<ApiResponse<Terceiro>> => {
        try {
            const url: string = `${resourceURL}/salvar`;
            const response: AxiosResponse<ApiResponse<Terceiro>> = await httpClient.post<ApiResponse<Terceiro>>(url, terceiro);
            return response.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            //console.error("Erro ao salvar Terceiro: ", error.message || error);
            throw error; // Propaga o erro para o front-end
        }
    };

    const atualizar = async (terceiro: Terceiro): Promise<ApiResponse<Terceiro>> => {
        try {
            const url: string = `${resourceURL}/atualizar/${terceiro.id}`;
            const response: AxiosResponse<ApiResponse<Terceiro>> = await httpClient.put<ApiResponse<Terceiro>>(url, terceiro);
            return response.data; // Retorna o objeto atualizado
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error;
        }
    };
    

    const carregarTerceiro = async (id: number) : Promise<ApiResponse<Terceiro>> => {
        try {
            const url: string = `${resourceURL}/buscar/${id}`;
            const response: AxiosResponse<ApiResponse<Terceiro>> = await httpClient.get(url);
            return response.data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error;
        }
    }

    const deletar = async (id: number): Promise<void> =>{
        const url: string = `${resourceURL}/${id}`;
        await httpClient.delete(url)
    }

    const deletarCar = async (id: string): Promise<void> =>{
        const url: string = `${resourceURL}/caracteristicas/${id}`;
        await httpClient.delete(url)
    }

    const findClientes = async (nome: string = '', page: number = 0, size: number = 10) : Promise<ApiResponse<Page<ClienteDto>>> =>{
        try {
            const url = `${resourceURL}/clientes?nome=${nome}&page=${page}&size=${size}`
            const response: AxiosResponse<ApiResponse<Page<ClienteDto>>> = await httpClient.get(url);
            return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error;
        }
    }

    const findFornecedores = async (nome: string = '', page: number = 0, size: number = 10) : Promise<ApiResponse<Page<FornecedorDto>>> =>{
        try {
            const url = `${resourceURL}/fornecedores?nome=${nome}&page=${page}&size=${size}`
            const response: AxiosResponse<ApiResponse<Page<ClienteDto>>> = await httpClient.get(url);
            return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error;
        }
    }

    const findClienteFichaAutoComplete = async (nome: string = '', cpf: string = '', cnpj: string = '') : Promise<ApiResponse<ClienteFichaDto[]>> =>{
        try {
            const url = `${resourceURL}/clienteFicha?nome=${nome}&cpf=${cpf}&cnpj=${cnpj}`
            const response: AxiosResponse<ApiResponse<ClienteFichaDto[]>> = await httpClient.get(url);
            return response.data
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (error: any) {
            throw error;
        }
    }

    const findClienteAutoComplete = async (nome: string = '', codigo: string = '') : Promise<ApiResponse<ClienteDto[]>> =>{
        try {
            const url = `${resourceURL}/clientesPorNomeId?nome=${nome}&codigo=${codigo}`
            const response: AxiosResponse<ApiResponse<ClienteDto[]>> = await httpClient.get(url);
            return response.data
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (error: any) {
            throw error;
        }
    }
    

    const findFuncionarioAutoComplete = async (nome: string = '', codigo: string = '') : Promise<ApiResponse<FuncionarioDto[]>> =>{
        try {
            const url = `${resourceURL}/funcionarioAutoComplete?nome=${nome}&codigo=${codigo}`
            const response: AxiosResponse<ApiResponse<FuncionarioDto[]>> = await httpClient.get(url);
            return response.data
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (error: any) {
            throw error;
        }
    }

    const findFornecedorAutoComplete = async (nome: string = '', codigo: string = '') : Promise<ApiResponse<FuncionarioDto[]>> =>{
        try {
            const url = `${resourceURL}/fornecedoresAutoComplete?nome=${nome}&codigo=${codigo}`
            const response: AxiosResponse<ApiResponse<FuncionarioDto[]>> = await httpClient.get(url);
            return response.data
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (error: any) {
            throw error;
        }
    }

    const findFuncionarios = async (nome: string = '', page: number = 0, size: number = 10) : Promise<ApiResponse<Page<FuncionarioDto>>> =>{
        try {
            const url = `${resourceURL}/funcionarios?nome=${nome}&page=${page}&size=${size}`
            const response: AxiosResponse<ApiResponse<Page<FuncionarioDto>>> = await httpClient.get(url);
            return response.data
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (error: any) {
            throw error;
        }
    }

    return {
        salvar,
        atualizar,
        carregarTerceiro,
        deletar,
        deletarCar,
        findClientes,
        findFuncionarios,
        findClienteAutoComplete,
        findClienteFichaAutoComplete,
        findFuncionarioAutoComplete,
        findFornecedorAutoComplete,
        findFornecedores
    }

}