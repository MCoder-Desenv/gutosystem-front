'use client';
import { Tarefa } from '../../../app/models/tarefa';
import { Arquivo } from '../../../app/models/arquivos';
import { TerceirosEnderecosClienteDto } from '../../../app/models/terceiros';
import { FuncionariosTarefa } from "../../../app/models/tarefa";
import GenericMultiSelect from "../../../components/common/genericMultiSelect";
import { useTerceiroCaracteristicaService, useTerceiroService, useTerceiroEnderecoService, useFichaOrcamentoService, useMediaService, useTarefaService, usePedidoOrcamentoService, useOrdemServicoManutencaoService, useUsuarioFuncionarioService } from '../../../app/services';
import { Input } from '../../../components';
import { useOrcamentoContext } from '../../../contexts/OrcamentoContext';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';
import { Galleria } from 'primereact/galleria';
import { v4 as uuidv4 } from 'uuid';
import { ButtonType } from '../../../components/common/button';
import { ModalCard } from '../../../components/common/modal';
import { AutoCompleteGenerico } from '../../../components/common';
import { usePermissao } from '../../../app/hooks/usePermissoes';
import { TemplateImagem } from '../../../components/common/templateImagem';
import styles from './tarefa.module.css';
import { format } from 'date-fns';
import { formatDateToBackend } from "../../../app/util/formatData";

interface TarefaFormProps {
    tarefa: Tarefa;
    onSubmit: (tarefa: Tarefa) => void;
}
const campoObrigatorio = 'Campo Obrigatório';

const validationScheme = Yup.object().shape({
    status: Yup.string().trim().required(campoObrigatorio)
});

// const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
// const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "video/mp4", "image/heic", "image/heif"];

