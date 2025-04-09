'use client'
import { Layout } from "../../../components/layout"
import { FornecedorForm } from "./form"
import { useEffect, useRef, useState } from "react";
import { Terceiro } from '../../../app/models/terceiros'
import { useTerceiroService } from "../../../app/services";
import { useSearchParams } from "next/navigation"
import { ModalCard } from "../../../components/common/modal";

export const CadastroFornecedores: React.FC = () => {

    const [fornecedor, setFornecedor] = useState<Terceiro>({
        id: '',
        nome: '',
        razaoSocial: '',
        cpf: '',
        cnpj: '',
        status:'',
        dataNascimento: '',
        tipoTerceiro: '',
        observacao: '',
        enderecos: [],
        caracteristicas: []
    });

    //service
    const service = useTerceiroService();
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
            serviceRef.current.carregarTerceiro(id).then(fornecedorRetorna => {
    
                setFornecedor((prevState) => ({
                    ...prevState,
                    ...fornecedorRetorna,
                    id: fornecedorRetorna.data.id || '',
                    nome: fornecedorRetorna.data.nome || '',
                    razaoSocial: fornecedorRetorna.data.razaoSocial || null,
                    cpf: fornecedorRetorna.data.cpf || null,
                    cnpj: fornecedorRetorna.data.cnpj || null,
                    dataNascimento: fornecedorRetorna.data.dataNascimento || null,
                    tipoTerceiro: fornecedorRetorna.data.tipoTerceiro || '',
                    status: fornecedorRetorna.data.status || '',
                    observacao: fornecedorRetorna.data.observacao || '',
                    dataCadastro: fornecedorRetorna.data.dataCadastro || null,
                    caracteristicas: fornecedorRetorna.data.caracteristicas ? fornecedorRetorna.data.caracteristicas.map(car => ({
                        ...car
                    })) : [],
                    enderecos: fornecedorRetorna.data.enderecos ? fornecedorRetorna.data.enderecos.map(end => ({
                        ...end
                    })) : [],
                }));
            });
        }
    }, [queryId]);
    

    const handleSubmit = (fornecedor: Terceiro) => {

        if (fornecedor.id) {
            exibirMensagem("Fornecedor sendo atualizado, aguarde...", "loading");
            service.atualizar(fornecedor).then(fornecedorAtualizado => {
                setFornecedor(fornecedorAtualizado.data);
                setModalVisivel(false);
                exibirMensagem('Fornecedor atualizada com sucesso!', 'success');
            })
            .catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            });
        }
        else {
            exibirMensagem("Fornecedor sendo salvo, aguarde...", "loading");
            service.salvar(fornecedor)
                .then(fornecedorSalvo => {
                    setFornecedor(fornecedorSalvo.data);
                    setModalVisivel(false);
                    exibirMensagem('Fornecedor salvo com sucesso!', 'success');
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
        <Layout titulo="Fornecedores">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <FornecedorForm fornecedores={fornecedor}  onSubmit={handleSubmit}/>
        </Layout>
    )
}