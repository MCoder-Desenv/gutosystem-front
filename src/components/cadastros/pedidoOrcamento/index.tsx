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
        infoComplementar: '',
        vendedor: {},
        observacoes: '',
        observacoesInterna: '',
        observacoesInternaInfoRastreamento: '',
        arquivos: [],
        novosArquivos: []
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
        const id = queryId;
        if (id !== '' && id !== null && id !== undefined) {
            serviceRef.current.carregarPedido(id || '').then(pedidoRetorna => {
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
                    observacoes: pedidoRetorna.data.observacoes || '',
                    observacoesInterna: pedidoRetorna.data.observacoesInterna || '',
                    observacoesInternaInfoRastreamento: pedidoRetorna.data.observacoesInternaInfoRastreamento || '',
                    produtosPedido: pedidoRetorna.data.produtosPedido?.map(produto => ({
                        ...produto,
                        informacoesProduto: produto.informacoesProduto || [] // Garantindo que seja um array
                      })) || [],
                    status: pedidoRetorna.data.status || null,
                    total: pedidoRetorna.data.total || undefined,
                    vendedor: pedidoRetorna.data.vendedor || {},
                    infoComplementar: pedidoRetorna.data.infoComplementar || null,
                    arquivos: pedidoRetorna.data.arquivos || [],
                    novosArquivos: pedidoRetorna.data.novosArquivos || []
                });
            });
        }
    }, [queryId]);

    const handleSubmit = (pedido: PedidoOrcamento) => {
        console.log(pedido.observacoesInterna)
        const arquivosParaUpload = pedido.arquivos
                ?.filter((arquivo) => arquivo.file) // Filtra apenas os objetos com `file` definido
                .map((arquivo) => arquivo.file as File); // Garante que será do tipo File
    
        if (pedido.id) {
            exibirMensagem("Pedido de Orçamento sendo Atualizado, aguarde...", "loading");
            service.atualizar(pedido, arquivosParaUpload).then((ped) => {
                service.carregarPedido(ped.data.id || '').then((pedidoAtualizada) => {
                    setPedidoOrcamento(pedidoAtualizada.data); // Atualiza o estado com a ficha atualizada
                    //setModalVisivel(false);
                    //exibirMensagem('Ficha de Orçamento atualizada com sucesso!', 'success');
                });
                setModalVisivel(false);
                exibirMensagem('Pedido de Orçamento Atualizado com sucesso!', 'success');
            })
            .catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            })
        }
        else {
            exibirMensagem("Pedido de Orçamento sendo Salvo, aguarde...", "loading");
            service.salvar(pedido, arquivosParaUpload)
                .then(pedidoSalvo => {
                    service.carregarPedido(pedidoSalvo.data.id || '').then((pedSalvo) => {
                        setPedidoOrcamento(pedSalvo.data); // Atualiza o estado com a ficha atualizada
                        //setModalVisivel(false);
                        //exibirMensagem('Ficha de Orçamento atualizada com sucesso!', 'success');
                    });
                    //setPedidoOrcamento(pedidoSalvo.data);
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
        <Layout titulo="Pedido Orçamento" wide>
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