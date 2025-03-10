import { FichaOrcamentoPedido } from "../fichaOrcamento";
import { OrdemServicoManutencaoPedido } from "../ordemServicoManutencao";
import { TerceiroPedidoOrcamento } from "../terceiros";

export interface PedidoOrcamento {
    id?: string | null;
    identificador?: string | null;
    dataPedido?: string | null;
    dataPosVenda?: string | null;
    retorno?: string | null;
    satisfacaoCliente?: string | null;
    satisfacaoCheck?: string | null;
    infoComplementar?: string | null;
    vendedor?: TerceiroPedidoOrcamento;
    fichaOrcamento?: FichaOrcamentoPedido;
    ordemServicoManutencao?: OrdemServicoManutencaoPedido;
    responsavelPedido?: TerceiroPedidoOrcamento;
    responsavelMedida?: TerceiroPedidoOrcamento;
    fornecedor?: TerceiroPedidoOrcamento;
    formaDePagamento?: string | null;
    disServico?: string | null;
    total?: number | null;
    produtosPedido?: ProdutoPedidoOrcamento[];
    status?: string | null;
}

export interface ProdutoPedidoOrcamento {
    id?: string;
    tempId: string;
    descricao?: string | null;
    quantidade?: number | null;
    vlrUnitario?: number | null;
    vlrTotal?: number | null;
    idPedidoOrcamento?: string | null;
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