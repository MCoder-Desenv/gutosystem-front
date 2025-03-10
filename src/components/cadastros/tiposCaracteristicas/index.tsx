'use client'
import { Layout } from "../../../components/layout"
import { TiposCaracteristicasForm } from "./form"
import { useEffect, useRef, useState } from "react";
import { useTipoCaracteristicaService } from "../../../app/services";
import { useSearchParams } from "next/navigation"
import { ModalCard } from "../../../components/common/modal";
import { TiposCaracteristicas } from "../../../app/models/tiposCaracteristicas";

export const CadastroTiposCaracteristicas: React.FC = () => {

    const [tipCar, setTipCar] = useState<TiposCaracteristicas>({
        id: '',
        nome: '',
        status: '',
        dataCadastro: ''
    });
    const service = useTipoCaracteristicaService();
    
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
            serviceRef.current.carregarTipCar(id).then(tipCarRetorna => {
                setTipCar((prevState) => ({
                    ...prevState,
                    ...tipCarRetorna,
                    id: tipCarRetorna.id,
                    nome: tipCarRetorna.nome,
                    status: tipCarRetorna.status,
                    dataCadastro: tipCarRetorna.dataCadastro
                }));
            });
        }
    }, [queryId]);

    const handleSubmit = (TiposCaracteristicas: TiposCaracteristicas) => {
        if (TiposCaracteristicas.id) {
            exibirMensagem("Informações Complementares sendo Atualizada, aguarde...", "loading");
            service.atualizar(TiposCaracteristicas).then(tipCarAtualizada => {
                setTipCar(tipCarAtualizada.data);
                setModalVisivel(false);
                exibirMensagem('Informações Complementares Atualizada com sucesso!', 'success');
            })
            .catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            });
        }
        else {
            exibirMensagem("Informações Complementares sendo Salva, aguarde...", "loading");
            service.salvar(TiposCaracteristicas)
                .then(tipCarSalva => {
                    setTipCar(tipCarSalva.data);
                    setModalVisivel(false);
                    exibirMensagem('Informações Complementares Salva com sucesso!', 'success');
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
        <Layout titulo="Informações Complementares">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <TiposCaracteristicasForm tipCar={tipCar}  onSubmit={handleSubmit}/>
        </Layout>
    )
}