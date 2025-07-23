import React, { useState, useMemo } from 'react';
import { DashVendas, DashProdutoVendas } from '../../../app/models/dashVendas';
import { useDashVendasService } from '../../../app/services/dash.service';
import { Layout } from "../../../components/layout";

const statusList = [
  { key: 'Aberta', label: 'Abertos', color: 'green', badgeBg: '#23d160', cardBg: 'has-background-info-light', titleColor: 'has-text-info' },
  { key: 'Em-Andamento', label: 'Em Andamento', color: 'yellow', badgeBg: '#ffdd57', cardBg: 'has-background-warning-light', titleColor: 'has-text-warning-dark' },
  { key: 'Encerrada', label: 'Encerrados', color: 'black', badgeBg: '#222', cardBg: 'has-background-success-light', titleColor: 'has-text-success-dark' },
  { key: 'Cancelada', label: 'Cancelados', color: 'red', badgeBg: '#ff3860', cardBg: 'has-background-danger-light', titleColor: 'has-text-danger' },
  { key: 'Aguardando-Resposta', label: 'Aguardando Resposta', color: 'orange', badgeBg: '#ff9900', cardBg: 'has-background-grey-lighter', titleColor: 'has-text-grey-dark' },
];
import { PieChart, Pie, Cell, Tooltip, Legend,ResponsiveContainer, } from 'recharts';