export const TarefaForm: React.FC<TarefaFormProps> = ({
    tarefa,
    onSubmit
}) => {
    const [listaEnderecos, setListaEnderecos] = useState<TerceirosEnderecosClienteDto[]>([]);
    const gerarValorEndereco = (item: TerceirosEnderecosClienteDto) =>
      [item.endereco, item.numero, item.bairro, item.cidade].filter(Boolean).join(", ");
    //const [listaEnderecos, setListaEnderecos] = useState<TerceirosEnderecosClienteDto[]>([tarefa.local] || []);

    const galleria = useRef<Galleria | null>(null); // Define o tipo correto
    const [indiceAtual, setIndiceAtual] = useState(0);

    //Services
    const service = useTarefaService();
    const serviceFicha = useFichaOrcamentoService();
    const servicePedido = usePedidoOrcamentoService();
    const serviceOrdemMnt = useOrdemServicoManutencaoService();

    const serviceTerceiro = useTerceiroService();
    const serviceUserFunc = useUsuarioFuncionarioService();
    const serviceClienteEnderecos = useTerceiroEnderecoService();
    const mediaService = useMediaService();
    const router = useRouter();

    const statusOptions = [
        { label: 'Aberta', value: 'Aberta', className: 'status-Aberta' },
        { label: 'Em Andamento', value: 'Em-Andamento', className: 'status-Em-Andamento' },
        { label: 'Encerrada', value: 'Encerrada', className: 'status-Encerrada' },
        { label: 'Cancelada', value: 'Cancelada', className: 'status-Cancelada' },
    ];

    const { podeCadastrar } = usePermissao("Ficha de Orçamento");

    //Modal
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');
    const [erroBuscarFicha, setErroBuscarFicha] = useState('');
    const [erroBuscarPedido, setErroBuscarPedido] = useState('');
    const [erroBuscarOrdemManutencao, setErroBuscarOrdemManutencao] = useState('');
    const [erroBuscarClientes, setErroBuscarClientes] = useState('');
    const [erroBuscarEnderecos, setErroBuscarEnderecos] = useState('');

    const dataFormatada = format(new Date(), 'yyyy-MM-dd');
    
    const formik = useFormik<Tarefa>({
        initialValues: {
            id: tarefa.id || null,
            titulo: tarefa.titulo || null,
            prioridade: tarefa.prioridade || null,
            descricao: tarefa.descricao || null,
            observacoes: tarefa.observacoes || null,
            observacoesFuncionario: tarefa.observacoesFuncionario || null,
            local: tarefa.local || null,
            criadoPor: tarefa.criadoPor || null,
            status: tarefa.status || null,
            dataHoraAtividade: tarefa.dataHoraAtividade || null,
            ficha: tarefa.ficha || {},
            pedido: tarefa.pedido || {},
            ordemManutencao: tarefa.ordemManutencao || {},
            cliente: tarefa.cliente || {},
            tarefaFuncionario: tarefa.tarefaFuncionario || [],
            arquivos: tarefa.arquivos ? tarefa.arquivos.map(arquivo => ({
                id: arquivo.id || undefined,  // Alterado de null para undefined
                nome: arquivo.nome || '',
                caminho: arquivo.caminho || '',
                tipo: arquivo.tipo || '',
                file: arquivo.file
            })) : [],
            novosArquivos: tarefa.novosArquivos || []
        },
        onSubmit: (values) => {
            const formattedValues = {
                ...values,
                titulo: values.titulo || null,
                prioridade: values.prioridade || null,
                descricao: values.descricao || null,
                observacoes: values.observacoes || null,
                observacoesFuncionario: values.observacoesFuncionario || null,
                local: values.local || null,
                criadoPor: values.criadoPor || null,
                status: values.status || null,
                dataHoraAtividade: values.dataHoraAtividade || null,
                tarefaFuncionario: tarefa.tarefaFuncionario,
                // ficha: tarefa.ficha || {},
                // pedido: tarefa.pedido || {},     REVER
                // ordemManutencao: tarefa.pedido || {},

                novosArquivos: values.novosArquivos,
                arquivos: values.arquivos,
                
            };
            onSubmit(formattedValues);
        },
        enableReinitialize: true,
        validationSchema: validationScheme
    });

    // useEffect(() => {
    //     const localStr = formik.values?.local || tarefa?.local;

    //     if (localStr) {
    //         console.log("ouuu estou aqui fazer o negócio ai");
    //         console.log(localStr)
    //         const partes = localStr.split(',').map(p => p.trim());
    //         console.log(partes);

    //         const endereco = {
    //         endereco: partes[0] ?? "",
    //         numero: partes[1] ?? "",
    //         bairro: partes[2] ?? "",
    //         cidade: partes[3] ?? "",
    //         };

    //         setListaEnderecos([endereco]);
    //     } else {
    //         console.log("vazio");
    //         setListaEnderecos([]);
    //     }
    // }, [formik.values?.local, tarefa?.local]);
    console.log('Funcionários aqui: ', JSON.stringify(formik.values.tarefaFuncionario, null, 2));
    useEffect(() => {
        const rawLocal = formik.values?.local || tarefa?.local;
        const localStr = Array.isArray(rawLocal) ? rawLocal[0] : rawLocal;

        if (typeof localStr === 'string') {
            console.log("ouuu estou aqui fazer o negócio ai");
            console.log(localStr);
            const partes = localStr.split(',').map(p => p.trim());
            console.log(partes);

            const endereco = {
                endereco: partes[0] ?? "",
                numero: partes[1] ?? "",
                bairro: partes[2] ?? "",
                cidade: partes[3] ?? "",
            };

            setListaEnderecos([endereco]);
        } else {
            console.log("vazio");
            setListaEnderecos([]);
        }
    }, [formik.values?.local, tarefa?.local]);


    console.log(formik.values?.local)
    console.log("formik.values.local:", JSON.stringify(formik.values.local));
        listaEnderecos.forEach((item) => {
        const valor = gerarValorEndereco(item);
        console.log("option value:", JSON.stringify(valor));
    });


    const tarefaCancelada = tarefa.status === 'Cancelada';
    const tarefaEncerrada = tarefa.status === 'Encerrada';
    const avulsa = formik.values.ficha?.id || formik.values.pedido?.id || formik.values.ordemManutencao?.id;

    const pioridadeOptions = [
        { label: 'Alta', value: 'Alta', className: 'prioridade-Alta' },
        { label: 'Normal', value: 'Normal', className: 'prioridade-Normal' },
        { label: 'Baixa', value: 'Baixa', className: 'prioridade-Baixa' }
    ];

    //FICHA
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelectFicha = (item: any) => {
        formik.setFieldValue("ficha", item);
    };

    const handleSearchFicha = async (query: string, tipo: "nome" | "telefone") => {
        try {
            let results;
            setErroBuscarFicha('');
            if (tipo === 'telefone') {
                results = await serviceFicha.carregarFichaTarefa('', query);
            } else {
                results = await serviceFicha.carregarFichaTarefa(query, '');
            }

            return results.data
                .filter((item) => item.id !== undefined && item.id !== null)
                .map((item) => ({
                    ...item,
                    id: item.id ?? '',
                }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setErroBuscarFicha(error?.message || 'Erro ao buscar ficha.');
            return []; // Retorna array vazio para evitar quebra no componente
        }
    };

    //PEDIDO
    const handleSearchPedido = async (query: string) => {
        try {
            setErroBuscarPedido(''); // Limpa erro anterior, se houver

            const results = await servicePedido.carregarPedidoTarefa(query);

            return results.data
                .filter((item) => item.id !== undefined && item.id !== null)
                .map((item) => ({
                    ...item,
                    id: item.id ?? '',
                }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setErroBuscarPedido(error?.message || 'Erro ao buscar pedido.');
            return []; // Garante retorno seguro para o AutoComplete
        }
    };


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelectPedido = (item: any) => {
    // Atualiza o formulário com os valores do item selecionado
        formik.setFieldValue('pedido', item);
    };

    //ORDEM

    const handleSearchOrdemManutencao = async (query: string) => {
        try {
            setErroBuscarOrdemManutencao(''); // Limpa erro anterior, se necessário

            const results = await serviceOrdemMnt.carregarOrdemTarefa(query);

            return results.data
                .filter((item) => item.id !== undefined && item.id !== null)
                .map((item) => ({
                    ...item,
                    id: item.id ?? '',
                }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setErroBuscarOrdemManutencao(error?.message || 'Erro ao buscar ordem de manutenção.');
            return []; // Retorna array vazio para evitar que o autocomplete quebre
        }
    };

    //CLIENTE

    const clienteSelecionado = useMemo(() => {
            return formik.values.cliente && formik.values.cliente?.id
                ? formik.values.cliente
                : null;
        }, [formik.values.cliente]);

    const handleSearchCliente = async (query: string) => {
        try {
            //setErroBuscarClientes('')
    
            const response = await serviceTerceiro.findClienteAutoComplete(query);
            const results = response.data
            
            return results
                .filter((item) => item.id !== undefined && item.id !== null)
                .map((item) => ({
                    ...item,
                    id: item.id ?? '',
                }));
        } catch (error) {
            console.error(error)
            //setErroBuscarClientes('Erro ao buscar clientes:' + error)
            return []; // Garante que sempre retorna um array
        }
    };

    useEffect(() => {
        if (clienteSelecionado?.id && !avulsa) {
            console.log('oi')
            //carregarTelefones(clienteSelecionado.id); // Agora está correto
            buscarEnderecosTerceiro(clienteSelecionado.id);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clienteSelecionado]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatarEndereco = (enderecoObj: any): string => {
        return `${enderecoObj.endereco}, ${enderecoObj.numero}, ${enderecoObj.bairro}, ${enderecoObj.cidade}`;
     };
    
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelectCliente = async (item: any) => {
        if (!item || !item.id) {
            console.error("Cliente inválido:", item);
            return;
        }
        
        console.log("item aqui: " + item.id);
        console.log("item aqui: " + item.nome);
        
        buscarEnderecosTerceiro(item.id)
        
        // try {
        //     const enderecos = await serviceClienteEnderecos.findClienteEnderecoFicha(item.id);
        //     setErroBuscarEnderecos('');
        
        //     if (enderecos.length > 0) {
        //         if (enderecos.length === 1) {
        //             const enderecoFormatado = formatarEndereco(enderecos[0]);
        //             // updateItemObject(index, {
        //             // cliente: {
        //             //     id: item.id,
        //             //     nome: item.nome
        //             // },
        //             // local: enderecoFormatado
        //             // });
        //             formik.setFieldValue("cliente", item);
        //             formik.setFieldValue("local", enderecoFormatado);
        //         }

        //         else {
        //             formik.setFieldValue("cliente", item);
        //         }
        //         setListaEnderecos(enderecos);

        //     } else {
        //         const partes = item.data?.local?.split(',').map((part: string) => part.trim()) || [];
        //         const enderecoDefault = {
        //             endereco: partes[0] ?? "",
        //             numero: partes[1] ?? "",
        //             bairro: partes[2] ?? "",
        //             cidade: partes[3] ?? "",
        //         };
        //         setListaEnderecos([enderecoDefault]);

        //         // Sempre atualiza o cliente no fim
        //         formik.setFieldValue("cliente", item);
        //     }
        // } catch (error) {
        //     setErroBuscarEnderecos('🚨 Erro ao buscar endereços do Cliente: ' + error);
        // }
    };

    const buscarEnderecosTerceiro = async (idTerceiro: string): Promise<void> => {
        try {
            const enderecos = await serviceClienteEnderecos.findClienteEnderecoFicha(idTerceiro);
            setErroBuscarEnderecos('')
            if (enderecos.length > 0) {
                setListaEnderecos(enderecos);
                // Se houver apenas um endereço, define a string formatada no Formik
                if (enderecos.length === 1) {
                    const enderecoFormatado = formatarEndereco(enderecos[0]);
                    formik.setFieldValue("local", [enderecoFormatado]);
                }
            } else {
                // Tratamento para quando não houver endereços cadastrados
                const partes = tarefa.local?.split(',').map(part => part.trim()) || [];
                const enderecoDefault = {
                    endereco: partes[0] ?? "",
                    numero: partes[1] ?? "",
                    bairro: partes[2] ?? "",
                    cidade: partes[3] ?? "",
                };
    
                setListaEnderecos([enderecoDefault]);
            }
        } catch (error) {
            setErroBuscarEnderecos('🚨 Erro ao buscar endereços do Cliente: ' + error)
        }
    };


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelectOrdem = (item: any) => {
        // Atualiza o formulário com os valores do item selecionado
        formik.setFieldValue("ordemManutencao", item);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return; // Se não houver arquivos, não faz nada
    
        // Filtrando arquivos válidos
        // const validFiles = files.filter(file => 
        //     file.size <= MAX_FILE_SIZE && ALLOWED_TYPES.includes(file.type)
        // );
    
        // Exibe alerta se houver arquivos inválidos
        // if (validFiles.length < files.length) {
        //     alert('Alguns arquivos foram rejeitados por tamanho ou tipo inválido.');
        // }
    
        // Se nenhum arquivo for válido, não continua
        // if (!validFiles.length) return;
    
        // Criando objetos para os arquivos válidos
        const novosArquivos: Arquivo[] = files.map(file => ({
            id: undefined, // Arquivo ainda não salvo
            tempId: uuidv4(), // Gerando um tempId único
            nome: file.name,
            tipo: file.type,
            caminho: '',
            file,
            status: 'Pronto para envio', // Status automático
        }));
    
        // Atualiza o campo 'arquivos' no formik
        formik.setFieldValue('arquivos', [...(formik.values?.arquivos || []), ...novosArquivos]);
    };
    
    const handleRemove = (tempId: string) => {
        formik.setFieldValue(
            'arquivos',
            (formik.values?.arquivos ?? []).filter(file => file.tempId !== tempId)
        );
    };

    const carregarMidia = async (arquivo: Arquivo) => {
        if (arquivo.tipo.startsWith("video/")) {
            return mediaService.carregarVideo(arquivo.caminho);
        }
        if (arquivo.tipo.startsWith("image/")) {
            return mediaService.carregarImagem(arquivo.caminho);
        }
        if (arquivo.tipo.startsWith("application/")) {
            return mediaService.carregarDocumento(arquivo.caminho);
        }
        return null;
    };
    

    const handleRemoveArquivos = (id: string) => {
        const arquivosAtuais = formik.values?.arquivos ?? [];
        const novoArquivos = arquivosAtuais.filter(arquivo => arquivo.id !== id);
    
        if (novoArquivos.length > 0) {
            const indexAtual = arquivosAtuais.findIndex(arquivo => arquivo.id === id);
            const proximoIndex = indexAtual >= novoArquivos.length ? novoArquivos.length - 1 : indexAtual;
            setIndiceAtual(proximoIndex); // Atualiza o índice antes de remover
        } else {
            setIndiceAtual(0); // Se não houver imagens restantes, resetar para 0
        }
    
        formik.setFieldValue("arquivos", novoArquivos);
    };
    
    const totalSizeMB = (formik.values.arquivos ?? [])
    .filter(file => file?.file && !file?.id) // Apenas arquivos novos e válidos
    .reduce((acc, file) => acc + (file?.file?.size ?? 0), 0) / (1024 * 1024);

    const isTotalTooLarge = totalSizeMB > 350; // Verifica se passou de 500MB

    const hasLargeFile = (formik.values.arquivos ?? []).some(file => 
        file?.file && file.file.size / (1024 * 1024) > 100
    );// Verifica se cada arquivo passou de 100MB
    

    const handleRemoveAll = () => {
        formik.setFieldValue("arquivos", formik.values.arquivos?.filter(file => file.id)); // Mantém apenas arquivos já enviados
    };

    //TABELA
    // const columns: Column[] = [
    //     { label: "Conferência do lugar de instalação", key: "descricao", disabled: !podeCadastrar || fichaCancelada },
    //     { label: "Sim/Não", key: "check", type: "checkbox", disabled: !podeCadastrar || fichaCancelada},
    //     { label: "Observação", key: "obs", type: "textarea", disabled: !podeCadastrar || fichaCancelada, width:'50%' },
    // ];
      
    const valuesFormatted = Object.fromEntries(
        Object.entries(formik.values).map(([key, value]) => [key, value ?? ""])
    );

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
        <form 
            onSubmit={(e) => {
                e.preventDefault();
                formik.handleSubmit();
            }} 
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Impede que o Enter acione algo indesejado
                }
            }}
        >
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
                        <div className="columns">
                {formik.values.id && (
                    <Input
                        id="id"
                        name="id"
                        label="Código: *"
                        style={{
                            fontWeight: "bold", 
                            border: "2px solid rgb(0, 0, 0)", // Borda preta para destaque
                            padding: "8px",
                            borderRadius: "5px"
                        }}
                        value={formik.values.id || ''}
                        columnClasses="column is-half"
                        autoComplete="off"
                        disabled
                    />
                )}
                <div className="column is-half">
                    <label htmlFor="status" className="label">Status: *</label>
                    <div className={`control dropdown-${formik.values.status || 'default'}`} /* Adiciona classe dinâmica ao contêiner com um fallback */> 
                        <Dropdown
                            id="status"
                            name="status"
                            value={formik.values.status}
                            options={statusOptions}
                            optionLabel="label"
                            optionValue="value"
                            autoComplete='off'
                            onChange={(e) => formik.setFieldValue('status', e.value)}
                            placeholder="Selecione o status"
                            className={`w-full custom-dropdown-height editable-dropdown ${
                                formik.errors.status && 'border border-red-500'}`}
                            editable
                            disabled={!podeCadastrar}
                        />
                    </div>
                    {formik.errors.status && (
                        <p className="help is-danger">{formik.errors.status}</p>
                    )}
                </div>
            </div>
            {tarefa.ficha?.id ?
                <div className="columns">
                    <AutoCompleteGenerico
                        id={`tarefa.ficha`}
                        name={`tarefa.ficha`}
                        label="Ficha Orçamento: *"
                        autoComplete="off"
                        value={formik.values.ficha?.id || ''}
                        onSearch={(query) => {
                            if (formik.values.ficha?.id == query) {
                                return Promise.resolve([]) 
                            }
                            const trimmedQuery = query.trim();
                            if (/^\d+$/.test(trimmedQuery)) {
                                return handleSearchFicha(trimmedQuery, "telefone");
                            } else {
                                return handleSearchFicha(trimmedQuery, "nome");
                            }
                        }}
                        onSelect={(item) => {
                            handleSelectFicha(item);
                        }}
                        formatResult={(ite) =>
                            `${ite.id} - ${ite.orcamento} - ${ite.nomeCliente} - ${ite.enderecoCliente ?? 'Endereço não cadastrado'} - ${formatDateToBackend(ite?.dataSolicitacaoCliente || '')}`
                        }
                        erro={erroBuscarFicha}
                        placeholder="Digite"
                    />
                </div>
             : tarefa.pedido?.id ?
                <div className="columns">
                    <AutoCompleteGenerico
                        id={`tarefa.pedido`}
                        name={`tarefa.pedido`}
                        label="Pedido de Orçamento: *"
                        autoComplete='off'
                        value={formik.values.pedido?.id || ''} // Usa o valor formatado corretamente
                        onSearch={(query) => {
                            if (formik.values.pedido?.id == query) {
                                return Promise.resolve([]) 
                            }
                            const trimmedQuery = query.trim();
                            return handleSearchPedido(trimmedQuery); // 🔹 Retorna a Promise
                        }}
                        onSelect={(item) => handleSelectPedido(item)}
                        erro={erroBuscarPedido}
                        formatResult={(item) => `${item.id} - ${item.identificador} - ${item.nomeCliente} - ${item.enderecoCliente ?? 'Endereço não cadastrado'} - ${formatDateToBackend(item?.dataPedido || '')}`}
                        placeholder="Digite"
                    />
                </div>
             : tarefa.ordemManutencao?.id ?
                <div className="columns">
                    <AutoCompleteGenerico
                        id={`tarefa.ordemManutencao`}
                        name={`tarefa.ordemManutencao`}
                        label="Ordem de Serviço Manutenção: *"
                        autoComplete='off'
                        value={formik.values.ordemManutencao?.id || ''} // Usa o valor formatado corretamente
                        onSearch={(query) => {
                            const trimmedQuery = query.trim();
                            return handleSearchOrdemManutencao(trimmedQuery); // 🔹 Retorna a Promise
                        }}
                        onSelect={(item) => handleSelectOrdem(item)}
                        erro={erroBuscarOrdemManutencao}
                        formatResult={(item) => `${item.id} - ${item.numero} - ${item.nomeCliente} - ${item.enderecoCliente} - ${formatDateToBackend(item?.dataSolicitacaoManutencao || '')}`}
                        placeholder="Digite"
                    />
                </div>
             :
                undefined
            }

            <div className="columns">
                { !avulsa ?
                    <AutoCompleteGenerico
                        id="clienteSelecionado"
                        name="clienteSelecionado"
                        label="Cliente: *"
                        autoComplete='off'
                        // onClear={() => {
                        // updateItemObject(index, {
                        //     ordemManutencao: null,
                        //     cliente: null,
                        //     local: null
                        // });
                        
                        // setEnderecosPorLinha(prev => ({
                        //     ...prev,
                        //     [index]: [] // limpa os endereços da linha atual
                        // }));
                        // }}                  
                        value={
                            clienteSelecionado
                            ? `${clienteSelecionado.id ?? ''} - ${clienteSelecionado.nome ?? ''}`
                            : ''
                        } // Usa o valor formatado corretamente
                        onSearch={(query) => {
                            const trimmedQuery = query.trim();
                            return handleSearchCliente(trimmedQuery);
                        }}                    
                        // Chama a busca ao digitar
                        onSelect={(item) => { handleSelectCliente(item);}} // Atualiza o formulário ao selecionar
                        formatResult={(item) =>
                            `${item.id} - ${item.nome}`
                        }
                        placeholder="Digite Nome, CPF ou CNPJ do Cliente"
                    />
                 :
                    <Input
                        label="Cliente:"
                        id="cliente"
                        name="cliente"
                        className="input"
                        columnClasses="column is-full"
                        autoComplete="off"
                        value={
                        formik.values.cliente?.id && tarefa.cliente?.nome
                            ? `${tarefa.cliente.id} - ${tarefa.cliente.nome}`
                            : ''
                        }
                        type="text"
                        disabled
                    />
                }
            </div>

            <div className="columns">
                { !avulsa ?
                    <div className="column">
                        <label htmlFor="local" className="label">
                         Endereço:* 
                        </label>
                        <div className="control">
                            <div className="select is-fullwidth">
                                <select
                                    id="local"
                                    name="local"
                                    value={formik.values?.local || ""}
                                    //onChange={(e) => formik.setFieldValue(`tarefas.${index}.local`, e.target.value)}
                                    onChange={(e) => formik.setFieldValue('local', e.target.value)}
                                    //disabled={loading}
                                    //aria-disabled={loading}
                                    >
                                    <option value="" disabled>
                                        {"Selecione um endereço"}
                                    </option>
                                    {listaEnderecos.map((item, i) => (
                                        <option key={i} value={`${item.endereco}, ${item.numero}, ${item.bairro}, ${item.cidade}`}>
                                        {item.endereco}, {item.numero}, {item.bairro}, {item.cidade}
                                        </option>
                                    ))}
                                </select>
                                {erroBuscarEnderecos && (
                                <p className="help is-danger" style={{
                                    marginTop: "4px",
                                    position: "absolute",
                                    bottom: "-20px",
                                }}>
                                    {erroBuscarEnderecos}
                                </p>
                                )}
                            </div>
                        </div>
                    </div>
                 :
                    <Input
                        label="Local:"
                        id="local"
                        name="local"
                        className="input"
                        columnClasses="column is-full"
                        autoComplete="off"
                        value={ formik.values.local || ''}
                        type="text"
                        disabled
                    />
                }
            </div>

            <div className="columns">
                <div className="column is-full">
                <label htmlFor={`${formik.values.tarefaFuncionario}`} className="label">Funcionários: *</label>
                <div className="control"> 
                    <GenericMultiSelect<FuncionariosTarefa>
                        selecionados={formik.values.tarefaFuncionario || []}
                        setSelecionados={(novos) => formik.setFieldValue('funcionarios', novos)}
                        labelRender={(f) => f.funcNome || ""}
                        onBuscar={(e) => serviceUserFunc.findUsuarioFuncionario(e).then((res) => res.data)}
                    />
                </div>
                </div>
            </div>

            <div className="columns">
                <Input
                    label="Data: *"
                    id="dataHoraAtividade"
                    name="dataHoraAtividade"
                    placeholder="Digite a Data da Tarefa"
                    className="input"
                    columnClasses="column is-half"
                    autoComplete="off"
                    value={formik.values.dataHoraAtividade || ""}
                    onChange={(e) => {
                        let value = e.target.value;
                        if (value.length === 16) { // formato: yyyy-MM-ddTHH:mm
                            value += ":00";
                        }
                        formik.setFieldValue('dataHoraAtividade', e.target.value)
                    }}                  
                    type="datetime-local"
                    //erro={formik.errors.nome}
                    //disabled={!podeCadastrar}
                />
                <div className="column is-half">
                    <label htmlFor="prioridade" className="label">Prioridade: *</label>
                    <div className={`control dropdown-${formik.values.prioridade || 'default'}`}> 
                        <Dropdown
                            id="prioridade"
                            name="prioridade"
                            autoComplete="off"
                            value={formik.values.prioridade}
                            options={pioridadeOptions}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => formik.setFieldValue('prioridade', e.target.value)}
                            placeholder="Selecione a Prioridade"
                            className="w-full custom-dropdown-height"
                        />
                    </div>
                </div>
            </div>

            <div className="columns">
                <Input
                    label="Título: *"
                    id="titulo"
                    name="titulo"
                    placeholder="Digite o Título"
                    className="input"
                    columnClasses="column is-full"
                    autoComplete="off"
                    value={formik.values.titulo || ""}
                    onChange={(e) => formik.setFieldValue('titulo', e.target.value)}
                    type="text"
                />
            </div>
            <div className="field">
                <label htmlFor="observacao" className="label">
                 Descrição:
                </label>
                <textarea
                    id="descricao"
                    name="descricao"
                    className="textarea"
                    autoComplete="off"
                    value={formik.values.descricao ?? ""}
                    placeholder="Digite aqui a Descrição da Tarefa/Serviço"
                    onChange={(e) => formik.setFieldValue('descricao', e.target.value)}
                    rows={5}
                    maxLength={950}
                    style={{ resize: "none", minHeight: "120px" }}
                ></textarea>
            </div>
            <div className="field">
                <label htmlFor="observacao" className="label">
                 Observações:
                </label>
                <textarea
                    id="observacoes"
                    name="observacoes"
                    className="textarea"
                    autoComplete="off"
                    value={formik.values.observacoes ?? ""}
                    placeholder="Digite aqui a Observação da Tarefa/Serviço"
                    onChange={(e) => formik.setFieldValue('observacoes', e.target.value)}
                    rows={5}
                    maxLength={950}
                    style={{ resize: "none", minHeight: "120px" }}
                ></textarea>
            </div>
            <br/>

            
            {/* <h4>Arquivos Vinculados</h4> */}
            <Galleria
                ref={galleria}
                value={formik.values.arquivos?.filter(arquivo => arquivo.id)}
                numVisible={5}
                activeIndex={indiceAtual}
                onItemChange={(e) => setIndiceAtual(e.index)}
                circular
                fullScreen
                showItemNavigators
                showThumbnails={false}
                item={(arquivo) => (
                    <TemplateImagem
                        arquivo={arquivo}
                        podeCadastrar={podeCadastrar}
                        onRemoveArquivo={() => handleRemoveArquivos(arquivo.id ?? "")} // Agora remove corretamente
                        carregarMidia={carregarMidia}
                    />
                )}
                style={{ maxWidth: "50%" }}
            />

            <div className="file-upload-container">
                <label>Arquivos:</label>
                <div className="upload-actions">  {/* Container flexível para botões */}
                    <label className="choose-button">
                        <i className="pi pi-plus"></i> Upload
                        <input disabled={!podeCadastrar || tarefaCancelada} type="file" multiple onChange={handleFileChange} accept="image/*,video/mp4, application/*" hidden />
                    </label>

                    {/* Botão Cancel (Remove Todos os Arquivos) */}
                    <label className="cancel-button" onClick={handleRemoveAll}>
                        <i className="pi pi-times"></i> Cancelar
                    </label>
                    
                    {/* Botão "Show" agora como label */}
                    <label
                        className={`show-button ${!podeCadastrar || ((tarefa.arquivos?.length ?? formik.values.arquivos?.length ?? 0) < 1) ? styles.disabled : ''}`}  
                        onClick={() => galleria.current?.show()}
                    >
                        <i className="pi pi-folder-open"></i> Show
                    </label>
                </div>
                {(formik.values.arquivos ?? []).filter(file => file?.file && !file?.id).length > 0 && (
                    <div className={styles.fileList}>
                        {(formik.values.arquivos ?? [])
                            .filter(file => file?.file && !file?.id) // Apenas arquivos novos com file definido
                            .map((file) => {
                                const fileSizeMB = file.file ? (file.file.size / (1024 * 1024)).toFixed(2) : "0.00"; // Converte para MB
                                const isTooLarge = parseFloat(fileSizeMB) > 100; // Converte para número antes da comparação

                                return (
                                    <div key={file.tempId} className={`${styles.fileItem} ${isTooLarge ? styles.tooLarge : ''}`}>
                                        {file.file && file.tipo?.startsWith('image') ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={URL.createObjectURL(file.file)} alt={file.nome} className={styles.thumbnail} />
                                        ) : file.file && file.tipo?.startsWith('video') ? (
                                            <video width="50" height="50" controls>
                                                <source src={URL.createObjectURL(file.file)} type={file.tipo} />
                                            </video>
                                        ) : file.file && file.tipo?.startsWith('application/') ? (
                                            <a href={URL.createObjectURL(file.file)} target="_blank" rel="noopener noreferrer">
                                                Abrir {file.nome}
                                            </a>
                                        ): 
                                        (
                                            <span>{file.nome}</span>
                                        )}

                                        <div className={styles.fileInfo}>
                                            <span className={styles.fileName}>{file.nome} ({fileSizeMB} MB)</span>
                                            {isTooLarge ? (
                                                <span className={`${styles.status} ${styles.error}`}>Erro: Arquivo maior que 100MB</span>
                                            ) : (
                                                <span className={`${styles.status} ${styles.uploaded}`}>Pronto para envio</span>
                                            )}
                                        </div>

                                        <button onClick={() => handleRemove(file.tempId || '')} type='button' disabled={!podeCadastrar} className={styles.removeButton}>❌</button>
                                    </div>
                                );
                            })}

                        {/* Exibição do tamanho total de todos os arquivos */}
                        <div className={styles.totalSize}>
                            <strong>Total:</strong> {totalSizeMB.toFixed(2)} MB
                        </div>

                        {/* Exibir erro se o total ultrapassar 500MB */}
                        {isTotalTooLarge && (
                            <div className={`${styles.status} ${styles.error}`}>
                                Erro: O total dos arquivos não pode ultrapassar 350MB!
                            </div>
                        )}

                        {/* Exibir erro caso o usuário tente adicionar mais de 7 arquivos */}
                        {(formik.values.arquivos ?? []).filter(file => file?.file && !file?.id).length > 7 && (
                            <div className={`${styles.status} ${styles.error}`}>
                                Erro: Você pode enviar no máximo 7 arquivos!
                            </div>
                        )}
                    </div>
                )}
            </div>
            <br/>
            <div className="field is-grouped">
                <ButtonType 
                    type="submit"
                    label={formik.values.id ? 'Atualizar' : 'Salvar'}
                    className='button is-link'
                    disabled={!formik.dirty || !formik.isValid || !podeCadastrar || isTotalTooLarge || hasLargeFile} // Botão só habilita se houver alterações
                    // onClick={() => formik.handleSubmit()}
                />
                <ButtonType 
                    type="button"
                    label={"Voltar (Tela de Consulta)"}
                    className='button'
                    onClick={() => router.push("/consultas/fichaOrcamento")}
                />
            </div>
        </form>
    );
};
