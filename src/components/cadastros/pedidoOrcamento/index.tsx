'use client'
import { Layout } from "../../../components/layout"
import { useEffect, useRef, useState } from "react";
import { usePedidoOrcamentoService } from "../../../app/services";
import { useSearchParams } from "next/navigation"
import { PedidoOrcamento } from "../../../app/models/pedidoOrcamento";
import { PedidoOrcamentoForm } from "./form";
import { ModalCard } from "../../../components/common/modal";

export const CadastroPedidoOrcamento: React.FC = () => {

    const [pedidoOrcamento, setPedidoOrcamento] = useState<PedidoOrcamento>({
        id: '',
        dataPedido: '',
        disServico: '',
        fichaOrcamento: {},
        ordemServicoManutencao: {},
        formaDePagamento: '',
        identificador: '',
        fornecedor: {},
        responsavelMedida: {},
        responsavelPedido: {},
        produtosPedido: [],
        status: '',
        total: undefined,
        dataPosVenda: '',
        infoComplementar: '',
        retorno: '',
        satisfacaoCheck: '',
        satisfacaoCliente: '',
        vendedor: {} 
    });
    const service = usePedidoOrcamentoService();
    const searchParams = useSearchParams();
    const queryId = searchParams.get('id'); // Obtém o ID da query

    const serviceRef = useRef(service);

    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');
       
    useEffect(() => {
        const id = parseInt(queryId || '0', 10);
        if (id !== 0 && id !== null && id !== undefined ) {
            serviceRef.current.carregarPedido(id).then(pedidoRetorna => {
                setPedidoOrcamento({
                    ...pedidoRetorna.data,
                    id: pedidoRetorna.data.id || '',
                    dataPedido: pedidoRetorna.data.dataPedido || '',
                    disServico: pedidoRetorna.data.disServico || '',
                    fichaOrcamento: pedidoRetorna.data.fichaOrcamento || {},
                    ordemServicoManutencao: pedidoRetorna.data.ordemServicoManutencao || {},
                    formaDePagamento: pedidoRetorna.data.formaDePagamento || '',
                    identificador: pedidoRetorna.data.identificador || '',
                    fornecedor: pedidoRetorna.data.fornecedor || {},
                    responsavelMedida: pedidoRetorna.data.responsavelMedida || {},
                    responsavelPedido: pedidoRetorna.data.responsavelPedido || {},
                    produtosPedido: pedidoRetorna.data.produtosPedido || [],
                    status: pedidoRetorna.data.status || null,
                    total: pedidoRetorna.data.total || undefined,
                    vendedor: pedidoRetorna.data.vendedor || {},
                    dataPosVenda: pedidoRetorna.data.dataPosVenda || null,
                    infoComplementar: pedidoRetorna.data.infoComplementar || null,
                    retorno: pedidoRetorna.data.retorno || null,
                    satisfacaoCheck: pedidoRetorna.data.satisfacaoCheck || null,
                    satisfacaoCliente: pedidoRetorna.data.satisfacaoCliente || null,
                });
            });
        }
    }, [queryId]);

    const handleSubmit = (pedido: PedidoOrcamento) => {
    
        if (pedido.id) {
            exibirMensagem("Pedido de Orçamento sendo Atualizado, aguarde...", "loading");
            service.atualizar(pedido).then(() => {
                setModalVisivel(false);
                exibirMensagem('Pedido de Orçamento Atualizado com sucesso!', 'success');
            })
            .catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            })
        }
        else {
            exibirMensagem("Pedido de Orçamento sendo Salvo, aguarde...", "loading");
            service.salvar(pedido)
                .then(pedidoSalvo => {
                    setPedidoOrcamento(pedidoSalvo.data);
                    setModalVisivel(false);
                    exibirMensagem('Pedido de Orçamento Salvo com sucesso!', 'success');
                })
                .catch((error) => {
                    exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
                });
        }
    }

    const exibirMensagem = (texto: string, tipo: 'success' | 'error' | 'loading') => {
        setModalMensagem(texto);
        setModalTipo(tipo);
        setModalVisivel(true);
    
        // Só fechar automaticamente se for mensagem de sucesso
        if (tipo === 'success') {
            setTimeout(() => {
                setModalVisivel(false);
            }, 1500);
        }
    };

    return (
        <Layout titulo="Pedido Orçamento">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <PedidoOrcamentoForm pedidoOrcamento={pedidoOrcamento} onSubmit={handleSubmit}/>
        </Layout>
    )
}