const DashboardVendas = () => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [dashVendas, setDashVendas] = useState<DashVendas[]>([]);
  const [produtosVendas, setProdutosVendas] = useState<DashProdutoVendas[]>([]);
  const [loading, setLoading] = useState(false);
  const { carregarDashVendas, carregarDashVendasProduto } = useDashVendasService();
  const [statusSelecionados, setStatusSelecionados] = useState<string[]>(statusList.map(s => s.key));
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'categorias'>('geral');
  //const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  //const [ordem, setOrdem] = useState<'asc' | 'desc'>('desc');
  //const [colunaOrdenada, setColunaOrdenada] = useState<'nome' | 'categoria' | 'qtde' | 'vendido'>('qtde');
  // const [statusRankingSelecionados, setStatusRankingSelecionados] = useState<string[]>(statusList.map(s => s.key));
  const [ordemPorStatus, setOrdemPorStatus] = useState<Record<string, 'asc' | 'desc'>>({});
  const [colunaOrdenadaPorStatus, setColunaOrdenadaPorStatus] = useState<Record<string, 'nome' | 'categoria' | 'qtde' | 'vendido'>>({});
  const [statusVisiveis, setStatusVisiveis] = useState<Record<string, boolean>>(
    () => Object.fromEntries(statusList.map(s => [s.key, true]))
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFE', '#FF6F91', '#FFB347', '#B0E57C', '#FF7F50', '#B39DDB'];
  
  const buscarPeriodo = async () => {
    if (!dataInicio || !dataFim) {
      alert('Por favor, selecione as datas de início e fim');
      return;
    }
    setLoading(true);
    try {
      const [resVendas, resProdutos] = await Promise.all([
        carregarDashVendas(new Date(dataInicio), new Date(dataFim)),
        carregarDashVendasProduto(new Date(dataInicio), new Date(dataFim))
      ]);
      setDashVendas(resVendas.data || []);
      setProdutosVendas(resProdutos.data || []);
      console.log('produtosVendas:', produtosVendas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const categoriasDataPorStatus = useMemo(() => {
  // { [status]: Array<{ name, totalQtde, ... }> }
  const result: Record<string, { name: string; totalQtde: number; totalVendido: number; vezesVendido: number }[]> = {};

  statusList.forEach(({ key }) => {
    // IDs dos pedidos desse status
    const pedidosIds = dashVendas.filter(p => p.pedStatus === key).map(p => String(p.pedId));
    // Produtos desses pedidos
    const produtosDoStatus = produtosVendas.filter(prod =>
      prod.idPedidos &&
      prod.idPedidos.split(',').some(id => pedidosIds.includes(id.trim()))
    );
    // Agrupa por categoria
    const catMap: Record<string, { totalQtde: number; totalVendido: number; vezesVendido: number }> = {};
      produtosDoStatus.forEach(prod => {
        const cat = prod.categoria || 'Sem Categoria';
        if (!catMap[cat]) catMap[cat] = { totalQtde: 0, totalVendido: 0, vezesVendido: 0 };
        catMap[cat].totalQtde += prod.totalQtde || 0;
        catMap[cat].totalVendido += prod.totalVendido || 0;
        catMap[cat].vezesVendido += 1;
      });
      result[key] = Object.entries(catMap).map(([name, info]) => ({
        name,
        ...info
      }));
    });

    return result;
  }, [dashVendas, produtosVendas]);

  // Agrupa pedidos por status
  const pedidosAgrupados = useMemo(() => {
    return dashVendas.reduce((acc: Record<string, DashVendas[]>, pedido) => {
      const status = pedido.pedStatus || 'sem-status';
      if (!acc[status]) acc[status] = [];
      acc[status].push(pedido);
      return acc;
    }, {} as Record<string, DashVendas[]>);
  }, [dashVendas]);

  // Calcula estatísticas por status
  const calcularEstatisticas = (status: string) => {
    const pedidos = dashVendas.filter(p => p.pedStatus === status);
    const qtde = pedidos.length;
    const total = pedidos.reduce((sum, p) => sum + (p.pedTotal || 0), 0);
    return { qtde, total };
  };

  const formatarMoeda = (valor: number | string) => {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num || 0);
  };

  const formatarData = (data: string | null | undefined) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  // Função para pegar produtos/categorias de um pedido
  const getCategoriasProdutosPorPedido = (pedido: DashVendas) => {
    // Alguns DashProdutoVendas vêm com idPedidos como string separada por vírgula
    const produtosDoPedido = produtosVendas.filter(prod => {
      if (!prod.idPedidos) return false;
      return prod.idPedidos.split(',').map(s => s.trim()).includes(String(pedido.pedId));
    });
    // Agrupa por categoria
    const categorias: Record<string, DashProdutoVendas[]> = {};
    produtosDoPedido.forEach(prod => {
      const cat = prod.categoria || 'Sem Categoria';
      if (!categorias[cat]) categorias[cat] = [];
      categorias[cat].push(prod);
    });
    // Ordena categorias por quantidade de produtos
    const categoriasOrdenadas = Object.entries(categorias).sort((a, b) => b[1].length - a[1].length);
    return categoriasOrdenadas;
  };

  // Filtra status que realmente existem nos dados retornados
  const statusPresentes = statusList.filter(
    ({ key }) => pedidosAgrupados[key]?.length && statusSelecionados.includes(key)
  );

  // Agrupa produtos por categoria para a aba de categorias
  // const categoriasAgrupadas = useMemo(() => {
  // const catMap: Record<string, {
  //   vezesVendido: number;
  //   totalQtde: number;
  //   totalVendido: number;
  //   produtos: Record<string, { nome: string; qtde: number; vendido: number; vezesVendido: number; }>
  // }> = {};

  // // Para contar em quantos pedidos diferentes cada categoria aparece
  // const pedidosPorCategoria: Record<string, Set<number | string>> = {};

  // produtosVendas.forEach(prod => {
  //   const cat = prod.categoria || 'Sem Categoria';
  //   if (!catMap[cat]) catMap[cat] = { vezesVendido: 0, totalQtde: 0, totalVendido: 0, produtos: {} };
  //   catMap[cat].totalQtde += prod.totalQtde || 0;
  //   catMap[cat].totalVendido += prod.totalVendido || 0;

  //   // Agrupamento de produtos
  //   const nomeProduto = prod.produto || 'Sem Nome';
  //   if (!catMap[cat].produtos[nomeProduto]) catMap[cat].produtos[nomeProduto] = { nome: nomeProduto, qtde: 0, vendido: 0, vezesVendido: 0 };
  //   catMap[cat].produtos[nomeProduto].qtde += prod.totalQtde || 0;
  //   catMap[cat].produtos[nomeProduto].vendido += prod.totalVendido || 0;

  //   // Cálculo de vezesVendido por categoria
  //   if (!pedidosPorCategoria[cat]) pedidosPorCategoria[cat] = new Set();
  //   if (prod.idPedidos) {
  //     prod.idPedidos.split(',').forEach(id => pedidosPorCategoria[cat].add(id.trim()));
  //   }
  // });

  // // Agora, para cada categoria, setar vezesVendido como o número de pedidos únicos
  // Object.keys(catMap).forEach(cat => {
  //     catMap[cat].vezesVendido = pedidosPorCategoria[cat]?.size || 0;
  //   });

  //   return catMap;
  // }, [produtosVendas]);

  // Dados para gráficos
  // const categoriasData = useMemo(() =>
  //   Object.entries(categoriasAgrupadas).map(([cat, info]) => ({
  //     name: cat,
  //     vezesVendido: info.vezesVendido,
  //     totalQtde: info.totalQtde,
  //     totalVendido: info.totalVendido,
  //   })),
  //   [categoriasAgrupadas]
  // );

  // Produtos mais vendidos (ranking)
  // const produtosRanking = useMemo(() => {
  //   const arr: { nome: string; qtde: number; vendido: number; categoria: string }[] = [];
  //   Object.entries(categoriasAgrupadas).forEach(([cat, info]) => {
  //     Object.values(info.produtos).forEach(prod => {
  //       arr.push({ nome: prod.nome, qtde: prod.qtde, vendido: prod.vendido, categoria: cat });
  //     });
  //   });
  //   return arr.sort((a, b) => b.qtde - a.qtde); // <-- sem slice!
  // }, [categoriasAgrupadas]);

  const produtosRankingPorStatus = useMemo(() => {
  // Cria um objeto: { [status]: Produto[] }
    const ranking: Record<string, { nome: string; qtde: number; vendido: number; categoria: string }[]> = {};

    statusList.forEach(({ key }) => {
      // Filtra pedidos desse status
      const pedidosIds = dashVendas.filter(p => p.pedStatus === key).map(p => String(p.pedId));
      // Filtra produtos que pertencem a esses pedidos
      const produtosDoStatus: Record<string, { nome: string; qtde: number; vendido: number; categoria: string }> = {};
      produtosVendas.forEach(prod => {
        if (!prod.idPedidos) return;
        const ids = prod.idPedidos.split(',').map(s => s.trim());
        if (ids.some(id => pedidosIds.includes(id))) {
          const nome = prod.produto || 'Sem Nome';
          const categoria = prod.categoria || 'Sem Categoria';
          if (!produtosDoStatus[nome]) {
            produtosDoStatus[nome] = { nome, qtde: 0, vendido: 0, categoria };
          }
          produtosDoStatus[nome].qtde += prod.totalQtde || 0;
          produtosDoStatus[nome].vendido += prod.totalVendido || 0;
        }
      });
      // Ordena por quantidade
      ranking[key] = Object.values(produtosDoStatus).sort((a, b) => b.qtde - a.qtde);
    });

  return ranking;
  }, [dashVendas, produtosVendas]);

  // Produtos de uma categoria específica
  // const produtosDaCategoria = useMemo(() => {
  //   if (!categoriaSelecionada || !categoriasAgrupadas[categoriaSelecionada]) return [];
  //   return Object.values(categoriasAgrupadas[categoriaSelecionada].produtos);
  // }, [categoriaSelecionada, categoriasAgrupadas])

  // const handleOrdenar = (col: 'nome' | 'categoria' | 'qtde' | 'vendido') => {
  //   if (colunaOrdenada === col) {
  //     setOrdem(ordem === 'asc' ? 'desc' : 'asc');
  //   } else {
  //     setColunaOrdenada(col);
  //     setOrdem('desc');
  //   }
  // };

  // const produtosParaTabela = useMemo(() => {
  //   const arr = categoriaSelecionada
  //     ? produtosDaCategoria
  //     : produtosRanking;
  //   return [...arr].sort((a, b) => {
  //     // Ordenação por nome
  //     if (colunaOrdenada === 'nome') {
  //       return ordem === 'asc'
  //         ? a.nome.localeCompare(b.nome)
  //         : b.nome.localeCompare(a.nome);
  //     }
  //     // Ordenação por categoria
  //     if (colunaOrdenada === 'categoria') {
  //       // Só produtosRanking tem categoria, então trate o caso
  //       const catA = 'categoria' in a ? a.categoria : categoriaSelecionada || '';
  //       const catB = 'categoria' in b ? b.categoria : categoriaSelecionada || '';
  //       return ordem === 'asc'
  //         ? catA.localeCompare(catB)
  //         : catB.localeCompare(catA);
  //     }
  //     // Ordenação por quantidade
  //     if (colunaOrdenada === 'qtde') {
  //       return ordem === 'asc'
  //         ? a.qtde - b.qtde
  //         : b.qtde - a.qtde;
  //     }
  //     // Ordenação por vendido
  //     if (colunaOrdenada === 'vendido') {
  //       return ordem === 'asc'
  //         ? a.vendido - b.vendido
  //         : b.vendido - a.vendido;
  //     }
  //     return 0;
  //   });
  // }, [categoriaSelecionada, produtosDaCategoria, produtosRanking, colunaOrdenada, ordem]);

  const ordenarProdutos = (
    produtos: { nome: string; qtde: number; vendido: number; categoria: string }[],
    coluna: 'nome' | 'categoria' | 'qtde' | 'vendido',
    ordem: 'asc' | 'desc'
  ) => {
    return [...produtos].sort((a, b) => {
      if (coluna === 'nome') {
        return ordem === 'asc' ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome);
      }
      if (coluna === 'categoria') {
        return ordem === 'asc' ? a.categoria.localeCompare(b.categoria) : b.categoria.localeCompare(a.categoria);
      }
      if (coluna === 'qtde') {
        return ordem === 'asc' ? a.qtde - b.qtde : b.qtde - a.qtde;
      }
      if (coluna === 'vendido') {
        return ordem === 'asc' ? a.vendido - b.vendido : b.vendido - a.vendido;
      }
      return 0;
    });
  };

  return (
    <Layout titulo="Dashboard">
      <div className="container mt-4">
        <h1 className="title is-3 has-text-centered">Dashboard de Vendas</h1>
        {/* Filtros de Data */}
        <div className="box">
          <div className="field is-grouped">
            <div className="control">
              <label className="label">Data Início</label>
              <input
                className="input"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="control">
              <label className="label">Data Fim</label>
              <input
                className="input"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div className="control">
              <label className="label">&nbsp;</label>
              <button
                className={`button is-primary ${loading ? 'is-loading' : ''}`}
                onClick={buscarPeriodo}
                disabled={loading}
              >
                Buscar Período
              </button>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="tabs is-boxed mb-4">
          <ul>
            <li className={abaAtiva === 'geral' ? 'is-active' : ''} onClick={() => setAbaAtiva('geral')}>
              <a>Geral</a>
            </li>
            <li className={abaAtiva === 'categorias' ? 'is-active' : ''} onClick={() => setAbaAtiva('categorias')}>
              <a>Categorias/Produtos</a>
            </li>
          </ul>
        </div>

        {/* Conteúdo das Abas */}
        {abaAtiva === 'geral' && (
          <>
            {loading && (
              <div className="has-text-centered my-6">
                <div className="is-size-4">
                  <i className="fas fa-spinner fa-spin"></i> Carregando dados...
                </div>
              </div>
            )}
            {!loading && dashVendas.length > 0 && (
              <>
                <div className="box mb-4">
                  <label className="label">Filtrar por Status:</label>
                  <div className="field is-grouped is-grouped-multiline">
                    {statusList.map(({ key, label }) => (
                      <div className="control" key={key}>
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={statusSelecionados.includes(key)}
                            onChange={() => {
                              setStatusSelecionados(prev =>
                                prev.includes(key)
                                  ? prev.filter(s => s !== key)
                                  : [...prev, key]
                              );
                            }}
                          />
                          <span className="ml-2">{label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {statusPresentes.map(({ key, label, cardBg, titleColor }) => {
                  const stats = calcularEstatisticas(key);
                  const pedidos = pedidosAgrupados[key] || [];
                  return (
                    <div className={`box mb-5 ${cardBg}`} key={key}>
                      <div className="mb-2">
                        <h2 className={`title is-4 ${titleColor}`}>{`Pedidos ${label}`}</h2>
                        <span className="mr-4"><strong>Qtde:</strong> {stats.qtde}</span>
                        <span><strong>Total:</strong> {formatarMoeda(stats.total)}</span>
                      </div>
                      {/* Scroll vertical para os pedidos desse status */}
                      <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: 8 }}>
  {pedidos.map((pedido) => {
    const categorias = getCategoriasProdutosPorPedido(pedido);
    return (
      <div
        className="box mb-3 p-3"
        key={pedido.pedId}
        style={{ marginBottom: 10, padding: 10 }}
      >
        <div
          className="mb-2"
          style={{
            fontSize: '1em',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap'
          }}
        >
          <strong>N: {pedido.pedIdentificador}</strong> &nbsp;|
          <span className="ml-2">Cliente: {pedido.pedCliente}</span> &nbsp;|
          <span
            className="ml-2 px-3 py-1 has-background-success has-text-white"
            style={{
              borderRadius: '16px',
              fontWeight: 600,
              display: 'inline-block',
              minWidth: 80,
              textAlign: 'center'
            }}
          >
            {formatarMoeda(pedido.pedTotal || 0)}
          </span> &nbsp;|
          <span className="ml-2">{formatarData(pedido.pedDataPedido || '')}</span>
          <button
            className="button is-info is-rounded ml-3"
            onClick={() => window.open(`/cadastros/pedidoOrcamento?id=${pedido.pedId}`, '_blank')}
            style={{ marginLeft: 16 }}
          >
            <span className="icon is-small mr-1">
              <i className="fas fa-external-link-alt"></i>
            </span>
            Visualizar
          </button>
        </div>
        {/* Categorias e produtos do pedido, scroll horizontal */}
        <div
          className="columns is-mobile is-multiline is-scrollable"
          style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}
        >
          {categorias.slice(0, 8).map(([cat, produtos]) => (
            <div className="column is-narrow" key={cat} style={{ minWidth: 180 }}>
              <div className="box has-background-light p-2" style={{ padding: 8 }}>
                <div className="has-text-weight-bold has-text-primary mb-1" style={{ fontSize: '0.98em' }}>{cat}</div>
                <ul style={{ fontSize: '0.93em' }}>
                  {produtos.slice(0, 8).map(prod => (
                    <li key={prod.produto} className="mb-1">
                      <span>{prod.produto}</span>
                      <span className="ml-2 has-text-grey is-size-7">
                        ({prod.totalQtde} un | {formatarMoeda(prod.totalVendido || 0)})
                      </span>
                    </li>
                  ))}
                  {produtos.length > 8 && (
                    <li className="has-text-grey">...mais</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
          {categorias.length === 0 && (
            <div className="column">
              <span className="has-text-grey">Nenhum produto vinculado</span>
            </div>
          )}
        </div>
      </div>
    );
  })}
</div>
                    </div>
                  );
                })}
              </>
            )}
            {!loading && dashVendas.length === 0 && dataInicio && dataFim && (
              <div className="notification is-info">
                <p>Nenhum dado encontrado para o período selecionado.</p>
              </div>
            )}
          </>
        )}

        {/* Aba de Categorias/Produtos */}
        {abaAtiva === 'categorias' && (
          <>
            {loading && (
              <div className="has-text-centered my-6">
                <div className="is-size-4">
                  <i className="fas fa-spinner fa-spin"></i> Carregando dados...
                </div>
              </div>
            )}
            {!loading && produtosVendas.length > 0 && (
              <div className="box">
                <h2 className="title is-4 has-text-primary mb-4">Categorias e Produtos</h2>

                <label className="label">Filtrar por Status:</label>
                <div className="field is-grouped is-grouped-multiline mb-3">
                  {statusList.map(({ key, label }) => (
                    <div className="control" key={key}>
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={!!statusVisiveis[key]}
                          onChange={() =>
                            setStatusVisiveis(prev => ({
                              ...prev,
                              [key]: !prev[key]
                            }))
                          }
                        />
                        <span className="ml-2">{label}</span>
                      </label>
                    </div>
                  ))}
                </div>

                {statusList.map(statusInfo => {
                  const statusKey = statusInfo.key;
                  if (!statusVisiveis[statusKey]) return null;

                  const categoriasData = categoriasDataPorStatus[statusKey] || [];
                  const produtos = produtosRankingPorStatus[statusKey] || [];
                  const coluna = colunaOrdenadaPorStatus[statusKey] || 'qtde';
                  const ordem = ordemPorStatus[statusKey] || 'desc';
                  const produtosOrdenados = ordenarProdutos(produtos, coluna, ordem);

                  const handleOrdenarStatus = (col: 'nome' | 'categoria' | 'qtde' | 'vendido') => {
                    setColunaOrdenadaPorStatus(prev => ({
                      ...prev,
                      [statusKey]: col,
                    }));
                    setOrdemPorStatus(prev => ({
                      ...prev,
                      [statusKey]: prev[statusKey] === 'asc' && coluna === col ? 'desc' : 'asc',
                    }));
                  };

                  // Só mostra se houver dados
                  if (!categoriasData.length && !produtos.length) return null;

                  return (
                    <div className="box mb-4" key={statusKey}>
                      {/* Cabeçalho estilizado */}
                      <div
                        style={{
                          background: '#222',
                          color: '#fff',
                          borderRadius: 16,
                          padding: '12px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: 16,
                          gap: 12,
                          fontWeight: 600,
                          fontSize: '1.1em'
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: 18,
                            minHeight: 18,
                            borderRadius: 12,
                            background: statusInfo.badgeBg,
                            marginRight: 10,
                            fontWeight: 700,
                            color: statusInfo.color === 'yellow' ? '#222' : '#fff',
                            padding: '2px 14px',
                            fontSize: '0.95em',
                            textAlign: 'center'
                          }}
                        >
                          {statusInfo.label}
                        </span>
                        <span>
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Gráfico de pizza */}
                      {categoriasData.length > 0 && (
                        <div className="mb-5">
                          <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                              <Pie
                                data={categoriasData}
                                dataKey="totalQtde"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
                                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                              >
                                {categoriasData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `${value} un`} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Ranking de produtos */}
                      {produtos.length > 0 && (
                        <div>
                          <div className="mb-2" style={{ fontWeight: 500, fontSize: '1.05em' }}>
                            Ranking de Produtos - {statusInfo.label}
                          </div>
                          <div style={{ overflowX: 'auto' }}>
                            <table className="table is-striped is-fullwidth">
                              <thead>
                                <tr>
                                  <th onClick={() => handleOrdenarStatus('nome')} style={{ cursor: 'pointer' }}>
                                    Produto {coluna === 'nome' && (ordem === 'asc' ? '▲' : '▼')}
                                  </th>
                                  <th onClick={() => handleOrdenarStatus('categoria')} style={{ cursor: 'pointer' }}>
                                    Categoria {coluna === 'categoria' && (ordem === 'asc' ? '▲' : '▼')}
                                  </th>
                                  <th onClick={() => handleOrdenarStatus('qtde')} style={{ cursor: 'pointer' }}>
                                    Quantidade(Material) {coluna === 'qtde' && (ordem === 'asc' ? '▲' : '▼')}
                                  </th>
                                  <th onClick={() => handleOrdenarStatus('vendido')} style={{ cursor: 'pointer' }}>
                                    Total Vendido {coluna === 'vendido' && (ordem === 'asc' ? '▲' : '▼')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {produtosOrdenados.map((prod, idx) => (
                                  <tr key={prod.nome + idx}>
                                    <td>{prod.nome}</td>
                                    <td>{prod.categoria}</td>
                                    <td>{prod.qtde}</td>
                                    <td>{formatarMoeda(prod.vendido)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {!loading && produtosVendas.length === 0 && dataInicio && dataFim && (
              <div className="notification is-info">
                <p>Nenhum dado encontrado para o período selecionado.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default DashboardVendas;