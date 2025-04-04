import { Arquivo } from "../arquivos";
import { TerceiroOrdemServicoManutencao } from "../terceiros";

export interface OrdemServicoManutencao {
    id?: string | null;
    cliente?: TerceiroOrdemServicoManutencao | null;
    telefoneCliente?: string | null;
    enderecoCliente?: string | null;
    dataSolicitacaoManutencao?: string | null; // formato "dd/MM/yyyy"
    tipoManutencaoCheck?: string | null; // formato "dd/MM/yyyy"
    servicoExecutar?: string | null;
    serviceExecutados?: string | null;
    fotoAmbCheck?: string | null;
    fotoAmbObs?: string | null;
    ilumAmbCheck?: string | null;
    ilumAmbObs?: string | null;
    acessDifeCheck?: string | null;
    acessDifeObs?: string | null;
    servExtrCheck?: string | null;
    servExtrObs?: string | null;
    casaComCheck?: string | null;
    casaComObs?: string | null;
    numero?: string | null
    volt110?: boolean | null;
    volt220?: boolean | null;
    observacoes?: string | null;
    produtosOrdemServicoMnt?: ProdutosOrdemServicoMnt[] | null;
    altura?: string | null;
    status?: string | null;
    arquivos?: Arquivo[]; // Lista de arquivos relacionados à ficha de orçamento
    novosArquivos?: File[]; // Novos arquivos para upload
}

export interface ProdutosOrdemServicoMnt {
    id?: string;
    produto?: string | null;
    cor?: string | null;
    quantidade?: number | null;
    ordemServicoManutencaoId?: string | null;
}

export interface OrdemServicoManutencaoPedido {
    id?: string | null;
    dataSolicitacaoManutencao?: string | null; // formato "dd/MM/yyyy"
    numero?: string | null;
    cliente?: TerceiroOrdemServicoManutencao;
    enderecoCliente?: string | null;
    telefoneCliente?: string | null;
    status?: string | null;
}

export interface OrdemServicoManutencaoDto {
    id?: string | null;
    dataSolicitacaoManutencao?: string | null;
    numero?: string | null;
    idCliente?: string | null;
    nomeCliente?: string | null;
    cpf?: string | null;
    cnpj?: string | null;
    enderecoCliente?: string | null;
    telefoneCliente?: string | null;
    status?: string | null;
}

export interface OrdemServicoManutencaoRelatorio {
    id?: string | null;
    dataSolicitacaoManutencao?: string | null;
    numero?: string | null;
    idCliente?: string | null;
    nomeCliente?: string | null;
    status?: string | null;
}