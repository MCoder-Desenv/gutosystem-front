'use client'
import { Layout } from "../../../components/layout"
import { TarefaForm } from "./form"
import { useEffect, useRef, useState } from "react";
import { Tarefa } from '../../../app/models/tarefa'
import { useTarefaService } from "../../../app/services";
import { useSearchParams } from "next/navigation"
import { ModalCard } from "../../../components/common/modal";

export const CadastroTarefa: React.FC = () => {

    const [tarefa, setTarefa] = useState<Tarefa>({
        id: null,
        titulo: '',
        prioridade: '',
        descricao: '',
        observacoes: '',
        observacoesFuncionario: '',
        local: '',
        criadoPor: '',
        status: '',
        cliente: {},
        pedido: {},
        ficha: {},
        ordemManutencao: {},
        dataHoraAtividade: '',
        tarefaFuncionario: [],
        arquivos: [],
        novosArquivos: []
    });
    const service = useTarefaService();
    const searchParams = useSearchParams();
    const queryId = searchParams.get('id'); // Obtém o ID da query

    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');

    const serviceRef = useRef(service);
       
    useEffect(() => {
        //const id = queryId;
        const id = parseInt(queryId || '0', 10);
        if (id !== 0 && id !== null && id !== undefined ) {
            serviceRef.current.carregarTarefa(id).then(tarefaRetorna => {
                setTarefa({
                    ...tarefaRetorna.data,
                    id: tarefaRetorna.data.id || null,
                    titulo: tarefaRetorna.data.titulo || null,
                    prioridade: tarefaRetorna.data.prioridade || null,
                    descricao: tarefaRetorna.data.descricao || null,
                    observacoes: tarefaRetorna.data.observacoes || null,
                    observacoesFuncionario: tarefaRetorna.data.observacoesFuncionario || null,
                    local: tarefaRetorna.data.local || null,
                    cliente: tarefaRetorna.data.cliente || null,
                    criadoPor: tarefaRetorna.data.criadoPor || null,
                    status: tarefaRetorna.data.status || null,
                    dataHoraAtividade: tarefaRetorna.data.dataHoraAtividade || null,
                    ficha: tarefaRetorna.data.ficha || null,
                    pedido: tarefaRetorna.data.pedido || null,
                    ordemManutencao: tarefaRetorna.data.pedido || null,
                    tarefaFuncionario: tarefaRetorna.data.tarefaFuncionario || [],
                    arquivos: tarefaRetorna.data.arquivos || [],
                    novosArquivos: tarefaRetorna.data.novosArquivos || []
                });
            });
        }
    }, [queryId]);

    const handleSubmit = (tar: Tarefa) => {
        if (tar.id) {
        
            const arquivosParaUpload = tar.arquivos
                ?.filter((arquivo) => arquivo.file) // Filtra apenas os objetos com `file` definido
                .map((arquivo) => arquivo.file as File); // Garante que será do tipo File
                
            exibirMensagem("Ficha sendo atualizada, aguarde...", "loading");
            service.atualizar(tar, arquivosParaUpload)
                .then(() => {
                    // Recarregar a ficha para garantir que os arquivos atualizados sejam refletidos
                    service.carregarTarefa(tar.id || 0).then((tarAtualizada) => {
                        setTarefa(tarAtualizada.data); // Atualiza o estado com a ficha atualizada
                        setModalVisivel(false);
                        exibirMensagem('Ficha de Orçamento atualizada com sucesso!', 'success');
                    });
                })
                .catch((error) => {
                    if (error) {
                        const detalhesErro = error?.data; // Esse é o objeto { orcamento: "mensagem..." }
                        
                        if (detalhesErro && typeof detalhesErro === "object") {
                            // Formata os erros no formato: "orcamento: O campo orcamento não pode ter mais de 255 caracteres."
                            //const mensagensValidacao = Object.entries(detalhesErro).map(([campo, mensagem]) => `${campo}: ${mensagem}`).join("<br>");
                            const mensagensValidacao = Object.entries(detalhesErro).map(([campo, mensagem]) => `${campo}: ${mensagem}`)
                                .join("\n"); // Usando \n para simular quebra de linha

                            //exibirMensagem(`Erro na validação dos campos: \n${mensagensValidacao.replace(/\n/g, "\n")}`, "error");
                            exibirMensagem("Erro na validação dos campos: \n" + `\n${mensagensValidacao}`, "error");

                        } else {
                            // Caso a API retorne apenas uma string de erro
                            exibirMensagem(error.data || "Erro ao atualizar ficha.", "error");
                        }
                    } else {
                        // Exibe erro genérico caso a API não tenha retornado detalhes
                        exibirMensagem("Erro inesperado ao atualizar ficha.", "error");
                    }
                });
                
        }
        //  else {       
        //     const arquivosParaUpload = tar.arquivos
        //         ?.filter((arquivo) => arquivo.file) // Filtra apenas os objetos com `file` definido
        //         .map((arquivo) => arquivo.file as File); // Garante que será do tipo File
        //         exibirMensagem("Ficha sendo salva, aguarde...", "loading");
        //     service.salvar(tar, arquivosParaUpload)
        //         .then(tarSalva => {
        //             service.carregarTarefa(tarSalva.data?.id || '').then((tarefaSalvaRetornada) => {
        //                 setTarefa(tarefaSalvaRetornada.data); // Atualiza o estado com a ficha atualizada
        //             });
        //             setModalVisivel(false);
        //             exibirMensagem('Ficha de Orçamento Salva com sucesso!', 'success');
        //         })
        //         .catch((error) => {
        //             exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
        //         });
        // }
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
        <Layout titulo="Tarefa">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <TarefaForm tarefa={tarefa} onSubmit={handleSubmit}/>
        </Layout>
    )
}