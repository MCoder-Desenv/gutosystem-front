import { FichaOrcamentoRelatorio } from "../fichaOrcamento";
import { OrdemServicoManutencaoRelatorio } from "../ordemServicoManutencao";
import { PedidoOrcamentoRelatorio } from "../pedidoOrcamento";

export interface RelatoriosForm {
    id?: number | null;
    dataRelatorio?: string | null;
    pedido?: PedidoOrcamentoRelatorio
    ficha?: FichaOrcamentoRelatorio
    ordemMnt?: OrdemServicoManutencaoRelatorio
}