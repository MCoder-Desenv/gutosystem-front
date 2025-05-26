import { Arquivo } from "../arquivos";

export interface TarefaCalendar {
    id?: number | null;
    status?: string | null;
    prioridade?: string | null;
    titulo?: string | null;
    dataHora?: string | null;
}

export interface Tarefa {
    id?: number | null;
    titulo?: string | null;
    prioridade?: string | null;
    descricao?: string | null;
    observacoes?: string | null;
    observacoesFuncionario?: string | null;
    local?: string | null;
    criadoPor?: string | null;
    status?: string | null;
    pedido?: PedidoTarefaCalendar | null,
    ficha?: FichaTarefaCalendar | null,
    ordemManutencao?: OrdemManutencaoTarefaCalendar | null,
    dataHoraAtividade?: string | null;
    arquivos?: Arquivo[]; // Lista de arquivos relacionados à ficha de orçamento
    novosArquivos?: File[]; // Novos arquivos para upload
}

export interface TarefaProjection {
    id?: number | null;
    titulo?: string | null;
    prioridade?: string | null;
    descricao?: string | null;
    dataHora?: string | null;
    status?: string | null;
}

export interface FichaTarefaCalendar {
    id?: string | null;
    orcamento?: string | null;
}

export interface PedidoTarefaCalendar {
    id?: string | null;
}

export interface OrdemManutencaoTarefaCalendar {
    id?: string | null;
}

export interface ClienteTarefaCalendar {
    id?: string | null;
    nome?: string | null;
}

export interface CadastroTarefa {
    id?: number | null;
    tipo?: string | null; //VARIAVÉL AUXILIAR
    titulo?: string | null;
    funcionarios?: FuncionariosTarefa[] | null;
    prioridade?: string | null;
    descricao?: string | null;
    observacoes?: string | null;
    local?: string | null;
    criadoPor?: string | null;
    status?: string | null;
    cliente?: ClienteTarefaCalendar | null;
    ficha?: FichaTarefaCalendar | null;
    pedido?: PedidoTarefaCalendar | null;
    ordemManutencao?: OrdemManutencaoTarefaCalendar | null;
    dataHoraAtividade?: string | null;
}

export interface FuncionariosTarefa {
    id: string;
    userId?: string | null;
    funcId?: string | null;
    funcNome?: string | null;
}

export interface TarefaFicha {
    id: string;
    idCliente?: string | null;
    nomeCliente?: string | null;
    enderecoCliente?: string | null;
    orcamento?: string | null;
    dataSolicitacaoCliente?: string | null;
}

export interface TarefaPedido {
    id: string;
    identificador?: string | null;
    dataPedido?: string | null;
    idReferencia?: string | null;
    enderecoCliente?: string | null;
    telefoneCliente?: string | null;
    idCliente?: string | null;
    nomeCliente?: string | null;
}

export interface TarefaOrdem {
    id: string;
    idCliente?: string | null;
    nomeCliente?: string | null;
    numero?: string | null;
    enderecoCliente?: string | null;
    servicoExecutar?: string | null;
    dataSolicitacaoManutencao?: string | null;
}