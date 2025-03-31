'use client';
import { usePermissao } from '../../../app/hooks/usePermissoes';
import { OrdemServicoManutencao, ProdutosOrdemServicoMnt } from '../../../app/models/ordemServicoManutencao';
import {
    useOrdemServicoManutencaoService,
    useProdutoService,
    useTerceiroService,
    useTerceiroCaracteristicaService,
    useTerceiroEnderecoService,
    useMediaService
} from '../../../app/services';
import { Input } from '../../../components';
import { AutoCompleteGenerico } from '../../../components/common/autoCompleteGenerico';
import { ButtonType } from '../../../components/common/button';
import { ModalCard } from '../../../components/common/modal';
import { useOrcamentoContext } from '../../../contexts/OrcamentoContext';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from 'primereact/checkbox';
import { AutoCompleteLivre } from '../../common/autoCompleteLivre';
import { Produto } from '../../../app/models/produtos';
import { TerceirosCaracteristicasDescricao, TerceirosEnderecosClienteDto } from '../../../app/models/terceiros';
import SelectList from '../../../components/common/selectList';
import { Galleria } from 'primereact/galleria';
import { TemplateImagem } from '../../common/templateImagem';
import styles from './ordem.module.css';
import { Arquivo } from '../../../app/models/arquivos';

interface OrdemServicoManutencaoFormProps {
    ordemServicoManutencao: OrdemServicoManutencao;
    onSubmit: (ordem: OrdemServicoManutencao) => void;
}

interface OrcamentoContextType {
    id: string | null;
    nomeCliente: string | null;
    enderecoCliente: string | null;
    telefoneCliente: string | null;
    setOrcamentoData: (data: OrcamentoContextType) => void;
}

const campoObrigatorio = 'Campo Obrigatório';

const validationScheme = Yup.object().shape({
    status: Yup.string().trim().required(campoObrigatorio),
    //dataSolicitacaoManutencao: Yup.string().trim().required(campoObrigatorio),
    dataSolicitacaoManutencao: Yup.string().trim().required(campoObrigatorio).test(
        'data-nao-futura',
        'A data de solicitação não pode ser maior que a data atual',
        (value) => {
            if (!value) return false; // Se for nulo, falha automaticamente

            let dataInserida;

            if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                // 📌 Se já está no formato YYYY-MM-DD, cria a data diretamente
                dataInserida = new Date(value + 'T00:00:00'); // Evita problemas de fuso
            } else {
                // 📌 Se estiver no formato DD/MM/YYYY, converte corretamente
                const regexData = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                const match = value.match(regexData);
                
                if (!match) {
                    return false;
                }

                const [, dia, mes, ano] = match;
                dataInserida = new Date(`${ano}-${mes}-${dia}T00:00:00`);
            }

            // Verifica se a conversão deu certo
            if (isNaN(dataInserida.getTime())) {
                return false;
            }

            // Pegamos a data atual zerando horas para comparação correta
            const dataAtual = new Date();
            dataAtual.setHours(0, 0, 0, 0);
            dataInserida.setHours(0, 0, 0, 0);

            return dataInserida <= dataAtual;
        }
    ),
    produtosOrdemServicoMnt: Yup.array().of(
        Yup.object().shape({
            produto: Yup.string().trim().required('O campo produto é obrigatório'),
        })
    ).nullable(),
});

