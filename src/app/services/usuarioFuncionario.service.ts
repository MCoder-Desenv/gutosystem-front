import { AxiosResponse } from "axios";
import { httpClient } from "../http";
import { UsuarioFuncionarioDto } from "../models/usuarioFuncionario";
import { ApiResponse } from "../models/common";

const resourceURL: string = "/api/usuarioFuncionario"

export const useUsuarioFuncionarioService = () => {

    const findUsuarioFuncionario = async (nome: string = '') : Promise<ApiResponse<UsuarioFuncionarioDto[]>> => {
        try {
            const url: string = `${resourceURL}/listarFuncionariosAndUser?nome=${nome}`;
            const response: AxiosResponse<ApiResponse<UsuarioFuncionarioDto[]>> = await httpClient.get(url);
            return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            throw error; // Ou tratar o erro de uma forma mais específica
        }
    }

    return { findUsuarioFuncionario }

}