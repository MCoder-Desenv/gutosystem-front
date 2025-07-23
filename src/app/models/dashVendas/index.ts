export interface DashVendas {
    pedId?: string | null;
    pedDataCriacao?: string | null;
    pedDataPedido?: string | null;
    pedRecuperacaoVenda?: string | null;
    pedIdentificador?: string | null;
    pedCliente?: string | null;
    pedStatus?: string | null;
    pedTotal?: number | null;
}

export interface DashProdutoVendas {
    produto?: string | null;
    categoria?: string | null;
    vezesVendido?: string | null;
    totalQtde?: number | null;
    totalVendido?: number | null;
    pedidos?: string | null;
    idPedidos?: string | null;
}