export const OrdemServicoManutencaoForm: React.FC<OrdemServicoManutencaoFormProps> = ({
    ordemServicoManutencao,
    onSubmit
}) => {

    //services
    const router = useRouter();
    const service = useOrdemServicoManutencaoService();
    // const servicePedido = usePedidoOrcamentoService();
    const serviceProduto = useProdutoService();
    const serviceTerceiro = useTerceiroService();
    const serviceClienteTel = useTerceiroCaracteristicaService();
    const serviceClienteEnderecos = useTerceiroEnderecoService();
    const mediaService = useMediaService();

    const { setOrcamentoData } = useOrcamentoContext(); // Acessar a função para setar os dados

    const galleria = useRef<Galleria | null>(null); // Define o tipo correto
    const [indiceAtual, setIndiceAtual] = useState(0);

    const { podeCadastrar } = usePermissao("Ordem de Serviço Manutenção");
    const relatorio = usePermissao("Relatório Ordem de Serviço Manutenção");

    const [erroBuscarClientes, setErroBuscarClientes] = useState('');
    const [erroBuscarEnderecos, setErroBuscarEnderecos] = useState('');

    const [listaEnderecos, setListaEnderecos] = useState<TerceirosEnderecosClienteDto[]>([]);
    const [clienteFichaTel, setClienteFichaTel] = useState<{ label: string; value: string }[]>([]);
    const [mensagemTelefone, setMensagemTelefone] = useState('');
    
    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');

    const statusOptions = [
        { label: 'Aberta', value: 'Aberta', className: 'status-Aberta' },
        { label: 'Em Andamento', value: 'Em-Andamento', className: 'status-Em-Andamento' },
        { label: 'Encerrada', value: 'Encerrada', className: 'status-Encerrada' },
        { label: 'Cancelada', value: 'Cancelada', className: 'status-Cancelada' },
    ];

    const dataFormatada = format(new Date(), 'yyyy-MM-dd');
    
    const formik = useFormik<OrdemServicoManutencao>({
        initialValues: {
            id: ordemServicoManutencao.id || null,
            telefoneCliente: ordemServicoManutencao.telefoneCliente || null,
            enderecoCliente: ordemServicoManutencao.enderecoCliente || null,
            dataSolicitacaoManutencao: ordemServicoManutencao.dataSolicitacaoManutencao || dataFormatada,
            numero: ordemServicoManutencao.numero || null,
            produtosOrdemServicoMnt: ordemServicoManutencao.produtosOrdemServicoMnt || [],
            serviceExecutados: ordemServicoManutencao.serviceExecutados || null,
            servicoExecutar: ordemServicoManutencao.servicoExecutar || null,
            cliente: ordemServicoManutencao.cliente,
            tipoManutencaoCheck: ordemServicoManutencao.tipoManutencaoCheck || null,
            observacoes: ordemServicoManutencao.observacoes || null,
            fotoAmbCheck: ordemServicoManutencao.fotoAmbCheck || null,
            fotoAmbObs: ordemServicoManutencao.fotoAmbObs || null,
            ilumAmbCheck: ordemServicoManutencao.ilumAmbCheck || null,
            ilumAmbObs: ordemServicoManutencao.ilumAmbObs || null,
            acessDifeCheck: ordemServicoManutencao.acessDifeCheck || null,
            acessDifeObs: ordemServicoManutencao.acessDifeObs || null,
            servExtrCheck: ordemServicoManutencao.servExtrCheck || null,
            servExtrObs: ordemServicoManutencao.servExtrObs || null,
            casaComCheck: ordemServicoManutencao.casaComCheck || null,
            casaComObs: ordemServicoManutencao.casaComObs || null,
            status: ordemServicoManutencao.status || null,
            altura: ordemServicoManutencao.altura || null,
            volt110: ordemServicoManutencao.volt110 || null,
            volt220: ordemServicoManutencao.volt220 || null,
            arquivos: ordemServicoManutencao.arquivos ? ordemServicoManutencao.arquivos.map(arquivo => ({
                id: arquivo.id || undefined,  // Alterado de null para undefined
                nome: arquivo.nome || '',
                caminho: arquivo.caminho || '',
                tipo: arquivo.tipo || '',
                file: arquivo.file
            })) : [],
            novosArquivos: ordemServicoManutencao.novosArquivos || [],
        },
        onSubmit: (values) => {
            const formattedValues = {
                ...values,
                fotoAmbCheck: values.fotoAmbCheck || null,
                fotoAmbObs: values.fotoAmbObs || null,
                ilumAmbCheck: values.ilumAmbCheck || null,
                ilumAmbObs: values.ilumAmbObs || null,
                acessDifeCheck: values.acessDifeCheck || null,
                acessDifeObs: values.acessDifeObs || null,
                servExtrCheck: values.servExtrCheck || null,
                servExtrObs: values.servExtrObs || null,
                casaComCheck: values.casaComCheck || null,
                casaComObs: values.casaComObs || null,
                cliente: values.cliente,
                observacoes: values.observacoes || null,
                tipoManutencaoCheck: values.tipoManutencaoCheck || null,
                serviceExecutados: values.serviceExecutados || null,
                servicoExecutar: values.servicoExecutar || null
            };
            onSubmit(formattedValues);
        },
        enableReinitialize: true,
        validationSchema: validationScheme
    });

    //status
    const osmCancelada = ordemServicoManutencao.status === 'Cancelada';
    const osmEncerrada = ordemServicoManutencao.status === 'Encerrada';

    //FICHA CONTEXT - VEM DA TELA DE FICHA
    //   const handleSearchFichaContext = async (query: string) => {
    //     try {
    //       if (query !== '') {
        
    //           const resultsFicha = await servicePedido.findPedidoCodigo(query);
        
    //           if (resultsFicha.id !== '') {
    //             const formattedResult = resultsFicha; 
    //             handleSelectPedido(formattedResult);
    //           }
    //           else {
    //             handleSelectPedido({});
    //           }
    //       }
    //       else {
    //         alert('Não Existe o Pedido Orçamento informado');
    //         throw new Error('Não Existe o Pedido Orçamento informado');
    //       }
    //     } catch (error) {
    //         alert("Erro ao buscar Pedido Orçamento: " + error);
    //       console.error("Erro ao buscar Pedido Orçamento: ", error);
    //     }
    //   };

    console.log('Produtos Serviços:' + formik.values.produtosOrdemServicoMnt?.length)

    const irParaPedidoOrcamento = () => {
        const contexto = {
            idFichaVsIdOrdemMnt: formik.values.id ?? null,
            cliente: formik.values.cliente ?? null,
            enderecoCliente: formik.values.enderecoCliente ?? null,
            telefoneCliente: formik.values.telefoneCliente ?? null,
            tela: 'ORDEMSERVMNT'
        };
        
        // Atualizar os dados no contexto, sem a necessidade de uma função de atualização completa
        setOrcamentoData(contexto);  // Passa o objeto direto, já que o setOrcamentoData agora aceita objetos parciais
        
        // Navegar para a tela de pedido de orçamento
        router.push('/cadastros/pedidoOrcamento');
    };

    //relatorio
    const imprimirOrdemServMnt = (idOrdem: string) => {
        if (idOrdem) {
            // Exibir modal de carregamento
            exibirMensagem("Relatório sendo gerado, aguarde...", "loading");
    
            service.gerarRelatorioOrdemServicoManutencao(idOrdem)
                .then(blob => {
                    const fileUrl = URL.createObjectURL(blob);
                    window.open(fileUrl);
    
                    // Fechar modal ao concluir com sucesso
                    setModalVisivel(false);
                })
                .catch(() => {
                    exibirMensagem("Erro ao gerar o relatório, entre em contato com o suporte", "error");
                });
        } else {
            exibirMensagem("Erro ao gerar o relatório, entre em contato com o suporte", "error");
        }
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const handleSelectPedido = (item: any) => {
    // // Atualiza o formulário com os valores do item selecionado
    //     formik.setFieldValue('pedidoOrcamento.id', item.id);
    //     formik.setFieldValue('pedidoOrcamento.status', item.status);
    //     formik.setFieldValue('pedidoOrcamento.identificador', item.identificador);
    //     formik.setFieldTouched("pedidoOrcamento.identificador", true, false);
    //     formik.setFieldValue('cliente.id', item.idCliente);
    //     formik.setFieldValue('cliente.nome', item.nomeTerceiro);
    //     formik.setFieldValue('telefoneCliente', item.telefoneCliente);
    //     formik.setFieldValue('enderecoCliente', item.enderecoCliente);
    // };

    const exibirMensagem = (texto: string, tipo: 'success' | 'error' | 'loading') => {
        setModalMensagem(texto);
        setModalTipo(tipo);
        setModalVisivel(true);

        // Fechar automaticamente apenas mensagens de sucesso (não fechar "loading")
        if (tipo === 'success') {
            setTimeout(() => {
                setModalVisivel(false);
            }, 1500);
        }
    };

    const handleSearchProduto = async (query: string): Promise<{ id: string | number; label: string }[]> => {
        try {
            const prod = await serviceProduto.findProdutosPedido(query);
            
            if (!prod?.data) return []; // Retorna um array vazio se não houver dados
    
            return prod.data
                .filter((item: Produto) => item.id !== undefined && item.id !== null)
                .map((item: Produto) => ({
                    id: item.id ?? "", // 'id' já validado
                    label: item.descricao ?? "", // ✅ label sempre será uma string
                }));
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            return []; // Retorna um array vazio em caso de erro
        }
    };
    

    // const handleSearchProduto = async (query: string) => {
    //     const prod = await serviceProduto.findProdutosPedido(query);
    //     return prod.data.map(produto => ({
    //       id: produto.id,
    //       label: produto.descricao || "", // Adiciona 'label' para corresponder ao AutoCompleteLivre
    //     }));
    //   };
      
    
    const adicionarProduto = () => {
        const novosProdutos: ProdutosOrdemServicoMnt[] = [
            ...(formik.values.produtosOrdemServicoMnt || []),
            { id: "", produto: "", cor: "", quantidade: 1 },
        ];
        formik.setFieldValue("produtosOrdemServicoMnt", novosProdutos);
    };
    
    const removerProduto = (produtoRemover: ProdutosOrdemServicoMnt) => {
        const produtosAtualizados = (formik.values.produtosOrdemServicoMnt || []).filter(
            (produto) => produto.id !== produtoRemover.id
        );
        formik.setFieldValue("produtosOrdemServicoMnt", produtosAtualizados);
    };

    //BUSCA CLIENTES
    const clienteSelecionado = useMemo(() => {
        return formik.values.cliente && formik.values.cliente?.id
            ? formik.values.cliente
            : null;
    }, [formik.values.cliente]);

    useEffect(() => {
        if (clienteSelecionado?.id) {
            carregarTelefones(clienteSelecionado.id); // Agora está correto
            buscarEnderecosTerceiro(clienteSelecionado.id);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clienteSelecionado]);

    const handleSearchCliente = async (query: string) => {
        try {
            setErroBuscarClientes('')
    
            const response = await serviceTerceiro.findClienteAutoComplete(query);
            const results = response.data

            return results
                .filter((item) => item.id !== undefined && item.id !== null)
                .map((item) => ({
                    ...item,
                    id: item.id ?? '',
                }));
        } catch (error) {
            setErroBuscarClientes('Erro ao buscar clientes:' + error)
            return []; // Garante que sempre retorna um array
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelectCliente = (item: any) => {
    // Atualiza o formulário com os valores do item selecionado
        formik.setFieldValue('cliente.id', item?.id); // Salva o ID no formik
        formik.setFieldValue('cliente.nome', item?.nome); // Salva o ID no formik
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatarEndereco = (enderecoObj: any): string => {
        return `${enderecoObj.endereco}, ${enderecoObj.numero}, ${enderecoObj.bairro}, ${enderecoObj.cidade}`;
    };
    
    const buscarEnderecosTerceiro = async (idTerceiro: string): Promise<void> => {
        try {
            const enderecos = await serviceClienteEnderecos.findClienteEnderecoFicha(idTerceiro);
            setErroBuscarEnderecos('')
            if (enderecos.length > 0) {
                setListaEnderecos(enderecos);
    
                // Se houver apenas um endereço, define a string formatada no Formik
                if (enderecos.length === 1 && !formik.values.enderecoCliente) {
                    const enderecoFormatado = formatarEndereco(enderecos[0]);
                    formik.setFieldValue("enderecoCliente", enderecoFormatado);
                }
            } else {
                // Tratamento para quando não houver endereços cadastrados
                const partes = ordemServicoManutencao.enderecoCliente?.split(',').map(part => part.trim()) || [];
    
                const enderecoDefault = {
                    endereco: partes[0] ?? "",
                    numero: partes[1] ?? "",
                    bairro: partes[2] ?? "",
                    cidade: partes[3] ?? "",
                };
    
                setListaEnderecos([enderecoDefault]);
                formik.setFieldValue('enderecoCliente', enderecoDefault); // Usa o objeto diretamente
            }
        } catch (error) {
            setErroBuscarEnderecos('🚨 Erro ao buscar endereços do Cliente: ' + error)
        }
    };
    
    
    
    //TELEFONES CLIENTE

    const carregarTelefones = async (idTerceiro: string | undefined) => {
        if (!idTerceiro) return; // Evita execução desnecessária se não houver ID
    
        try {
            // Busca os telefones do cliente no serviço
            const telefones: TerceirosCaracteristicasDescricao[] = 
                await serviceClienteTel.findClienteTelefoneFichaTipoIn(idTerceiro);
    
            if (!telefones.length) {
                setMensagemTelefone('Cliente não tem telefone cadastrado');
                return;
            }
    
            // Converte os telefones para o formato esperado pelo Dropdown
            const options = telefones.map((t) => ({
                label: t.descricao || 'Sem descrição',
                value: t.descricao || '',
            }));
    
            setClienteFichaTel(options); // Atualiza a lista de telefones disponíveis
            setMensagemTelefone('');
    
            // Se houver apenas um telefone, define automaticamente no formik
            if (telefones.length === 1) {
                formik.setFieldValue('telefoneCliente', telefones[0].descricao || '');
            }
        } catch (error) {
            setMensagemTelefone('Erro ao carregar telefones: ' + error)
        }
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
            <div className="columns">
                {formik.values.id && (
                    <Input
                        id="numero"
                        name="numero"
                        label="Número: *"
                        value={formik.values.numero || ''}
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
                            className="w-full custom-dropdown-height"
                            disabled={!podeCadastrar}
                        />
                    </div>
                    {formik.errors.status && (
                        <p className="help is-danger">{formik.errors.status}</p>
                    )}
                </div>
            </div>

            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}

            <div className="columns">
                <AutoCompleteGenerico
                    id="clienteSelecionado"
                    name="clienteSelecionado"
                    label="Cliente: *"
                    autoComplete='off'
                    disabled={!podeCadastrar}
                    value={
                        clienteSelecionado
                            ? `${clienteSelecionado.id} - ${clienteSelecionado.nome}`
                            : ''
                        } // Usa o valor formatado corretamente
                    
                        onSearch={(query) => {
                        const trimmedQuery = query.trim();
                        return handleSearchCliente(trimmedQuery);
                        // if (/^\d{2}\.\d/.test(trimmedQuery)) {
                        //     return handleSearchCliente(trimmedQuery, 'cnpj');
                        // } 
                        // else if (/^\d{3}\.\d/.test(trimmedQuery)) {
                        //     return handleSearchCliente(trimmedQuery, 'cpf');
                        // } 
                        // else {
                        //     return handleSearchCliente(trimmedQuery, 'nome');
                        // }
                    }}                    
                    
                        // Chama a busca ao digitar
                    onSelect={(item) => handleSelectCliente(item)} // Atualiza o formulário ao selecionar
                    formatResult={(item) =>
                        `${item.id} - ${item.nome}`
                    }
                    placeholder="Digite Nome, CPF ou CNPJ do Cliente"
                    erro={erroBuscarClientes !== '' ? erroBuscarClientes :
                        formik.values.cliente?.id === '' ||
                        formik.values.cliente?.id === null ||
                        formik.values.cliente?.id === undefined
                            ? campoObrigatorio
                            : ''
                        }
                />
            </div>

            <div className="columns">
                <div className="column is-half">
                    <label htmlFor="telefoneCliente" className="label">
                        Telefone: *
                    </label>
                    <div className="control">
                        <Dropdown
                            id="telefoneCliente"
                            value={formik.values.telefoneCliente}
                            options={clienteFichaTel}
                            autoComplete='off'
                            optionLabel="label"
                            onChange={(e) => {
                                formik.setFieldValue('telefoneCliente', e.value);
                            }}
                            onFocus={() => carregarTelefones(clienteSelecionado?.id || '')} // Passando como callback
                            placeholder="Selecione ou digite o telefone"
                            className={`w-full custom-dropdown-height editable-dropdown ${
                                formik.errors.telefoneCliente ? 'border border-red-500' : ''
                            }`}
                            emptyMessage="Nenhum Telefone encontrado para esse Cliente"
                            editable
                            disabled={!podeCadastrar}
                        />
                        {formik.errors.telefoneCliente ? (
                            <p className="help is-danger">{formik.errors.telefoneCliente}</p>
                        ) : (formik.values.id === '' || formik.values.id === null) && mensagemTelefone !== '' ? (
                            <p className="help is-danger">{mensagemTelefone}</p>
                        ) : null}
                    </div>
                </div>
                <Input
                    id="dataSolicitacaoManutencao"
                    label="Data de Solicitação Manutenção: *"
                    value={formik.values.dataSolicitacaoManutencao || ''}
                    columnClasses="column is-half"
                    onChange={formik.handleChange}
                    placeholder="Digite a Data de Solicitação de Manutenção"
                    autoComplete="off"
                    type='date'
                    erro={formik.errors.dataSolicitacaoManutencao}
                    disabled={!podeCadastrar || osmCancelada}
                />
            </div>
            <div className="columns">
                <SelectList
                    id="enderecoCliente"
                    name="enderecoCliente"
                    options={listaEnderecos}
                    autoComplete='off'
                    displayFields={["endereco", "numero", "bairro", "cidade"]}
                    formik={formik}
                    disabled={!podeCadastrar}
                    label="Endereço:* "
                    erro={erroBuscarEnderecos !== '' ? erroBuscarEnderecos : formik.errors.enderecoCliente}
                />
            </div>

            {/* Tabela Editável */}
            <div className="columns">
                <div className="column is-full">
                <table className="table is-bordered is-striped is-hoverable is-fullwidth">
                    <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Cor</th>
                        <th>Quantidade</th>
                        <th>
                        <button
                            type="button"
                            className="button is-small is-success"
                            onClick={adicionarProduto}
                            disabled={!podeCadastrar}
                        >
                            +
                        </button>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                        {(formik.values.produtosOrdemServicoMnt || []).map((produto, index) => (
                            <tr key={produto.id !== '' ? produto.id : `${index}-${produto.produto || "novo"}`}>
                            <td>
                                <AutoCompleteLivre
                                    id={`produtosOrdemServicoMnt.${index}.produto`}
                                    name={`produtosOrdemServicoMnt.${index}.produto`}
                                    disabled={!podeCadastrar}
                                    value={produto.produto || ""}
                                    onSearch={async (query) => {
                                        const trimmedQuery = query.trim();
                                        return handleSearchProduto(trimmedQuery);
                                    }}
                                    onSelect={(item) => {
                                        const selectedValue = typeof item === "string" ? item : item.label;
                                        formik.setFieldValue(`produtosOrdemServicoMnt.${index}.produto`, selectedValue);
                                    }}
                                    autoComplete='off'
                                    formatResult={(item) => `${item.id} - ${item.label}`}
                                    placeholder="Digite a Descrição do Produto"
                                    erro={produto?.produto === "" ? campoObrigatorio : ""}
                                />
                            </td>
                            <td style={{ width: "30%" }}>
                                <input
                                    type="text"
                                    name={`produtosOrdemServicoMnt.${index}.cor`}
                                    id={`produtosOrdemServicoMnt.${index}.cor`}
                                    className="input"
                                    autoComplete='off'
                                    disabled={!podeCadastrar}
                                    value={produto.cor || ""}
                                    onChange={formik.handleChange}
                                />
                            </td>
                            <td style={{ width: "15%" }}>
                                <input
                                    type="number"
                                    name={`produtosOrdemServicoMnt.${index}.quantidade`}
                                    id={`produtosOrdemServicoMnt.${index}.quantidade`}
                                    className="input"
                                    disabled={!podeCadastrar}
                                    autoComplete='off'
                                    value={produto.quantidade || ""}
                                    onChange={formik.handleChange}
                                />
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="button is-small is-danger"
                                    onClick={() => removerProduto(produto)}
                                    disabled={!podeCadastrar}
                                >
                                🗑️
                                </button>
                            </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>

            <div className="columns">
                <div className="column">
                    <label htmlFor="tipoManutencaoCheck" className="label">
                    Tipo de Manutenção:
                    </label>
                    <div className="control">
                        <div className="select is-fullwidth">
                            <select
                                id="tipoManutencaoCheck"
                                name="tipoManutencaoCheck"
                                value={formik.values.tipoManutencaoCheck || ''}
                                onChange={formik.handleChange}
                                autoComplete='off'
                                disabled={!podeCadastrar || osmCancelada}
                            >
                                <option value="">Selecione uma opção</option>
                                <option value="Garantia">Garantia</option>
                                <option value="Eventual">Eventual</option>
                            </select>
                        </div>
                    </div>
                    {formik.errors.tipoManutencaoCheck && (
                    <p className="help is-danger">{formik.errors.tipoManutencaoCheck}</p>
                    )}
                </div>
            </div> 

            <div className="field">
                <label htmlFor="servicoExecutar" className="label">
                    Serviços a serem executados:
                </label>
                <textarea
                    className="textarea"
                    id="servicoExecutar"
                    name="servicoExecutar"
                    autoComplete='off'
                    value={formik.values.servicoExecutar || ''}
                    placeholder="Digite os Serviços a serem Executados"
                    onChange={formik.handleChange}
                    disabled={!podeCadastrar || osmCancelada}
                ></textarea>
                {formik.errors.servicoExecutar && (
                    <p className="help is-danger">{formik.errors.servicoExecutar}</p>
                )}
            </div>

            <div className="columns">
                <div className="column cccccis-full">
                    <table className="table is-bordered is-striped is-hoverable is-fullwidth">
                        <thead>
                            <tr>
                                <th>Conferência do lugar de instalação</th>
                                <th>Sim/Não</th>
                                <th>Observação</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Foto do Ambiente</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        autoComplete='off'
                                        name="fotoAmbCheck"
                                        checked={formik.values.fotoAmbCheck === 'Sim'}
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                'fotoAmbCheck',
                                                e.target.checked ? 'Sim' : 'Não'
                                            )
                                        }
                                        disabled={!podeCadastrar || osmCancelada}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        className="textarea"
                                        autoComplete='off'
                                        name="fotoAmbObs"
                                        value={formik.values.fotoAmbObs || ''}
                                        onChange={formik.handleChange}
                                        placeholder="Digite a observação aqui..."
                                        disabled={!podeCadastrar || osmCancelada}
                                    ></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td>Iluminação do Ambiente</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        autoComplete='off'
                                        name="ilumAmbCheck"
                                        checked={formik.values.ilumAmbCheck === 'Sim'}
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                'ilumAmbCheck',
                                                e.target.checked ? 'Sim' : 'Não'
                                            )
                                        }
                                        disabled={!podeCadastrar || osmCancelada}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        className="textarea"
                                        name="ilumAmbObs"
                                        autoComplete='off'
                                        value={formik.values.ilumAmbObs || ''}
                                        onChange={formik.handleChange}
                                        placeholder="Digite a observação aqui..."
                                        disabled={!podeCadastrar || osmCancelada}
                                    ></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td>Acessórios Diferentes</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        name="acessDifeCheck"
                                        autoComplete='off'
                                        checked={formik.values.acessDifeCheck === 'Sim'}
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                'acessDifeCheck',
                                                e.target.checked ? 'Sim' : 'Não'
                                            )
                                        }
                                        disabled={!podeCadastrar || osmCancelada}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        className="textarea"
                                        autoComplete='off'
                                        name="acessDifeObs"
                                        value={formik.values.acessDifeObs || undefined}
                                        onChange={formik.handleChange}
                                        placeholder="Digite a observação aqui..."
                                        disabled={!podeCadastrar || osmCancelada}
                                    ></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td>Serviços Extras</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        autoComplete='off'
                                        name="servExtrCheck"
                                        checked={formik.values.servExtrCheck === 'Sim'}
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                'servExtrCheck',
                                                e.target.checked ? 'Sim' : 'Não'
                                            )
                                        }
                                        disabled={!podeCadastrar || osmCancelada}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        className="textarea"
                                        autoComplete='off'
                                        name="servExtrObs"
                                        value={formik.values.servExtrObs || ''}
                                        onChange={formik.handleChange}
                                        placeholder="Digite a observação aqui..."
                                        disabled={!podeCadastrar || osmCancelada}
                                    ></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td>Casa-Comércio em Obra</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        name="casaComCheck"
                                        autoComplete='off'
                                        checked={formik.values.casaComCheck === 'Sim'}
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                'casaComCheck',
                                                e.target.checked ? 'Sim' : 'Não'
                                            )
                                        }
                                        disabled={!podeCadastrar || osmCancelada}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        className="textarea"
                                        name="casaComObs"
                                        autoComplete='off'
                                        value={formik.values.casaComObs || ''}
                                        onChange={formik.handleChange}
                                        placeholder="Digite a observação aqui..."
                                        disabled={!podeCadastrar || osmCancelada}
                                    ></textarea>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="columns">
                <div className="column" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="volt110" style={{ marginRight: '8px' }}>
                        Voltagem 110:
                    </label>
                    <Checkbox
                        inputId="volt110"
                        name='volt110'
                        autoComplete='off'
                        checked={formik.values.volt110 ?? false} /* Aqui garantimos que o valor é booleano */
                        onChange={(e) => formik.setFieldValue("volt110", e.checked ? true : false)}
                        disabled={!podeCadastrar}
                    />
                </div>
                <div className="column" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="volt220" style={{ marginRight: '8px' }}>
                        Voltagem 220:
                    </label>
                    <Checkbox
                        inputId="volt220"
                        name='volt220'
                        autoComplete='off'
                        checked={formik.values.volt220 ?? false}  /* Aqui garantimos que o valor é booleano */
                        onChange={(e) => formik.setFieldValue("volt220", e.checked ? true : false)}
                        disabled={!podeCadastrar}
                    />
                </div>
            </div>

            <div className="columns">
                <Input
                    id="altura"
                    label="Altura: "
                    value={formik.values.altura || ''}
                    columnClasses="column is-half"
                    onChange={formik.handleChange}
                    placeholder="Digite a Altura da Instalação"
                    autoComplete="off"
                    type='text'
                    disabled={!podeCadastrar || osmCancelada}
                />
            </div>

            <div className="field">
                <label htmlFor="observacoes" className="label">
                Observações:
                </label>
                <textarea
                className="textarea"
                id="observacoes"
                name="observacoes"
                value={formik.values.observacoes || ''}
                autoComplete='off'
                placeholder="Digite as Observações"
                onChange={formik.handleChange}
                disabled={!podeCadastrar}
                ></textarea>
            </div>

            <div className="field">
                <label htmlFor="serviceExecutados" className="label">
                    Serviços executados:
                </label>
                <textarea
                    className="textarea"
                    id="serviceExecutados"
                    name="serviceExecutados"
                    autoComplete='off'
                    value={formik.values.serviceExecutados || ''}
                    placeholder="Digite os Serviços Executados"
                    onChange={formik.handleChange}
                    disabled={!podeCadastrar || osmCancelada}
                ></textarea>
                {formik.errors.serviceExecutados && (
                    <p className="help is-danger">{formik.errors.serviceExecutados}</p>
                )}
            </div>

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
                        <input disabled={!podeCadastrar} type="file" multiple onChange={handleFileChange} accept="image/*,video/mp4, application/*" hidden />
                    </label>
    
                    {/* Botão Cancel (Remove Todos os Arquivos) */}
                    <label className="cancel-button" onClick={handleRemoveAll}>
                        <i className="pi pi-times"></i> Cancelar
                    </label>
                    
                    {/* Botão "Show" agora como label */}
                    <label 
                        className={`show-button ${!podeCadastrar  ? styles.disabled : ''}`}   
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
                    label={formik.values.id ? 'Atualizar' : 'Salvar'}
                    className='button is-link'
                    type="submit"
                    disabled={!formik.dirty || !formik.isValid || !podeCadastrar || hasLargeFile}
                />
                <ButtonType 
                    label={"Voltar"}
                    type="button"
                    className='button'
                    onClick={() => router.push("/consultas/ordemServicoManutencao")}
                />
                {formik.values.id &&
                    <>
                        <ButtonType 
                            label={"Ir para Pedido de Orçamento"}
                            type="button"
                            className='button'
                            onClick={irParaPedidoOrcamento}
                            disabled={!podeCadastrar || !osmEncerrada}
                        />
                        <ButtonType 
                            label={"Imprimir"}
                            type="button"
                            className='button'
                            disabled={!formik.values.id || !relatorio?.podeConsultar || osmCancelada}
                            style={{ 
                                padding: '10px 20px', 
                                fontSize: '1rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                transition: 'background 0.3s' 
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#ff3860'}
                            onMouseOut={(e) => e.currentTarget.style.background = ''}
                            onClick={() => imprimirOrdemServMnt(formik.values.id || ordemServicoManutencao.id || '')}
                        />
                    </>
                }
            </div>
        </form>
    );
};
