'use client';
import { PedidoOrcamento, ProdutoPedidoOrcamento } from '../../../app/models/pedidoOrcamento';
import { formatDateToBackend } from '../../../app/util/formatData';
import { Input } from '../../../components';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import * as Yup from 'yup';
import React, { useEffect, useMemo, useState } from 'react';
import { useOrcamentoContext } from '../../../contexts/OrcamentoContext';
import {
  useFichaOrcamentoService,
  useOrdemServicoManutencaoService,
  usePedidoOrcamentoService,
  useProdutoService,
  useTerceiroService
} from '../../../app/services';
import { FichaOrcamentoDto } from '../../../app/models/fichaOrcamento';
import { OrdemServicoManutencaoDto } from '../../../app/models/ordemServicoManutencao';
import { ButtonType } from '../../../components/common/button';
import { AutoCompleteGenerico } from '../../../components/common';
import { ModalCard } from '../../../components/common/modal';
import { usePermissao } from '../../../app/hooks/usePermissoes';
import { formatCurrency } from '../../../app/util/money';
import { useManutencaoContext } from '../../../contexts/ManutencaoContext';
import { AutoCompleteInput } from '../../../components/common/autoCompleteInput';
import { Produto } from '../../../app/models/produtos';
import { FuncionarioDto } from '../../../app/models/terceiros';
import { format } from 'date-fns';


interface PedidoOrcamentoFormProps {
  pedidoOrcamento: PedidoOrcamento;
  onSubmit: (pedido: PedidoOrcamento) => void;
}

interface OrcamentoContextType {
  id: string | null;
  nomeCliente: string | null;
  enderecoCliente: string | null;
  telefoneCliente: string | null;
  setOrcamentoData: (data: OrcamentoContextType) => void;
}

const campoObrigatorio = 'Campo Obarigatório';

