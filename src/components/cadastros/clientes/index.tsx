'use client'
import { Layout } from "@/components/layout"
import { ClienteForm } from "./form"
import { useEffect, useRef, useState } from "react";
import { Terceiro } from '@/app/models/terceiros'
import { useTerceiroService } from "@/app/services";
import { useSearchParams } from "next/navigation"
import { ModalCard } from "@/components/common/modal";

export const CadastroClientes: React.FC = () => {

    const [cliente, setCliente] = useState<Terceiro>({
        id: '',
        nome: '',
        razaoSocial: '',
        cpf: '',
        cnpj: '',
        status:'',
        dataNascimento: '',
        tipoTerceiro: '',
        enderecos: [],
        caracteristicas: []
    });
    const service = useTerceiroService();
    const serviceRef = useRef(service);
    const searchParams = useSearchParams();
    const queryId = searchParams.get('id'); // Obtém o ID da query

    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');

    useEffect(() => {
        const id = parseInt(queryId || '0', 10);
        if (id !== 0 && id !== null && id !== undefined ) {
            serviceRef.current.carregarTerceiro(id).then(clienteRetorna => {
    
                setCliente((prevState) => ({
                    ...prevState,
                    ...clienteRetorna,
                    id: clienteRetorna.data.id || '',
                    dataCadastro: clienteRetorna.data.dataCadastro || '',
                    status: clienteRetorna.data.status || '',
                    nome: clienteRetorna.data.nome || '',
                    razaoSocial: clienteRetorna.data.razaoSocial || null,
                    cpf: clienteRetorna.data.cpf || null,
                    cnpj: clienteRetorna.data.cnpj || null,
                    dataNascimento: clienteRetorna.data.dataNascimento || null,
                    tipoTerceiro: clienteRetorna.data.tipoTerceiro || '',
                    caracteristicas: clienteRetorna.data.caracteristicas ? clienteRetorna.data.caracteristicas.map(car => ({
                        ...car
                    })) : [],
                    enderecos: clienteRetorna.data.enderecos ? clienteRetorna.data.enderecos.map(end => ({
                        ...end
                    })) : [],
                }));
            }).catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            });
        }
    }, [queryId]);

    const handleSubmit = (cliente: Terceiro) => {

        if (cliente.id) {
            exibirMensagem("Cliente sendo atualizada, aguarde...", "loading");
            service.atualizar(cliente).then(clienteAtualizado => {
                setModalVisivel(false);
                setCliente(clienteAtualizado.data);
                exibirMensagem('Cliente atualizada com sucesso!', 'success');
            })
            .catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            });
        }
        else {
            exibirMensagem("Cliente sendo salvo, aguarde...", "loading");
            service.salvar(cliente)
                .then(clienteSalvo => {
                    setModalVisivel(false);
                    setCliente(clienteSalvo.data);
                    exibirMensagem('Cliente salvo com sucesso!', 'success');
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
        <Layout titulo="Clientes">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <ClienteForm cliente={cliente}  onSubmit={handleSubmit}/>
        </Layout>
    )
}