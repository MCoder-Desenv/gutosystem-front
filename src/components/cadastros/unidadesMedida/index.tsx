'use client'
import { Layout } from "../../../components/layout"
import { UnidadeMedidaForm } from "./form"
import { useEffect, useRef, useState } from "react";
import { useUnidadeMedidaService } from "../../../app/services";
import { useSearchParams } from "next/navigation"
import { ModalCard } from "../../../components/common/modal";
import { UnidadeMedida } from "../../../app/models/unidadeMedida";

export const CadastroUnidadesMedida: React.FC = () => {

    const [uniMed, setUniMed] = useState<UnidadeMedida>({
        id: '',
        unidade: '',
        descricao: '',
        status: ''
    });
    const service = useUnidadeMedidaService();
    
    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');

    const searchParams = useSearchParams();
    const queryId = searchParams.get('id'); // Obtém o ID da query

    const serviceRef = useRef(service);

    useEffect(() => {
        const id = parseInt(queryId || '0', 10);
        if (id !== 0 && id !== null && id !== undefined ) {
            serviceRef.current.carregarUnidadeMedida(id).then(uniMedRetorna => {
                setUniMed((prevState) => ({
                    ...prevState,
                    ...uniMedRetorna,
                    id: uniMedRetorna.data.id,
                    unidade: uniMedRetorna.data.unidade,
                    descricao: uniMedRetorna.data.descricao,
                    status: uniMedRetorna.data.status
                }));
            });
        }
    }, [queryId]);

    const handleSubmit = (uniMed: UnidadeMedida) => {
        if (uniMed.id) {
            exibirMensagem("Unidade de Medida sendo Atualizada, aguarde...", "loading");
            service.atualizar(uniMed).then(uniMedAtualizada => {
                setUniMed(uniMedAtualizada.data);
                setModalVisivel(false);
                exibirMensagem('Unidade de Medida Atualizada com sucesso!', 'success');
            })
            .catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            });
        }
        else {
            exibirMensagem("Unidade de Medida sendo Salva, aguarde...", "loading");
            service.salvar(uniMed)
                .then(uniMedSalva => {
                    setUniMed(uniMedSalva.data);
                    setModalVisivel(false);
                    exibirMensagem('Unidade de Medida Salva com sucesso!', 'success');
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
        <Layout titulo="Unidade de Medida">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <UnidadeMedidaForm uniMed={uniMed}  onSubmit={handleSubmit}/>
        </Layout>
    )
}