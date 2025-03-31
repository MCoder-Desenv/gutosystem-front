'use client'
import { Layout } from "../../../components/layout"
import { OrdemServicoManutencaoForm } from "./form"
import { useEffect, useRef, useState } from "react";
import { OrdemServicoManutencao } from '../../../app/models/ordemServicoManutencao'
import { useOrdemServicoManutencaoService } from "../../../app/services";
import { useSearchParams } from "next/navigation"
import { ModalCard } from "../../../components/common/modal";

export const CadastroOrdemServicoManutencao: React.FC = () => {

    const [ordemServicoManutencao, setOrdemServicoManutencao] = useState<OrdemServicoManutencao>({
        id: '',
        cliente: {},
        telefoneCliente:'',
        enderecoCliente: '',
        dataSolicitacaoManutencao: '',
        tipoManutencaoCheck: '',
        servicoExecutar: '',
        serviceExecutados: '',
        fotoAmbCheck:'',
        fotoAmbObs:'',
        ilumAmbCheck:'',
        ilumAmbObs:'',
        acessDifeCheck: '',
        acessDifeObs:'',
        servExtrCheck:'',
        servExtrObs:'',
        casaComCheck: '',
        casaComObs: '',
        status:'',
        numero: '',
        altura: '',
        observacoes: '',
        produtosOrdemServicoMnt: [],
        arquivos: [],
        novosArquivos: []
    });
    const service = useOrdemServicoManutencaoService();
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
            serviceRef.current.carregarOrdemServico(id || '').then(ordemServRetorna => {
                setOrdemServicoManutencao({
                    ...ordemServRetorna.data,
                    id: ordemServRetorna.data.id || '',
                    dataSolicitacaoManutencao: ordemServRetorna.data.dataSolicitacaoManutencao || null,
                    acessDifeCheck: ordemServRetorna.data.acessDifeCheck || null,
                    acessDifeObs: ordemServRetorna.data.acessDifeObs || null,
                    casaComCheck: ordemServRetorna.data.casaComCheck || null,
                    casaComObs: ordemServRetorna.data.casaComObs || null,
                    enderecoCliente: ordemServRetorna.data.enderecoCliente || null,
                    fotoAmbCheck: ordemServRetorna.data.fotoAmbCheck || null,
                    fotoAmbObs: ordemServRetorna.data.fotoAmbObs || null,
                    ilumAmbCheck: ordemServRetorna.data.ilumAmbCheck || null,
                    ilumAmbObs: ordemServRetorna.data.ilumAmbObs || null,
                    servExtrCheck: ordemServRetorna.data.servExtrCheck || null,
                    servExtrObs: ordemServRetorna.data.servExtrObs || null,
                    status: ordemServRetorna.data.status || null,
                    telefoneCliente: ordemServRetorna.data.telefoneCliente || null,
                    observacoes: ordemServRetorna.data.observacoes || null,
                    numero: ordemServRetorna.data.numero || null,
                    volt110: ordemServRetorna.data.volt110 || null,
                    volt220: ordemServRetorna.data.volt220 || null,
                    serviceExecutados: ordemServRetorna.data.serviceExecutados || null,
                    servicoExecutar: ordemServRetorna.data.servicoExecutar || null,
                    cliente: ordemServRetorna.data.cliente || {},
                    tipoManutencaoCheck: ordemServRetorna.data.tipoManutencaoCheck || null,
                    altura: ordemServRetorna.data.altura || null,
                    produtosOrdemServicoMnt: ordemServRetorna.data.produtosOrdemServicoMnt || [],
                    arquivos: ordemServRetorna.data.arquivos || [],
                    novosArquivos: ordemServRetorna.data.novosArquivos || []
                });
            });
        }
    }, [queryId]);

    const handleSubmit = (ordemServico: OrdemServicoManutencao) => {

        const arquivosParaUpload = ordemServico.arquivos
                ?.filter((arquivo) => arquivo.file) // Filtra apenas os objetos com `file` definido
                .map((arquivo) => arquivo.file as File); // Garante que será do tipo Fil
    
        if (ordemServico.id) {
            exibirMensagem("Ordem de Serviço Manutenção sendo atualizada, aguarde...", "loading");
            service.atualizar(ordemServico, arquivosParaUpload).then((ord) => {
                service.carregarOrdemServico(ord.data.id || '').then((ordemAtualizada) => {
                    setOrdemServicoManutencao(ordemAtualizada.data); // Atualiza o estado com a ficha atualizada
                });
                setModalVisivel(false);
                exibirMensagem('Ordem de Serviço Manutenção Atualizada com Sucesso!!', 'success');
            })
            .catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            });
        }
        else {
            exibirMensagem("Ordem de Serviço Manutenção sendo Salva, aguarde...", "loading");
            console.log(JSON.stringify(ordemServico.produtosOrdemServicoMnt, null, 2));
            service.salvar(ordemServico, arquivosParaUpload).then(ordemServicoSalva => {
                service.carregarOrdemServico(ordemServicoSalva.data.id || '').then((ordSalvo) => {
                    setOrdemServicoManutencao(ordSalvo.data); // Atualiza o estado com a ficha atualizada
                });
                setModalVisivel(false);
                exibirMensagem('Ordem de Serviço Manutenção Salva com Sucesso!!', 'success');
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
        <Layout titulo="Ordem de Serviço Manutenção">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <OrdemServicoManutencaoForm ordemServicoManutencao={ordemServicoManutencao} onSubmit={handleSubmit}/>
        </Layout>
    )
}