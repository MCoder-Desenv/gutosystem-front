'use client'
import { Layout } from "../../../components/layout"
import { FichaOrcamentoForm } from "./form"
import { useEffect, useRef, useState } from "react";
import { FichaOrcamento } from '../../../app/models/fichaOrcamento'
import { useFichaOrcamentoService } from "../../../app/services";
import { useSearchParams } from "next/navigation"
import { ModalCard } from "../../../components/common/modal";

export const CadastroFichaOrcamento: React.FC = () => {

    const [fichaOrcamento, setFichaOrcamento] = useState<FichaOrcamento>({
        id: '',
        cliente: {},
        responsavel: {},
        dataSolicitacaoCliente: '',
        acessDifeCheck: '',
        acessDifeObs:'',
        altura:'',
        casaComCheck: '',
        casaComObs: '',
        enderecoCliente: '',
        fotoAmbCheck:'',
        fotoAmbObs:'',
        ilumAmbCheck:'',
        ilumAmbObs:'',
        orcamento:'',
        servExtrCheck:'',
        servExtrObs:'',
        status:'',
        telefoneCliente:'',
        arquivos: [],
        novosArquivos: []
    });
    const service = useFichaOrcamentoService();
    const searchParams = useSearchParams();
    const queryId = searchParams.get('id'); // Obtém o ID da query

    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');

    const serviceRef = useRef(service);
       
    useEffect(() => {
        const id = queryId;
        if (id !== '' && id !== null && id !== undefined) {
            serviceRef.current.carregarFicha(id || '').then(fichaRetorna => {
                setFichaOrcamento({
                    ...fichaRetorna.data,
                    id: fichaRetorna.data.id || '',
                    responsavel: fichaRetorna.data.responsavel,
                    dataSolicitacaoCliente: fichaRetorna.data.dataSolicitacaoCliente || null,
                    acessDifeCheck: fichaRetorna.data.acessDifeCheck || null,
                    acessDifeObs: fichaRetorna.data.acessDifeObs || null,
                    altura: fichaRetorna.data.altura || null,
                    cliente: fichaRetorna.data.cliente,
                    medOrcamento: fichaRetorna.data.medOrcamento,
                    medProducao: fichaRetorna.data.medProducao,
                    casaComCheck: fichaRetorna.data.casaComCheck || null,
                    casaComObs: fichaRetorna.data.casaComObs || null,
                    enderecoCliente: fichaRetorna.data.enderecoCliente || null,
                    fotoAmbCheck: fichaRetorna.data.fotoAmbCheck || null,
                    fotoAmbObs: fichaRetorna.data.fotoAmbObs || null,
                    ilumAmbCheck: fichaRetorna.data.ilumAmbCheck || null,
                    ilumAmbObs: fichaRetorna.data.ilumAmbObs || null,
                    orcamento: fichaRetorna.data.orcamento || null,
                    servExtrCheck: fichaRetorna.data.servExtrCheck || null,
                    servExtrObs: fichaRetorna.data.servExtrObs || null,
                    status: fichaRetorna.data.status || null,
                    telefoneCliente: fichaRetorna.data.telefoneCliente || null,
                    volt110: fichaRetorna.data.volt110 || null,
                    volt220: fichaRetorna.data.volt220 || null,
                    observacoes: fichaRetorna.data.observacoes || null,
                    arquivos: fichaRetorna.data.arquivos || [],
                    novosArquivos: fichaRetorna.data.novosArquivos || []
                });
            });
        }
    }, [queryId]);

    const handleSubmit = (ficha: FichaOrcamento) => {
        if (ficha.id) {
        
            const arquivosParaUpload = ficha.arquivos
                ?.filter((arquivo) => arquivo.file) // Filtra apenas os objetos com `file` definido
                .map((arquivo) => arquivo.file as File); // Garante que será do tipo File
                
            exibirMensagem("Ficha sendo atualizada, aguarde...", "loading");
            service.atualizar(ficha, arquivosParaUpload)
                .then(() => {
                    // Recarregar a ficha para garantir que os arquivos atualizados sejam refletidos
                    service.carregarFicha(ficha.id || '').then((fichaAtualizada) => {
                        setFichaOrcamento(fichaAtualizada.data); // Atualiza o estado com a ficha atualizada
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
         else {       
            const arquivosParaUpload = ficha.arquivos
                ?.filter((arquivo) => arquivo.file) // Filtra apenas os objetos com `file` definido
                .map((arquivo) => arquivo.file as File); // Garante que será do tipo File
                exibirMensagem("Ficha sendo salva, aguarde...", "loading");
            service.salvar(ficha, arquivosParaUpload)
                .then(fichaSalva => {
                    service.carregarFicha(fichaSalva.data?.id || '').then((fichaSalvaRetornada) => {
                        setFichaOrcamento(fichaSalvaRetornada.data); // Atualiza o estado com a ficha atualizada
                    });
                    setModalVisivel(false);
                    exibirMensagem('Ficha de Orçamento Salva com sucesso!', 'success');
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
        <Layout titulo="Ficha de Orcamento">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <FichaOrcamentoForm fichaOrcamento={fichaOrcamento} onSubmit={handleSubmit}/>
        </Layout>
    )
}