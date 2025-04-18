import { Arquivo } from "../arquivos";
import { TerceiroFichaOrcamento } from "../terceiros";

export interface FichaOrcamento {
    id?: string | null;
    dataSolicitacaoCliente?: string | null; // formato "dd/MM/yyyy"
    status?: string | null;
    cliente?: TerceiroFichaOrcamento;
    responsavel?: TerceiroFichaOrcamento;
    telefoneCliente?: string | null;
    enderecoCliente?: string | null;
    orcamento?: string | null;
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
    volt110?: boolean | null;
    volt220?: boolean | null;
    altura?: string | null;
    observacoes?: string | null;
    medOrcamento?: boolean | null;
    medProducao?: boolean | null;
    arquivos?: Arquivo[]; // Lista de arquivos relacionados à ficha de orçamento
    novosArquivos?: File[]; // Novos arquivos para upload
}

export interface FichaOrcamentoPedido {
    id?: string | null;
    dataSolicitacaoCliente?: string | null;
    status?: string | null;
    cliente?: TerceiroFichaOrcamento | null;
    telefoneCliente?: string | null;
    enderecoCliente?: string | null;
}

export interface FichaOrcamentoDto {
    id?: string;
    idCliente?: string | null;
    nomeCliente?: string | null;
    cpf?: string | null;
    cnpj?: string | null;
    dataSolicitacaoCliente?: string | null;
    enderecoCliente?: string | null;
    telefoneCliente?: string | null;
    status?: string | null;
}

export interface FichaOrcamentoRelatorio {
    id?: string;
    idCliente?: string | null;
    nomeCliente?: string | null;
    dataSolicitacaoCliente?: string | null;
    status?: string | null;
}
