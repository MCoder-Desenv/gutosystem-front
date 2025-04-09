'use client';
import { FichaOrcamento } from '../../../app/models/fichaOrcamento';
import { Arquivo } from '../../../app/models/arquivos';
import { TerceiroFichaOrcamento, TerceirosCaracteristicasDescricao, TerceirosEnderecosClienteDto } from '../../../app/models/terceiros';
import { useTerceiroCaracteristicaService, useTerceiroService, useTerceiroEnderecoService, useFichaOrcamentoService, useMediaService } from '../../../app/services';
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
import SelectList from '../../../components/common/selectList';
import TabelaDinamica, { Column } from '../../../components/common/tabelaDinamica';
import { usePermissao } from '../../../app/hooks/usePermissoes';
import { TemplateImagem } from '../../../components/common/templateImagem';
import styles from './ficha.module.css';
import { format } from 'date-fns';
import { Checkbox } from 'primereact/checkbox';

interface FichaOrcamentoFormProps {
    fichaOrcamento: FichaOrcamento;
    onSubmit: (ficha: FichaOrcamento) => void;
}
const campoObrigatorio = 'Campo Obrigatório';

const validationScheme = Yup.object().shape({
    responsavel: Yup.object().required(campoObrigatorio),
    status: Yup.string().trim().required(campoObrigatorio),
    telefoneCliente: Yup.string().trim().required(campoObrigatorio),
    enderecoCliente: Yup.string().trim().required(campoObrigatorio),
    orcamento: Yup.string().trim().required(campoObrigatorio),
    dataSolicitacaoCliente: Yup.string()
        .trim()
        .required(campoObrigatorio)
        .test(
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
        )
});

// const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
// const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "video/mp4", "image/heic", "image/heif"];

