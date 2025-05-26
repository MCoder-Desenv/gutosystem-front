import { Arquivo } from "../arquivos";
import { FichaOrcamentoPedido } from "../fichaOrcamento";
import { OrdemServicoManutencaoPedido } from "../ordemServicoManutencao";
import { TerceiroPedidoOrcamento } from "../terceiros";
import { UnidadeMedida } from "../unidadeMedida";

export interface PedidoOrcamento {
    id?: string | null;
    identificador?: string | null;
    dataPedido?: string | null;
    infoComplementar?: string | null;
    vendedor?: TerceiroPedidoOrcamento;
    fichaOrcamento?: FichaOrcamentoPedido;
    ordemServicoManutencao?: OrdemServicoManutencaoPedido;
    responsavelPedido?: TerceiroPedidoOrcamento;
    responsavelMedida?: TerceiroPedidoOrcamento;
    fornecedor?: TerceiroPedidoOrcamento;
    formaDePagamento?: string | null;
    observacoes?: string | null;
    observacoesInterna?: string | null;
    observacoesInternaInfoRastreamento?: string | null;
    disServico?: string | null;
    total?: number | null;
    produtosPedido?: ProdutoPedidoOrcamento[];
    status?: string | null;
    arquivos?: Arquivo[]; // Lista de arquivos relacionados à ficha de orçamento
    novosArquivos?: File[]; // Novos arquivos para upload
}

export interface ProdutoPedidoOrcamento {
    id?: string;
    produto?: string | null;
    informacoesProduto?: InfoProdutoPedidoOrcamento[]
    idPedidoOrcamento?: string | null;
}

export interface InfoProdutoPedidoOrcamento {
    id?: string;
    descricao?: string | null;
    quantidade?: number | null;
    vlrUnitario?: number | null;
    vlrTotal?: number | null;
    unidadeMedida?: UnidadeMedida | null;
    produtoPedidoOrcamentoId?: string | null;
}

//Faz linkagem com o PedidoOrcamentoOrdemServicoManutencao em findPedidosAutoComplete 
// -- ALERTA VERMELHO AO MEXER - REVER OS CAMPOS A SEREM RETORNADO DA API
export interface PedidoOrcamentoDto {
    id?: string | null;
    identificador?: string | null;
    dataPedido?: string | null;
    status?: string | null;
    idCliente?: string | null;
    nomeTerceiro?: string | null;
    telefoneCliente?: string | null;
    enderecoCliente?: string | null;
}

export interface PedidoOrcamentoRecuperacaoDto {
    id?: string | null;
    status?: string | null;
    dataPedido?: string | null;
    dataRecuperacaoVenda?: string | null;
    telefoneCliente?: string | null;
    nomeCliente?: string | null;
}

//Usado em OrdemServicoManutencao - Faz linkagem com o PedidoOrcamentoDto em findPedidosAutoComplete 
// -- ALERTA VERMELHO AO MEXER - REVER OS CAMPOS A SEREM RETORNADO DA API
export interface PedidoOrcamentoOrdemServicoManutencao {
    id?: string | null;
    identificador?: string | null;
    dataPedido?: string | null;
    status?: string | null;
    idCliente?: string | null;
    nomeTerceiro?: string | null;
    telefoneCliente?: string | null;
    enderecoCliente?: string | null;
}


export interface PedidoOrcamentoRelatorio {
    id?: string | null;
    identificador?: string | null;
    dataPedido?: string | null;
    status?: string | null;
}