const validationScheme = Yup.object().shape({
  dataPedido: Yup.string().trim().required(campoObrigatorio).test(
    'data-nao-futura',
    'A data do pedido não pode ser maior que a data atual',
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
  dataPosVenda: Yup.string().nullable().test(
    'data-nao-futura',
    'A data de pos-venda não pode ser maior que a data atual',
    (value) => {
      if (!value) return true; // Permite valores nulos ou vazios sem falhar

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
  status: Yup.string().trim().required(campoObrigatorio),
  produtos: Yup.array().of(
    Yup.object().shape({
      descricao: Yup.string().required(campoObrigatorio),
      quantidade: Yup.number()
        .required(campoObrigatorio)
        .min(1, 'Quantidade deve ser maior que zero'),
      vlrUnitario: Yup.number()
        .required(campoObrigatorio)
        .min(0.01, 'Valor deve ser maior que zero'),
    })
  ),
});

export const PedidoOrcamentoForm: React.FC<PedidoOrcamentoFormProps> = ({
  pedidoOrcamento,
  onSubmit,
}) => {

  const router = useRouter();
  const service = usePedidoOrcamentoService();
  const serviceProduto = useProdutoService();
  const serviceTerceiro = useTerceiroService();
  const serviceFicha = useFichaOrcamentoService();
  const serviceOrdemMnt = useOrdemServicoManutencaoService();
  const { setManutencaoData } = useManutencaoContext(); // Acessar a função para setar os dados

  const { podeCadastrar } = usePermissao("Pedido Orçamento");
  const relatorio = usePermissao("Relatório Pedido de Orçamento");
  const relatorioInformacaoComplementar = usePermissao("Relatório Pedido de Orçamento - Informações Complementares");

  const { idFichaVsIdOrdemMnt , cliente, enderecoCliente, telefoneCliente, tela } = useOrcamentoContext(); // Acessar os dados do contexto

  const [setaTela, setSetarTela] = useState(tela);

  //BOTOES
  const [showModal, setShowModal] = useState(false); // Controle do modal
  const [nextTipoTela, setNextTipoTela] = useState<string | null>(null);

  const [isTrackingInfoVisible, setTrackingInfoVisible] = useState(false);

  //mensagem
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');

  const [erroBuscarVendedor, setErroBuscarVendedor] = useState('');
  const [erroBuscarResponsavel, setErroBuscarResponsavel] = useState('');
  const [erroBuscarResponsavelMedida, setErroBuscarResponsavelMedida] = useState('');
  const [erroBuscarFornecedor, setErroBuscarFornecedor] = useState('');

  const statusOptions = [
    { label: 'Aberta', value: 'Aberta', className: 'status-Aberta' },
    { label: 'Em Andamento', value: 'Em-Andamento', className: 'status-Em-Andamento' },
    { label: 'Encerrada', value: 'Encerrada', className: 'status-Encerrada' },
    { label: 'Cancelada', value: 'Cancelada', className: 'status-Cancelada' },
  ];

  const dataFormatada = format(new Date(), 'yyyy-MM-dd');

  const formik = useFormik<PedidoOrcamento>({
    initialValues: {
      ...pedidoOrcamento,
      id: pedidoOrcamento.id || '',
      fichaOrcamento: {
        id: pedidoOrcamento?.fichaOrcamento?.id || null,
        cliente: pedidoOrcamento.fichaOrcamento?.cliente,
        dataSolicitacaoCliente: pedidoOrcamento.fichaOrcamento?.dataSolicitacaoCliente,
        status: pedidoOrcamento.fichaOrcamento?.status || null,
        enderecoCliente: pedidoOrcamento.fichaOrcamento?.enderecoCliente || null,
        telefoneCliente: pedidoOrcamento.fichaOrcamento?.telefoneCliente || null,
      },
      ordemServicoManutencao: {
        id: pedidoOrcamento?.ordemServicoManutencao?.id || null,
        cliente: pedidoOrcamento.ordemServicoManutencao?.cliente,
        telefoneCliente: pedidoOrcamento.ordemServicoManutencao?.telefoneCliente || null,
        enderecoCliente: pedidoOrcamento.ordemServicoManutencao?.enderecoCliente || null,
        status: pedidoOrcamento.ordemServicoManutencao?.status || null,
        numero: pedidoOrcamento.ordemServicoManutencao?.numero || null,
        dataSolicitacaoManutencao: pedidoOrcamento.ordemServicoManutencao?.dataSolicitacaoManutencao || null,
      },
      produtosPedido: pedidoOrcamento.produtosPedido || [],  // Garantir que seja um array
      formaDePagamento: pedidoOrcamento.formaDePagamento || '',
      status: pedidoOrcamento.status || '',
      identificador: pedidoOrcamento.identificador || '',
      dataPosVenda: pedidoOrcamento.dataPosVenda || null,
      responsavelPedido: pedidoOrcamento.responsavelPedido || {},
      disServico: pedidoOrcamento.disServico || '',
      retorno: pedidoOrcamento.retorno || '',
      infoComplementar: pedidoOrcamento.infoComplementar || '',
      satisfacaoCliente: pedidoOrcamento.satisfacaoCliente || '',
      satisfacaoCheck: pedidoOrcamento.satisfacaoCheck || '',
      fornecedor: pedidoOrcamento.fornecedor || {},
      responsavelMedida: pedidoOrcamento.responsavelMedida || {},
      total: pedidoOrcamento.total || 0,
      vendedor: pedidoOrcamento.vendedor || {},
      dataPedido: pedidoOrcamento.dataPedido || dataFormatada
    },
    onSubmit: (values) => {
      const formattedValues = {
        ...values,
        fichaOrcamento: {
          id: values.fichaOrcamento?.id
        },
        ordemServicoManutencao: {
          id: values.ordemServicoManutencao?.id,
        }
      };
      onSubmit(formattedValues);
    },
    validationSchema: validationScheme,
    enableReinitialize: true
  });

  //status
  const pedidoCancelada = formik.values.status === 'Cancelada' || pedidoOrcamento.status === 'Cancelada';
  const pedidoEncerrada = formik.values.status === 'Encerrada' || pedidoOrcamento.status === 'Encerrada';

  //BOTÕES

  const handleTipoChange = (tipo: string) => {
    if ((tipo === 'FICHAORCAMENTO' && formik.values?.ordemServicoManutencao?.id) || (tipo === 'ORDEMSERVMNT' && formik.values?.fichaOrcamento?.id)) {
      setNextTipoTela(tipo); // Armazena o novo tipo
      setShowModal(true); // Mostra o modal
    }
    else {
      aplicarTipoTela(tipo); // Troca diretamente
      setSetarTela(tipo); // Passa o objeto direto, já que o setOrcamentoData agora aceita objetos parciais
    }
  };

  // Aplica a troca de tipo e limpa campos dependentes
  const aplicarTipoTela = (novoTipo: string) => {
    if (novoTipo === 'FICHAORCAMENTO') {
      formik.setFieldValue("ordemServicoManutencao", {});
      formik.setFieldValue("ordemServicoManutencao.cliente.id", null);
      formik.setFieldValue("ordemServicoManutencao.cliente.nome", null);
      formik.setFieldValue("ordemServicoManutencao.numero", null);
      formik.setFieldValue("ordemServicoManutencao.id", null);
      formik.setFieldValue("ordemServicoManutencao.enderecoCliente", null);
      formik.setFieldValue("ordemServicoManutencao.telefoneCliente", null);
      formik.setFieldValue("ordemServicoManutencao.cliente.cnpj", null);
      formik.setFieldValue("ordemServicoManutencao.cliente.cpf", null);
    } else if (novoTipo === 'ORDEMSERVMNT') {
      formik.setFieldValue("fichaOrcamento", {});
      formik.setFieldValue("fichaOrcamento.cliente.id", null);
      formik.setFieldValue("fichaOrcamento.cliente.nome", null);
      formik.setFieldValue("fichaOrcamento.enderecoCliente", null);
      formik.setFieldValue("fichaOrcamento.cliente.cnpj", null);
      formik.setFieldValue("fichaOrcamento.cliente.cpf", null);
    }
    setSetarTela(novoTipo); // Passa o objeto direto, já que o setOrcamentoData agora aceita objetos parciais
    setShowModal(false); // Fecha o modal
  };

  //FICHA ORÇAMENTO

  const fichaSelecionada = useMemo(() => {
    return formik.values.fichaOrcamento && formik.values.fichaOrcamento?.id
      ? formik.values.fichaOrcamento
      : null;
  }, [formik.values.fichaOrcamento]);

  const handleSearchFicha = async (query: string, tipo: "codigo" | "nome") => {
    let results
    
    if (tipo === 'codigo') {
      results = await serviceFicha.findFichasPedido('', query, 'Encerrada');
    }
    else {
      results = await serviceFicha.findFichasPedido(query, '',  'Encerrada');
    }
    
    return results
      .filter((item) => item.id !== undefined && item.id !== null)
      .map((item) => ({
        ...item,
        id: item.id ?? '',
      }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectFicha = (item: any) => {
    // Atualiza o formulário com os valores do item selecionado
    formik.setFieldValue("fichaOrcamento", item);
    formik.setFieldValue("fichaOrcamento.cliente.id", item?.idCliente);
    formik.setFieldValue("fichaOrcamento.cliente.nome", item.nomeCliente);
    formik.setFieldValue("fichaOrcamento.telefoneCliente", item?.telefoneCliente);
    formik.setFieldValue("fichaOrcamento.enderecoCliente", item?.enderecoCliente);
    formik.setFieldValue("fichaOrcamento.cliente.cnpj", item?.cnpj);
    formik.setFieldValue("fichaOrcamento.cliente.cpf", item?.cpf);
  };

  //ORDEM SERVIÇO ORÇAMENTO
  const ordemServicoSelecionado = useMemo(() => {
    return formik.values.ordemServicoManutencao && formik.values.ordemServicoManutencao?.id
      ? formik.values.ordemServicoManutencao
      : null;
  }, [formik.values.ordemServicoManutencao]);

  const handleSearchOrdemServMnt = async (query: string) => {
    const results = await serviceOrdemMnt.findOrdemServMntPedido(query, 'Encerrada'); // Substitua com sua função de busca
    return results
      .filter((item) => item.id !== undefined && item.id !== null)
      .map((item) => ({
        ...item,
        id: item.id ?? '',
      }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectOrdem = (item: any) => {
    // Atualiza o formulário com os valores do item selecionado
    formik.setFieldValue("ordemServicoManutencao.cliente.id", item?.idCliente);
    formik.setFieldValue("ordemServicoManutencao.cliente.nome", item?.nomeCliente);
    formik.setFieldValue("ordemServicoManutencao.numero", item?.numero);
    formik.setFieldValue("ordemServicoManutencao.id", item?.id);
    formik.setFieldValue("ordemServicoManutencao.enderecoCliente", item?.enderecoCliente);
    formik.setFieldValue("ordemServicoManutencao.telefoneCliente", item?.telefoneCliente);
    formik.setFieldValue("ordemServicoManutencao.cliente.cnpj", item?.cnpj);
    formik.setFieldValue("ordemServicoManutencao.cliente.cpf", item?.cpf);
  };

  //VENDEDOR
  const vendedorSelecionado = useMemo(() => {
    return formik.values.vendedor && formik.values.vendedor?.id
      ? formik.values.vendedor
      : null;
  }, [formik.values.vendedor]);

  const handleSearchVendedor = async (query: string): Promise<{ id: string | number; nome: string | null }[]> => {
    try {
        const results = await serviceTerceiro.findFuncionarioAutoComplete(query);
        setErroBuscarVendedor('');
        if (!results?.data) return []; // Retorna um array vazio se não houver dados

        return results.data
            .filter((item: FuncionarioDto) => item.id !== undefined && item.id !== null)
            .map((item: FuncionarioDto) => ({
                id: item.id ?? "", // Garante que o id nunca seja undefined
                nome: item.nome ?? null, // Garante que descricao nunca seja undefined
            }));
    } catch (error) {
        setErroBuscarVendedor("Erro ao buscar Vendedor: " + error);
        return []; // Retorna um array vazio em caso de erro
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectVendedor = (item: any) => {
    // Atualiza o formulário com os valores do item selecionado
    formik.setFieldValue('vendedor.id', item?.id); // Salva o ID no formik
    formik.setFieldValue('vendedor.nome', item?.nome); // Salva o ID no formik
  };

  //RESPONSÁVEL PEDIDO
  const responsavelPedidoSelecionado = useMemo(() => {
    return formik.values.responsavelPedido && formik.values.responsavelPedido?.id
      ? formik.values.responsavelPedido
      : null;
  }, [formik.values.responsavelPedido]);

  const handleSearchResponsavelPedido = async (query: string): Promise<{ id: string | number; nome: string | null }[]> => {
    try {
        const results = await serviceTerceiro.findFuncionarioAutoComplete(query);
        setErroBuscarResponsavel('');
        if (!results?.data) return []; // Retorna um array vazio se não houver dados

        return results.data
            .filter((item: FuncionarioDto) => item.id !== undefined && item.id !== null)
            .map((item: FuncionarioDto) => ({
                id: item.id ?? "", // Garante que o id nunca seja undefined
                nome: item.nome ?? null, // Garante que descricao nunca seja undefined
            }));
    } catch (error) {
      setErroBuscarResponsavel("Erro ao buscar Responsável Pedido: " + error);
        return []; // Retorna um array vazio em caso de erro
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectResponsavelPedido = (item: any) => {
    // Atualiza o formulário com os valores do item selecionado
    formik.setFieldValue('responsavelPedido.id', item?.id); // Salva o ID no formik
    formik.setFieldValue('responsavelPedido.nome', item?.nome); // Salva o ID no formik
  };

  // RESPONSÁVEL MEDIDA
  const responsavelMedidaSelecionado = useMemo(() => {
    return formik.values.responsavelMedida && formik.values.responsavelMedida?.id
      ? formik.values.responsavelMedida
      : null;
  }, [formik.values.responsavelMedida]);

  const handleSearchResponsavelMedida = async (query: string): Promise<{ id: string | number; nome: string | null }[]> => {
    try {
        const results = await serviceTerceiro.findFuncionarioAutoComplete(query);
        setErroBuscarResponsavelMedida('');
        if (!results?.data) return []; // Retorna um array vazio se não houver dados

        return results.data
            .filter((item: FuncionarioDto) => item.id !== undefined && item.id !== null)
            .map((item: FuncionarioDto) => ({
                id: item.id ?? "", // Garante que o id nunca seja undefined
                nome: item.nome ?? null, // Garante que descricao nunca seja undefined
            }));
    } catch (error) {
        setErroBuscarResponsavelMedida('Erro ao buscar Responsável Medida: ' + error);
        return []; // Retorna um array vazio em caso de erro
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectResponsavelMedida = (item: any) => {
    // Atualiza o formulário com os valores do item selecionado
    formik.setFieldValue('responsavelMedida.id', item?.id); // Salva o ID no formik
    formik.setFieldValue('responsavelMedida.nome', item?.nome); // Salva o ID no formik
  };

  // FORNECEDOR
  const fornecedorSelecionado = useMemo(() => {
    return formik.values.fornecedor && formik.values.fornecedor?.id
      ? formik.values.fornecedor
      : null;
  }, [formik.values.fornecedor]);

  const handleSearchFornecedor = async (query: string): Promise<{ id: string | number; nome: string | null }[]> => {
    try {
        const results = await serviceTerceiro.findFornecedorAutoComplete(query);
        setErroBuscarFornecedor("");
        if (!results?.data) return []; // Retorna um array vazio se não houver dados

        return results.data
            .filter((item: FuncionarioDto) => item.id !== undefined && item.id !== null)
            .map((item: FuncionarioDto) => ({
                id: item.id ?? "", // Garante que o id nunca seja undefined
                nome: item.nome ?? null, // Garante que descricao nunca seja undefined
            }));
    } catch (error) {
        setErroBuscarFornecedor("Erro ao buscar Fornecedores: " + error);
        return []; // Retorna um array vazio em caso de erro
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectFornecedor = (item: any) => {
    // Atualiza o formulário com os valores do item selecionado
    formik.setFieldValue('fornecedor.id', item?.id); // Salva o ID no formik
    formik.setFieldValue('fornecedor.nome', item?.nome); // Salva o ID no formik
  };

  const toggleTrackingInfo = () => {
    setTrackingInfoVisible(!isTrackingInfoVisible);
  };

  //FICHA CONTEXT - VEM DA TELA DE FICHA
  const handleSearchFichaContext = async (query: string, tela: string) => {
    try {
      if (tela === 'FICHAORCAMENTO') {
          let resultsFicha: FichaOrcamentoDto[] = [];
    
          resultsFicha = await serviceFicha.findFichasPedido('', query, 'Encerrada');
    
          if (resultsFicha.length > 0) {
            const formattedResult = resultsFicha[0]; 
            handleSelectFicha(formattedResult);

          }
          else {
            handleSelectFicha({});
          }
      }
      else if (tela === 'ORDEMSERVMNT') {
          let resultsOrdemServMnt: OrdemServicoManutencaoDto[] = [];
    
          resultsOrdemServMnt = await serviceOrdemMnt.findOrdemServMntPedido(query);
    
          if (resultsOrdemServMnt.length > 0) {
            const formattedResult = resultsOrdemServMnt[0]; 
            handleSelectOrdem(formattedResult);

          }
          else {
            handleSelectOrdem({});
          }

      }
      else {
        alert("Nem Ficha e nem Ordem de Serviço Manutenção para associar ao Pedido");
        throw new Error('Nem Ficha e nem Ordem de Serviço Manutenção para associar ao Pedido');
      }
    } catch (error) {
      alert("Erro ao buscar Fichas de Orçamento ou Ordem Serviço Manutenção: " + error);
      console.error("Erro ao buscar Fichas de Orçamento ou Ordem Serviço Manutenção:", error);
    }
  };

  useEffect(() => {
    if (idFichaVsIdOrdemMnt) {
      handleSearchFichaContext(idFichaVsIdOrdemMnt, tela || '')
        
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFichaVsIdOrdemMnt]);

  // Calcular o total ao carregar ou alterar os produtosPedido
  useEffect(() => {
    const totalCalculado = formik.values.produtosPedido?.reduce(
        (acc, produto) => acc + (produto.vlrTotal || 0),
        0
    );
    
    // Atualizar o valor total no formik
    formik.setFieldValue("total", totalCalculado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values?.produtosPedido]); // Dependência de produtosPedido

  const handleSearchProduto = async (query: string): Promise<{ id: string | number; descricao: string | null }[]> => {
    try {
        const prod = await serviceProduto.findProdutosPedido(query);
        
        if (!prod?.data) return []; // Retorna um array vazio se não houver dados

        return prod.data
            .filter((item: Produto) => item.id !== undefined && item.id !== null)
            .map((item: Produto) => ({
                id: item.id ?? "", // Garante que o id nunca seja undefined
                descricao: item.descricao ?? null, // Garante que descricao nunca seja undefined
            }));
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        return []; // Retorna um array vazio em caso de erro
    }
  };

  const adicionarProduto = () => {
    const novoProduto: ProdutoPedidoOrcamento = {
      tempId: `temp-${Date.now()}`,
      id: '',
      idPedidoOrcamento: formik.values.id,
      descricao: '',
      quantidade: 1,
      vlrUnitario: 0,
      vlrTotal: 0,
    };
  
    // Atualiza o array de produtos no Formik, mantendo os valores anteriores e adicionando o novo produto
    const novosProdutos = [...formik.values.produtosPedido || [], novoProduto];
    formik.setFieldValue('produtosPedido', novosProdutos); // Atualiza o array de produtos no Formik
  };

  const atualizarProduto = (id: string, campo: keyof ProdutoPedidoOrcamento, valor: unknown) => {
    const novosProdutos = formik.values.produtosPedido?.map((produto) => {
      if (produto.tempId === id || produto.id === id) {
        return {
          ...produto,
          [campo]: valor,
          vlrTotal:
            campo === 'quantidade' || campo === 'vlrUnitario'
              ? (campo === 'quantidade' ? Number(valor) : produto.quantidade || 0) *
                (campo === 'vlrUnitario' ? Number(valor) : produto.vlrUnitario || 0)
              : produto.vlrTotal,
        };
      }
      return produto;
    });
  
    //setProdutosPedido(novosProdutos);
    formik.setFieldValue('produtosPedido', novosProdutos);
  };
  
  const removerProduto = (produto: ProdutoPedidoOrcamento) => {
    // Verifica se o produto tem o id, se não, usa o tempId
    const novosProdutos = formik.values.produtosPedido?.filter((item) => {
      return item.id ? item.id !== produto.id : item.tempId !== produto.tempId;
    });
  
    formik.setFieldValue('produtosPedido', novosProdutos); // Atualiza o Formik
  };  

  const atualizarDescricaoProduto = (index: number, descricao: string) => {
    const novosProdutos = [...formik.values?.produtosPedido || []];
    
    // Verifica se o índice está dentro do limite do array e se o produto existe
    if (novosProdutos[index]) {
        novosProdutos[index].descricao = descricao; // Atualiza somente a descrição
        formik.setFieldValue('produtosPedido', novosProdutos); // Atualiza o Formik
    } else {
        alert(`Produto não encontrado no índice ${index}, chamar o suporte`)
        console.error(`Produto não encontrado no índice ${index}, chamar o suporte`);
    }
  };

  //relatorio
  const imprimirPedido = (idPedido: string, tipoRelatorio: string) =>{
      if (idPedido !== '' && idPedido !== null && idPedido !== undefined) {
          if (tipoRelatorio === 'informacoesRastreamento') {
              exibirMensagem("Relatório sendo gerado, aguarde...", "loading");
              service.gerarRelatorioInformacaoComplementar(idPedido).then(blob => {
                  const fileUrl = URL.createObjectURL(blob);
                  window.open(fileUrl)
                  setModalVisivel(false);
              })
              
          }
          else if (tipoRelatorio === 'pedidoOrcamento') {
              exibirMensagem("Relatório sendo gerado, aguarde...", "loading");
              service.gerarRelatorioPedidoOrcamento(idPedido).then(blob => {
                  const fileUrl = URL.createObjectURL(blob);
                  window.open(fileUrl)
                  setModalVisivel(false);
              })
          }
          else {
            exibirMensagem("Relatório não gerado, entre em contato com o suporte", "error");
          }
      }
      else {
        exibirMensagem("O Pedido ainda não tem foi criado para gerar o relatório", "error");
      }
      
  }

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

  const irParaOrdemServicoManutencao = () => {
    const contexto = {
        idPedido: formik.values?.id || pedidoOrcamento?.id,
    };
    
    // Atualizar os dados no contexto, sem a necessidade de uma função de atualização completa
    setManutencaoData(contexto);  // Passa o objeto direto, já que o setOrcamentoData agora aceita objetos parciais
    
    // Navegar para a tela de Ordem de Servico Manutencao
    router.push('/cadastros/ordemServicoManutencao');
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

      <div className="buttons mb-4">
        {tela === null && (
          <>
            <div className="buttons mb-4">
              <button
                  type="button"
                  className={`button ${setaTela === 'FICHAORCAMENTO' || formik?.values?.fichaOrcamento?.id ? 'is-primary' : ''}`}
                  onClick={() => handleTipoChange('FICHAORCAMENTO')}
                  disabled={!podeCadastrar || pedidoCancelada}
              >
                  Ficha Orçamento
              </button>
              <button
                  type="button"
                  className={`button ${setaTela === 'ORDEMSERVMNT' || formik?.values?.ordemServicoManutencao?.id ? 'is-primary' : ''}`}
                  onClick={() => handleTipoChange('ORDEMSERVMNT')}
                  disabled={!podeCadastrar || pedidoCancelada}
              >
                  Ordem Serviço Manutenção
              </button>
            </div>
          </>
        )}
      </div>

      { (tela === 'FICHAORCAMENTO' || setaTela === 'FICHAORCAMENTO' || formik?.values?.fichaOrcamento?.id)  ?
        <div className="columns">
          <AutoCompleteGenerico
            id="fichaSelecionada"
            name="fichaSelecionada"
            label="Ficha Orçamento: *"
            value={
              fichaSelecionada
                ? `${fichaSelecionada.id} - ${fichaSelecionada.cliente?.id} - ${fichaSelecionada.cliente?.nome} - ${formatDateToBackend(fichaSelecionada?.dataSolicitacaoCliente || '')}`
                : ''
            } // Usa o valor formatado corretamente
            onSearch={(query) => {
              const trimmedQuery = query.trim();
          
              if (/^\d+$/.test(trimmedQuery)) {
                return handleSearchFicha(trimmedQuery, "codigo"); // 🔹 Retorna a Promise
              } else {
                return handleSearchFicha(trimmedQuery, "nome"); // 🔹 Retorna a Promise
              }
            }}
            onSelect={(item) => handleSelectFicha(item)}
            formatResult={(item) => `${item.id} - ${item.idCliente} - ${item.nomeCliente} - ${formatDateToBackend(item?.dataSolicitacaoCliente || '')}`}
            placeholder="Digite"
            erro={
              formik.values.fichaOrcamento?.id === '' ||
              formik.values.fichaOrcamento?.id === null ||
              formik.values.fichaOrcamento?.id === undefined
                ? 'Campo Obrigatório'
                : ''
            }
            disabled={!podeCadastrar || pedidoCancelada}
          />
        </div>
        :
        (tela === 'ORDEMSERVMNT' || setaTela === 'ORDEMSERVMNT' || formik?.values?.ordemServicoManutencao?.id) 
        ?
        <div className="columns">
          <AutoCompleteGenerico
            id="ordemServicoSelecionado"
            name="ordemServicoSelecionado"
            label="Ordem Serviço Manutenção: *"
            value={
              ordemServicoSelecionado
                ? `${ordemServicoSelecionado.numero} - ${ordemServicoSelecionado.cliente?.id} - ${ordemServicoSelecionado.cliente?.nome}`
                : ''
            } // Usa o valor formatado corretamente
            onSearch={(query) => {
              const trimmedQuery = query.trim();
                return handleSearchOrdemServMnt(trimmedQuery); // 🔹 Retorna a Promise
            }}
            onSelect={(item) => handleSelectOrdem(item)}
            formatResult={(item) => `${item.numero} - ${item.idCliente} - ${item.nomeCliente} - ${formatDateToBackend(item?.dataSolicitacaoManutencao || '')}`}
            placeholder="Digite"
            erro={
              formik.values.ordemServicoManutencao?.numero === '' ||
              formik.values.ordemServicoManutencao?.numero === null ||
              formik.values.ordemServicoManutencao?.numero === undefined
                ? 'Campo Obrigatório'
                : ''
            }
            disabled={!podeCadastrar || pedidoCancelada}
          />
        </div>
        :
        undefined
      }

      {/* Modal de confirmação */}
      {showModal && (
        <div className="modal is-active">
            <div className="modal-background"></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Atenção</p>
                    <button
                        type='button'
                        disabled={!podeCadastrar || pedidoCancelada}
                        className="delete"
                        aria-label="close"
                        onClick={() => setShowModal(false)}
                    ></button>
                </header>
                <section className="modal-card-body">
                    <p>
                        Se você alterar de{' '}
                        {tela  === 'FICHAORCAMENTO' || setaTela === 'FICHAORCAMENTO' ? 
                          'Ficha Orçamento para Ordem Serviço Manutenção' : 'Ordem Serviço Manutenção para Ficha Orçamento'}, 
                        os dados preenchidos serão apagados. Deseja continuar?
                    </p>
                </section>
                <footer className="modal-card-foot">
                    <button
                        className="button is-danger"
                        onClick={() => aplicarTipoTela(nextTipoTela!)}
                        type='button'
                        disabled={!podeCadastrar || pedidoCancelada}
                    >
                        Sim
                    </button>
                    <button
                        className="button"
                        type='button'
                        disabled={!podeCadastrar || pedidoCancelada}
                        onClick={() => setShowModal(false)}
                    >
                        Não
                    </button>
                </footer>
            </div>
        </div>
      )}

      <div className="columns">
        {formik.values.identificador && (
            <Input
                id="identificador"
                name="identificador"
                label="Número: "
                value={formik.values.identificador || ''}
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

      <div className="columns">
          <Input
              id="nomeCliente"
              name='nomeCliente'
              label="Nome: "
              value={formik.values.fichaOrcamento?.cliente?.nome || formik.values.ordemServicoManutencao?.cliente?.nome || cliente?.nome || ''}
              columnClasses="column is-half"
              disabled
          />
          <Input
              id="dataPedido"
              label="Data do Pedido: "
              value={formik.values.dataPedido || ''}
              columnClasses="column is-half"
              onChange={formik.handleChange}
              placeholder="Digite a Data do Pedido"
              autoComplete="off"
              type='date'
              erro={formik.errors.dataPedido}
              disabled={!podeCadastrar || pedidoCancelada}
          />
      </div>
      <div className="columns">
          <Input
              id="enderecoCliente"
              name='enderecoCliente'
              label="Endereço: "
              value={formik.values.fichaOrcamento?.enderecoCliente || formik.values.ordemServicoManutencao?.enderecoCliente || enderecoCliente || ''}
              columnClasses="column is-full"
              disabled
          />
      </div>

      <div className="columns">
          <Input
              id="cpfCnpjCliente"
              name='cpfCnpjCliente'
              label="CPF / CNPJ: "
              value={
                formik.values.fichaOrcamento?.cliente?.cnpj || formik.values.fichaOrcamento?.cliente?.cpf || cliente?.cnpj || cliente?.cpf ||
                formik.values.ordemServicoManutencao?.cliente?.cnpj || formik.values.ordemServicoManutencao?.cliente?.cpf || ''}
              columnClasses="column is-half"
              disabled
          />
          <Input
              id="telefoneCliente"
              name='telefoneCliente'
              label="Telefone: "
              value={formik.values.fichaOrcamento?.telefoneCliente || formik.values.ordemServicoManutencao?.telefoneCliente || telefoneCliente || ''}
              columnClasses="column is-half"
              disabled
          />
      </div>

      <div className="columns">
        <AutoCompleteGenerico
          id="vendedor"
          name="vendedor"
          label="Vendedor:"
          value={
            vendedorSelecionado
              ? `${vendedorSelecionado.id} - ${vendedorSelecionado.nome}`
              : ''
          } // Usa o valor formatado corretamente
          onSearch={(query) => {
            const trimmedQuery = query.trim();
            return handleSearchVendedor(trimmedQuery);
          }}
          onSelect={(item) => handleSelectVendedor(item)}
          formatResult={(item) => `${item.id} - ${item.nome}`}
          placeholder="Digite o nome do Vendedor"
          disabled={!podeCadastrar || pedidoCancelada}
          erro={erroBuscarVendedor !== '' ? erroBuscarVendedor : ''}
        />
      </div>

      {/* Tabela Editável */}
      <div className="columns">
          <div className="column is-full">
          <table className="table is-bordered is-striped is-hoverable is-fullwidth">
              <thead>
              <tr>
                  <th>Descrição</th>
                  <th>Quantidade</th>
                  <th>Valor Unitário R$</th>
                  <th>Valor Total R$</th>
                  <th>
                  <button
                      type="button"
                      className="button is-small is-success"
                      onClick={adicionarProduto}
                      disabled={!podeCadastrar || pedidoCancelada}
                  >
                      +
                  </button>
                  </th>
              </tr>
              </thead>
              <tbody>
                {(formik.values.produtosPedido || []).map((produto, index) => (
                  <tr key={produto.tempId || produto.id}>
                    <td>
                      <AutoCompleteInput
                        id={`descricao-${index}`}
                        name={`descricao-${index}`}
                        disabled={!podeCadastrar || pedidoCancelada}
                        value={produto.descricao || ''}
                        onSearch={async (query) => {
                          const trimmedQuery = query.trim();
                          return handleSearchProduto(trimmedQuery);
                        }}
                        onSelect={(item) => {
                          atualizarDescricaoProduto(index, item.descricao || "");
                        }}
                        formatResult={(item) => `${item.id} - ${item.descricao}`}
                        placeholder="Digite a Descrição do Produto"
                        erro={produto?.descricao === "" ? campoObrigatorio : ""}
                      />
                    </td>
                    <td style={{ width: "15%" }}>
                      <input
                        type="number"
                        name="quantidade"
                        id="quantidade"
                        className="input"
                        disabled={!podeCadastrar || pedidoCancelada}
                        value={produto.quantidade || ""}
                        onChange={(e) =>
                          atualizarProduto(produto.tempId || produto.id || "", "quantidade", Number(e.target.value))
                        }
                      />
                    </td>
                    <td style={{ width: "15%" }}>
                      <input
                        type="text"
                        className="input"
                        step="0.01"
                        value={produto.vlrUnitario ? formatCurrency(produto.vlrUnitario) : ""}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
                          const formattedValue = Number(rawValue) / 100; // Ajusta para decimal
                          atualizarProduto(produto.tempId || produto.id || "", "vlrUnitario", formattedValue);
                        }}
                        disabled={!podeCadastrar || pedidoCancelada}
                      />
                    </td>
                    <td style={{ width: "20%" }}>
                      <input
                        type="text"
                        className="input"
                        name="vlrTotal"
                        id="vlrTotal"
                        disabled
                        readOnly
                        value={formatCurrency(produto.vlrTotal || 0)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button is-small is-danger"
                        onClick={() => removerProduto(produto)}
                        disabled={!podeCadastrar || pedidoCancelada}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                  <tr>
                  <td colSpan={3} className="has-text-right">
                      <strong>Total:</strong>
                  </td>
                  <td>
                      <input
                      type="text"
                      className="input"
                      id='total'
                      name='total'
                      readOnly
                      disabled
                      value={
                        formatCurrency(
                          (formik.values.produtosPedido ?? []).reduce((acc, produto) => acc + (produto.vlrTotal ?? 0), 0) || 0
                        )
                      }
                      
                      onChange={formik.handleChange}
                      />
                  </td>
                  <td></td>
                  </tr>
              </tfoot>
          </table>
          </div>
      </div>

      <div className="columns">
          <div className="column is-full">
          <div className="field">
              <label htmlFor="formaDePagamento" className="label">
              Forma de Pagamento: *
              </label>
              <textarea
                  className="textarea"
                  id='formaDePagamento'
                  name="formaDePagamento"
                  value={formik.values.formaDePagamento || ''}
                  placeholder="Digite a Forma de Pagamento"
                  onChange={formik.handleChange}
                  disabled={!podeCadastrar || pedidoCancelada}
              ></textarea>
              {formik.errors.formaDePagamento && (
              <p className="help is-danger">{formik.errors.formaDePagamento}</p>
              )}
          </div>
          </div>
      </div>

      {/* Botão de Toggle para Informações de Rastreamento */}
      <ButtonType 
        label={isTrackingInfoVisible ? 'Ocultar Informações de Rastreamento' : 'Exibir Informações de Rastreamento'}
        type="button"
        className='button is-link is-light'
        onClick={toggleTrackingInfo}
        style={{ marginBottom: '1rem' }}
      />

      {/* Informações de Rastreamento */}
      {isTrackingInfoVisible && (
        <div className="box">
          <div className="is-flex is-align-items-center">
            <h3 className="title is-5" style={{ marginRight: '15px' }}>Informações de Rastreamento</h3>
            {formik.values?.id &&
              <ButtonType 
                label={
                  <>
                    <i className="pi pi-file-pdf" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i>
                    Imprimir
                  </>
                }
                type="button"
                className='button'
                disabled={!relatorioInformacaoComplementar.podeConsultar || pedidoCancelada}
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  transition: 'background 0.3s' 
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#ff3860'} 
                onMouseOut={(e) => e.currentTarget.style.background = ''}  
                onClick={() => imprimirPedido(formik.values.id || pedidoOrcamento.id || '', 'informacoesRastreamento')}
              />
            }
          </div>
          <br/>
          <div className="columns">
            <AutoCompleteGenerico
              id="responsavelPedido"
              name="responsavelPedido"
              label="Res. Pedido:"
              value={
                responsavelPedidoSelecionado
                  ? `${responsavelPedidoSelecionado.id} - ${responsavelPedidoSelecionado.nome}`
                  : ''
              } // Usa o valor formatado corretamente
              onSearch={(query) => {
                const trimmedQuery = query.trim();
                return handleSearchResponsavelPedido(trimmedQuery);
              }}
              onSelect={(item) => handleSelectResponsavelPedido(item)}
              formatResult={(item) => `${item.id} - ${item.nome}`}
              placeholder="Digite o nome do Responsável pelo Pedido"
              disabled={!podeCadastrar || pedidoCancelada}
              erro={erroBuscarResponsavel !== '' ? erroBuscarResponsavel : ''}
            />
            <AutoCompleteGenerico
              id="responsavelMedida"
              name="responsavelMedida"
              label="Res. Medida:"
              value={
                responsavelMedidaSelecionado
                  ? `${responsavelMedidaSelecionado.id} - ${responsavelMedidaSelecionado.nome}`
                  : ''
              } // Usa o valor formatado corretamente
              onSearch={(query) => {
                const trimmedQuery = query.trim();
                return handleSearchResponsavelMedida(trimmedQuery);
              }}
              onSelect={(item) => handleSelectResponsavelMedida(item)}
              formatResult={(item) => `${item.id} - ${item.nome}`}
              placeholder="Digite o nome do Responsável pela Medida"
              disabled={!podeCadastrar || pedidoCancelada}
              erro={erroBuscarResponsavelMedida !== '' ? erroBuscarResponsavelMedida : ''}
            />
            <AutoCompleteGenerico
              id="fornecedorSelecionado"
              name="fornecedorSelecionado"
              label="Fornecedor:"
              value={
                fornecedorSelecionado
                  ? `${fornecedorSelecionado.id} - ${fornecedorSelecionado.nome}`
                  : ''
              } // Usa o valor formatado corretamente
              onSearch={(query) => {
                const trimmedQuery = query.trim();
                return handleSearchFornecedor(trimmedQuery);
              }}
              onSelect={(item) => handleSelectFornecedor(item)}
              formatResult={(item) => `${item.id} - ${item.nome}`}
              placeholder="Digite o nome do Fornecedor"
              disabled={!podeCadastrar || pedidoCancelada}
              erro={erroBuscarFornecedor !== '' ? erroBuscarFornecedor : ''}
            />
          </div>

          <div className="columns">
              <Input
                  id="disServico"
                  label="Dis. Serviço: *"
                  value={formik.values.disServico || ''}
                  columnClasses="column is-full"
                  onChange={formik.handleChange}
                  placeholder="Digite o Orçamento"
                  autoComplete="off"
                  disabled={!podeCadastrar || pedidoCancelada}
              />
          </div>

          {/* Informações Complementres */}
          <div className="field">
            <label htmlFor="infoComplementar" className="label">
              Informações Complementares:
            </label>
            <textarea
              className="textarea"
              id="infoComplementar"
              name="infoComplementar"
              value={formik.values.infoComplementar || ''}
              placeholder="Digite Informações Complementares"
              onChange={formik.handleChange}
              disabled={!podeCadastrar || pedidoCancelada}
            ></textarea>
            {formik.errors.infoComplementar && (
              <p className="help is-danger">{formik.errors.infoComplementar}</p>
            )}
          </div>

          {/* Data e Teve Retorno */}
          <div className="columns">
            <div className="column is-one-fifth">
              <div className="field">
                <label htmlFor="dataPosVenda" className="label">
                  Pós-Venda:
                </label>
                <input
                  type="date"
                  id="dataPosVenda"
                  name="dataPosVenda"
                  className="input"
                  value={formik.values.dataPosVenda || ''}
                  onChange={formik.handleChange}
                  disabled={!podeCadastrar || pedidoCancelada}
                />
              </div>
            </div>
            <div className="column is-one-fifth">
              <div className="field">
                <label htmlFor="retorno" className="label">
                  Teve Retorno:
                </label>
                <div className="control">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      id="retorno"
                      name="retorno"
                      checked={formik.values.retorno === 'Sim'}
                        onChange={(e) =>
                            formik.setFieldValue(
                                'retorno',
                                e.target.checked ? 'Sim' : 'Não'
                            )
                        }
                      disabled={!podeCadastrar || pedidoCancelada}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="column is-one-third">
              <div className="field">
                <label htmlFor="satisfacaoCheck" className="label">
                  Satisfação:
                </label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      id="satisfacaoCheck"
                      name="satisfacaoCheck"
                      value={formik.values.satisfacaoCheck || ''}
                      onChange={formik.handleChange}
                      disabled={!podeCadastrar || pedidoCancelada}
                    >
                      <option value="">Selecione uma opção</option>
                      <option value="Muito Satisfeito">Muito Satisfeito</option>
                      <option value="Satisfeito">Satisfeito</option>
                      <option value="Regular">Regular</option>
                      <option value="Insatisfeito">Insatisfeito</option>
                    </select>
                  </div>
                </div>
                {formik.errors.satisfacaoCheck && (
                  <p className="help is-danger">{formik.errors.satisfacaoCheck}</p>
                )}
              </div>
            </div>
          </div>
          {/* Satisfação do Cliente */}
          <div className="field">
            <label htmlFor="satisfacaoCliente" className="label">
              Satisfação do Cliente:
            </label>
            <textarea
              className="textarea"
              id="satisfacaoCliente"
              name="satisfacaoCliente"
              value={formik.values.satisfacaoCliente || ''}
              placeholder="Digite a Satisfação do Cliente"
              onChange={formik.handleChange}
              disabled={!podeCadastrar || pedidoCancelada}
            ></textarea>
            {formik.errors.satisfacaoCliente && (
              <p className="help is-danger">{formik.errors.satisfacaoCliente}</p>
            )}
          </div>
        </div>
      )}

      <div className="field is-grouped">
        <ButtonType 
          label={formik.values.id ? 'Atualizar' : 'Salvar'}
          className='button is-link'
          type="submit"
          style={{ padding: '10px 20px', fontSize: '1rem' }}
          disabled={
            !podeCadastrar ||
            !formik.dirty ||
            !formik.isValid ||
            ((tela === "FICHAORCAMENTO" || setaTela === "FICHAORCAMENTO") && !fichaSelecionada) ||
            ((tela === "ORDEMSERVMNT" || setaTela === "ORDEMSERVMNT") && !ordemServicoSelecionado) ||
            (!fichaSelecionada && !ordemServicoSelecionado)
          }
        />
        <ButtonType 
          label={'Voltar'}
          type="button"
          className='button'
          style={{ padding: '10px 20px', fontSize: '1rem' }}
          onClick={() => router.push('/consultas/pedidoOrcamento')}
        />
        {formik.values?.id &&
          <>
            <ButtonType 
                label={"Realizar Manutenção"}
                type="button"
                className='button'
                style={{ padding: '10px 20px', fontSize: '1rem' }}
                onClick={irParaOrdemServicoManutencao}
                disabled={!podeCadastrar || !pedidoEncerrada}
            />
            <ButtonType 
              label={
                <>
                  <i className="pi pi-file-pdf" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i>
                  Imprimir
                </>
              }
              className='button'
              type="button"
              disabled={!relatorio.podeConsultar || pedidoCancelada}
              style={{ 
                padding: '10px 20px', 
                fontSize: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                transition: 'background 0.3s' 
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#ff3860'} 
              onMouseOut={(e) => e.currentTarget.style.background = ''}  
              onClick={() => imprimirPedido(formik.values.id || pedidoOrcamento.id || '', 'pedidoOrcamento')}
            />
          </>
        }
      </div>

    </form>
  );
};