export const FichaOrcamentoForm: React.FC<FichaOrcamentoFormProps> = ({
    fichaOrcamento,
    onSubmit
}) => {

    const [listaEnderecos, setListaEnderecos] = useState<TerceirosEnderecosClienteDto[]>([]);
    const [clienteFichaTel, setClienteFichaTel] = useState<{ label: string; value: string }[]>([]);
    const [mensagemTelefone, setMensagemTelefone] = useState('');
    const [mensagemResponsavel, setMensagemResponsavel] = useState('');

    const galleria = useRef<Galleria | null>(null); // Define o tipo correto
    const [indiceAtual, setIndiceAtual] = useState(0);

    //Services
    const service = useFichaOrcamentoService();
    const serviceTerceiro = useTerceiroService();
    const serviceClienteTel = useTerceiroCaracteristicaService();
    const serviceClienteEnderecos = useTerceiroEnderecoService();
    const mediaService = useMediaService();
    const router = useRouter();

    const statusOptions = [
        { label: 'Aberta', value: 'Aberta', className: 'status-Aberta' },
        { label: 'Em Andamento', value: 'Em-Andamento', className: 'status-Em-Andamento' },
        { label: 'Encerrada', value: 'Encerrada', className: 'status-Encerrada' },
        { label: 'Cancelada', value: 'Cancelada', className: 'status-Cancelada' },
    ];
    const { setOrcamentoData } = useOrcamentoContext(); // Acessar a função para setar os dados

    const { podeCadastrar } = usePermissao("Ficha de Orçamento");
    const relatorio = usePermissao("Relatório Ficha de Orçamento");

    //Modal
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');
    const [erroBuscarClientes, setErroBuscarClientes] = useState('');
    const [erroBuscarEnderecos, setErroBuscarEnderecos] = useState('');

    const dataFormatada = format(new Date(), 'yyyy-MM-dd');
    
    const formik = useFormik<FichaOrcamento>({
        initialValues: {
            id: fichaOrcamento.id || null,
            telefoneCliente: fichaOrcamento.telefoneCliente || null,
            enderecoCliente: fichaOrcamento.enderecoCliente || null,
            dataSolicitacaoCliente: fichaOrcamento.dataSolicitacaoCliente || dataFormatada,
            cliente: fichaOrcamento.cliente,
            responsavel: fichaOrcamento.responsavel,
            orcamento: fichaOrcamento.orcamento || null,
            fotoAmbCheck: fichaOrcamento.fotoAmbCheck || null,
            fotoAmbObs: fichaOrcamento.fotoAmbObs || null,
            ilumAmbCheck: fichaOrcamento.ilumAmbCheck || null,
            ilumAmbObs: fichaOrcamento.ilumAmbObs || null,
            acessDifeCheck: fichaOrcamento.acessDifeCheck || null,
            acessDifeObs: fichaOrcamento.acessDifeObs || null,
            servExtrCheck: fichaOrcamento.servExtrCheck || null,
            servExtrObs: fichaOrcamento.servExtrObs || null,
            casaComCheck: fichaOrcamento.casaComCheck || null,
            casaComObs: fichaOrcamento.casaComObs || null,
            volt110: fichaOrcamento.volt110 || null,
            volt220: fichaOrcamento.volt220 || null,
            altura: fichaOrcamento.altura || null,
            status: fichaOrcamento.status || null,
            medOrcamento: fichaOrcamento.medOrcamento || null,
            medProducao: fichaOrcamento.medProducao || null,
            observacoes: fichaOrcamento.observacoes || null,
            arquivos: fichaOrcamento.arquivos ? fichaOrcamento.arquivos.map(arquivo => ({
                id: arquivo.id || undefined,  // Alterado de null para undefined
                nome: arquivo.nome || '',
                caminho: arquivo.caminho || '',
                tipo: arquivo.tipo || '',
                file: arquivo.file
            })) : [],
            novosArquivos: fichaOrcamento.novosArquivos || []
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
                altura: values.altura || null,
                observacoes: values.observacoes || null,
                novosArquivos: values.novosArquivos,
                arquivos: values.arquivos,
                
            };
            onSubmit(formattedValues);
        },
        enableReinitialize: true,
        validationSchema: validationScheme
    });

    const fichaCancelada = fichaOrcamento.status === 'Cancelada';
    const fichaEncerrada = fichaOrcamento.status === 'Encerrada';

    const irParaPedidoOrcamento = () => {
        const contexto = {
            idFichaVsIdOrdemMnt: formik.values?.id || fichaOrcamento?.id,
            cliente: formik.values?.cliente || fichaOrcamento?.cliente,
            enderecoCliente: formik.values.enderecoCliente || fichaOrcamento?.enderecoCliente,
            telefoneCliente: formik.values.telefoneCliente || fichaOrcamento?.telefoneCliente,
            tela: 'FICHAORCAMENTO'
        };
        
        // Atualizar os dados no contexto, sem a necessidade de uma função de atualização completa
        setOrcamentoData(contexto);  // Passa o objeto direto, já que o setOrcamentoData agora aceita objetos parciais
        
        // Navegar para a tela de pedido de orçamento
        router.push('/cadastros/pedidoOrcamento');
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
    
    //const handleSearchCliente = async (query: string, type: 'nome' | 'cpf' | 'cnpj') => {
    const handleSearchCliente = async (query: string) => {
        try {
            setErroBuscarClientes('')
            //const results: ClienteFichaDto[] = [];
    
            const response = await serviceTerceiro.findClienteAutoComplete(query);
            const results = response.data

            // if (type === 'nome') {
            //     const response = await serviceTerceiro.findClienteFichaAutoComplete(query, '', '');
            //     results = response.data
            // } else if (type === 'cpf') {
            //     const response = await serviceTerceiro.findClienteFichaAutoComplete('', query, '');
            //     results = response.data
            // } else if (type === 'cnpj') {
            //     const response = await serviceTerceiro.findClienteFichaAutoComplete('', '', query);
            //     results = response.data
            // }
            
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
                const partes = fichaOrcamento.enderecoCliente?.split(',').map(part => part.trim()) || [];
    
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

    //BUSCA RESPONSAVEL
    const responsavelAtendimentoSelecionado = useMemo(() => {
        return formik.values.responsavel && formik.values.responsavel?.id
            ? formik.values.responsavel
            : null;
    }, [formik.values.responsavel]);


    const handleSearchResponsavel = async (queryResp: string) => {
        try {
            setMensagemResponsavel('')
            let results: TerceiroFichaOrcamento[] = [];

            const response = await serviceTerceiro.findFuncionarioAutoComplete(queryResp, '');
            
            results = response.data;

            return results
                .filter((item) => item.id !== undefined && item.id !== null)
                .map((item) => ({
                    ...item,
                    id: item.id ?? '',
                }));
        } catch (error) {
            setMensagemResponsavel('Erro ao buscar responsável:' + error)
            return []; // Garante que sempre retorna um array
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelectResponsavel = (item: any) => {
    // Atualiza o formulário com os valores do item selecionado
        formik.setFieldValue('responsavel.id', item?.id); // Salva o ID no formik
        formik.setFieldValue('responsavel.nome', item?.nome); // Salva o ID no formik
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
    const columns: Column[] = [
        { label: "Conferência do lugar de instalação", key: "descricao", disabled: !podeCadastrar || fichaCancelada },
        { label: "Sim/Não", key: "check", type: "checkbox", disabled: !podeCadastrar || fichaCancelada},
        { label: "Observação", key: "obs", type: "textarea", disabled: !podeCadastrar || fichaCancelada, width:'50%' },
    ];
      
    const valuesFormatted = Object.fromEntries(
        Object.entries(formik.values).map(([key, value]) => [key, value ?? ""])
    );

    const data = [
        {
          descricao: { value: "Foto do Ambiente" },
          check: { value: "fotoAmbCheck" },
          obs: { value: "fotoAmbObs", placeholder: "Observações..." },
        },
        {
          descricao: { value: "Iluminação do Ambiente" },
          check: { value: "ilumAmbCheck" },
          obs: { value: "ilumAmbObs", placeholder: "Observações..." },
        },
        {
          descricao: { value: "Acessórios Diferentes" },
          check: { value: "acessDifeCheck" },
          obs: { value: "acessDifeObs", placeholder: "Observações..." },
        },
        {
          descricao: { value: "Serviços Extras" },
          check: { value: "servExtrCheck" },
          obs: { value: "servExtrObs", placeholder: "Observações..." },
        },
        {
          descricao: { value: "Casa-Comércio em Obra" },
          check: { value: "casaComCheck" },
          obs: { value: "casaComObs", placeholder: "Observações..." },
        },
      ];
      

    //RELATORIO
    const imprimirFicha = (idFicha: string, tipoRelatorio: string) => {
        if (idFicha) {
            if (tipoRelatorio === 'fichaOrcamento') {
                // Exibir modal de carregamento
                exibirMensagem("Relatório sendo gerado, aguarde...", "loading");
                service.gerarRelatorioFichaOrcamento(idFicha).then(blob => {
                    if (blob) { // Verifica se o blob não é null
                        const fileUrl = URL.createObjectURL(blob);
                        window.open(fileUrl);
                        // Fechar modal ao concluir com sucesso
                        setModalVisivel(false);
                    } else {
                        exibirMensagem("Erro ao gerar o relatório: blob é null", "error");
                    }
                }).catch(error => {
                    exibirMensagem("Erro ao gerar relatório: " + error, "error");
                });
            } else {
                exibirMensagem("Erro na aplicação, comunicar o desenvolvedor", "error");
            }
        } else {
            exibirMensagem("Erro: A Ficha não foi criada para gerar o gelatório", "error");
        }
    };

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

            <div className="columns">
                <AutoCompleteGenerico
                    id="clienteSelecionado"
                    name="clienteSelecionado"
                    label="Cliente: *"
                    autoComplete='off'
                    disabled={!podeCadastrar || fichaCancelada}
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
                            disabled={!podeCadastrar || fichaCancelada}
                        />
                        {formik.errors.telefoneCliente ? (
                            <p className="help is-danger">{formik.errors.telefoneCliente}</p>
                        ) : (formik.values.id === '' || formik.values.id === null) && mensagemTelefone !== '' ? (
                            <p className="help is-danger">{mensagemTelefone}</p>
                        ) : null}
                    </div>
                </div>
                <Input
                    id="dataSolicitacaoCliente"
                    label="Data de Solicitação do Cliente: *"
                    value={formik.values.dataSolicitacaoCliente || ''}
                    columnClasses="column is-half"
                    onChange={formik.handleChange}
                    className={`input ${formik.errors.dataSolicitacaoCliente ? 'border border-red-500' : ''}`}
                    placeholder="Digite a Data de Solicitação do Cliente"
                    autoComplete="off"
                    disabled={!podeCadastrar || fichaCancelada}
                    type='date'
                    erro={formik.errors.dataSolicitacaoCliente}
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
                    disabled={!podeCadastrar || fichaCancelada}
                    label="Endereço:* "
                    erro={erroBuscarEnderecos !== '' ? erroBuscarEnderecos : formik.errors.enderecoCliente}
                />
            </div>
            <div className="columns">
                <AutoCompleteGenerico
                    id="responsavelAtendimentoSelecionado"
                    name="responsavelAtendimentoSelecionado"
                    label="Responsável pelo Atendimento: *"
                    autoComplete='off'
                    disabled={!podeCadastrar || fichaCancelada}
                    value={
                        responsavelAtendimentoSelecionado
                          ? `${responsavelAtendimentoSelecionado.id} - ${responsavelAtendimentoSelecionado.nome}`
                          : ''
                      } // Usa o valor formatado corretamente
                    
                      onSearch={(query) => {
                        const trimmedQuery = query.trim();
                        return handleSearchResponsavel(trimmedQuery);
                    }}                    
                    
                     // Chama a busca ao digitar
                    onSelect={(item) => handleSelectResponsavel(item)} // Atualiza o formulário ao selecionar
                    formatResult={(item) =>
                        `${item.id} - ${item.nome}`
                    }
                    placeholder="Digite o nome do Responsável"
                    erro={mensagemResponsavel !== '' ? mensagemResponsavel :
                        formik.values.responsavel?.id === '' ||
                        formik.values.responsavel?.id === null ||
                        formik.values.responsavel?.id === undefined
                          ? campoObrigatorio
                          : ''
                      }
                />
            </div>

            <div className="columns">
                <Input
                    id="orcamento"
                    label="Orçamento: *"
                    disabled={!podeCadastrar || fichaCancelada}
                    value={formik.values.orcamento || ''}
                    columnClasses="column is-full"
                    onChange={formik.handleChange}
                    placeholder="Digite o Orçamento"
                    autoComplete="off"
                    erro={formik.errors.orcamento}
                />
            </div>

            <TabelaDinamica
                columns={columns}
                data={data}
                values={valuesFormatted} // Garante que os valores vêm diretamente do Formik
                setValues={(newValues) => {
                        Object.entries(newValues).forEach(([key, value]) => {
                        formik.setFieldValue(key, value); // Atualiza corretamente os valores no Formik
                    });
                }}
                className={{ table: "table is-bordered is-striped is-hoverable is-fullwidth" }}
            />
            <br/>
            <div className="columns">
                <div className="column" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="medOrcamento" style={{ marginRight: '8px' }}>
                        Medidas para Orçamento:
                    </label>
                    <Checkbox
                        inputId="medOrcamento"
                        name='medOrcamento'
                        autoComplete='off'
                        checked={formik.values.medOrcamento ?? false} /* Aqui garantimos que o valor é booleano */
                        onChange={(e) => formik.setFieldValue("medOrcamento", e.checked ? true : false)}
                        disabled={!podeCadastrar}
                    />
                </div>
                <div className="column" style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="medOrcamento" style={{ marginRight: '8px' }}>
                        Medida Final para Produção:
                    </label>
                    <Checkbox
                        inputId="medProducao"
                        name='medProducao'
                        autoComplete='off'
                        checked={formik.values.medProducao ?? false}  /* Aqui garantimos que o valor é booleano */
                        onChange={(e) => formik.setFieldValue("medProducao", e.checked ? true : false)}
                        disabled={!podeCadastrar}
                    />
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
                    disabled={!podeCadastrar || fichaCancelada}
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
                        <input disabled={!podeCadastrar || fichaCancelada} type="file" multiple onChange={handleFileChange} accept="image/*,video/mp4, application/*" hidden />
                    </label>

                    {/* Botão Cancel (Remove Todos os Arquivos) */}
                    <label className="cancel-button" onClick={handleRemoveAll}>
                        <i className="pi pi-times"></i> Cancelar
                    </label>
                    
                    {/* Botão "Show" agora como label */}
                    <label
                        className={`show-button ${!podeCadastrar || ((fichaOrcamento.arquivos?.length ?? formik.values.arquivos?.length ?? 0) < 1) ? styles.disabled : ''}`}  
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
                {(formik.values.id || fichaOrcamento.id) &&
                    <>
                        <ButtonType 
                            className='button'
                            type="button"
                            label={"Ir para Pedido de Orçamento"}
                            onClick={irParaPedidoOrcamento}
                            disabled={!podeCadastrar ||!fichaEncerrada}
                        />  
                        <ButtonType 
                            type="button"
                            label={
                                <>
                                    <i className="pi pi-file-pdf" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i>
                                    Imprimir
                                </>
                            }
                            className='button'
                            style={{ 
                                padding: '10px 20px', 
                                fontSize: '1rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                transition: 'background 0.3s' 
                            }}
                            disabled={!relatorio?.podeConsultar || fichaCancelada}
                            onMouseOver={(e) => e.currentTarget.style.background = '#ff3860'} 
                            onMouseOut={(e) => e.currentTarget.style.background = ''}  
                            onClick={() => imprimirFicha(formik.values.id || fichaOrcamento.id || '', 'fichaOrcamento')}
                        />  
                    </>
                }
            </div>
        </form>
    );
};
