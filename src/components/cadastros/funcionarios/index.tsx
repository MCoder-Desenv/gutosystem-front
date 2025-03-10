'use client'
import { Layout } from "../../../components/layout"
import { FuncionarioForm } from "./form"
import { useEffect, useRef, useState } from "react";
import { Terceiro } from '../../../app/models/terceiros'
import { useTerceiroService } from "../../../app/services";
import { useSearchParams } from "next/navigation"
import { ModalCard } from "../../../components/common/modal";

export const CadastroFuncionarios: React.FC = () => {

    const [funcionario, setFuncionario] = useState<Terceiro>({
        id: '',
        nome: '',
        cpf: '',
        status:'',
        dataNascimento: '',
        tipoTerceiro: '',
        enderecos: [],
        caracteristicas: []
    });
    const service = useTerceiroService();
    
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
            serviceRef.current.carregarTerceiro(id).then(funcionarioRetorna => {
    
                setFuncionario((prevState) => ({
                    ...prevState,
                    ...funcionarioRetorna,
                    id: funcionarioRetorna.data.id || '',
                    nome: funcionarioRetorna.data.nome || '',
                    cpf: funcionarioRetorna.data.cpf || null,
                    dataNascimento: funcionarioRetorna.data.dataNascimento || null,
                    dataCadastro: funcionarioRetorna.data.dataCadastro || null,
                    tipoTerceiro: funcionarioRetorna.data.tipoTerceiro || '',
                    status: funcionarioRetorna.data.status || '',
                    caracteristicas: funcionarioRetorna.data.caracteristicas ? funcionarioRetorna.data.caracteristicas.map(car => ({
                        ...car
                    })) : [],
                    enderecos: funcionarioRetorna.data.enderecos ? funcionarioRetorna.data.enderecos.map(end => ({
                        ...end
                    })) : [],
                }));
            });
        }
    }, [queryId]);

    const handleSubmit = (funcionario: Terceiro) => {
        if (funcionario.id) {
            exibirMensagem("Funcionário sendo atualizado, aguarde...", "loading");
            service.atualizar(funcionario).then(funcionarioAtualizado => {
                setFuncionario(funcionarioAtualizado.data);
                setModalVisivel(false);
                exibirMensagem('Funcionário atualizado com sucesso!', 'success');
            })
            .catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            });
        }
        else {
            exibirMensagem("Funcionário sendo salvo, aguarde...", "loading");
            service.salvar(funcionario)
                .then(funcionarioSalvo => {
                    setFuncionario(funcionarioSalvo.data);
                    setModalVisivel(false);
                    exibirMensagem('Funcionário salvo com sucesso!', 'success');
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
        <Layout titulo="Funcionários">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <FuncionarioForm funcionario={funcionario}  onSubmit={handleSubmit}/>
        </Layout>
    )
}