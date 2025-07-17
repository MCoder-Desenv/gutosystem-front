export interface Terceiro {
    id?: string;
    nome?: string;
    status?: string;
    tipoTerceiro?: string;
    cpf?: string | null;
    cnpj?: string | null;
    razaoSocial?: string | null;
    dataNascimento?: string | null;
    dataCadastro?: string | null;
    observacao?: string | null;
    caracteristicas?: TerceirosCaracteristicas[] | [];
    enderecos?: TerceirosEnderecos[] | [];
}

export interface ClienteDto {
    id?: string;
    nome?: string;
    status?: string;
    cpf?: string | null;
    cnpj?: string | null;
    celular?: string;
    telefones?: string;
}

export interface ClienteFichaDto {
    id?: string;
    nome?: string;
    cpf?: string | null;
    cnpj?: string | null;
    status?: string;
}

export interface FuncionarioDto {
    id?: string;
    nome?: string;
    status?: string;
}

export interface Clientes {
    id?: string;
    nome?: string;
    tipoTerceiro?: string;
    cpf?: string | null;
    cnpj?: string | null;
    razaoSocial?: string | null;
    dataNascimento?: string | null;
    dataCadastro?: string | null;
    observacao?: string | null;
}

export interface Funcionarios {
    id?: string;
    nome?: string;
    tipoTerceiro?: string;
    cpf?: string | null;
    cnpj?: string | null;
    razaoSocial?: string | null;
    dataNascimento?: string | null;
    dataCadastro?: string | null;
    observacao?: string | null;
}

export interface Fornecedores {
    id?: string;
    nome?: string;
    tipoTerceiro?: string;
    cpf?: string | null;
    cnpj?: string | null;
    razaoSocial?: string | null;
    dataNascimento?: string | null;
    observacao?: string | null;
    dataCadastro?: string | null;
}

export interface FornecedorDto {
    id?: string;
    nome?: string;
    status?: string;
    cpf?: string | null;
    cnpj?: string | null;
    tipoTerceiro?: string;
}


export interface TerceirosCaracteristicas {
    id?: string;
    idTerceiro?: string;
    tipo?: string;
    descricao?: string;
    tempId?: string;
}

export interface TerceirosCaracteristicasDescricao {
    descricao?: string;
}

export interface TerceirosEnderecosClienteDto {
    id?: string | null;
    endereco?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    numero?: string | null;
    complemento?: string | null;
}

export interface TerceirosEnderecos {
    id?: string;
    idTerceiro?: string;
    endereco?: string;
    bairro?: string;
    cidade?: string;
    cep?: string;
    estado?: string;
    pais?: string;
    status?: string;
    tipoEndereco?: string;
    complemento?: string;
    numero?: string;
    tempId?: string;
}

export interface TerceiroOrdemServicoManutencao {
    id?: string | null;
    nome?: string | null;
    cpf?: string | null;
    cnpj?: string | null;
}

export interface TerceiroFichaOrcamento {
    id?: string | null;
    nome?: string | null;
    cpf?: string | null;
    cnpj?: string | null;
}

export interface TerceiroPedidoOrcamento {
    id?: string;
    nome?: string;
    cpf?: string | null;
    cnpj?: string | null;
    status?: string;
}