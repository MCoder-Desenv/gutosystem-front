"use client";
import { Layout } from "../../../components/layout";
import { Input } from "../../../components/common";
import { useFormik } from "formik";
import { useState } from "react";
import { usePedidoOrcamentoService } from "../../../app/services";
import { useRouter } from "next/navigation";
import { PedidoOrcamentoRecuperacaoDto } from "../../../app/models/pedidoOrcamento";
import { ButtonType } from "../../../components/common/button";
import { ModalCard } from "../../../components/common/modal";
import { usePermissao } from "../../../app/hooks/usePermissoes";
import { Dropdown } from "primereact/dropdown";
import { formatDateToBackend } from "../../../app/util/formatData";

interface ConsultaRecuperacaoVendaForm {
    tipoFiltro: string;
    dataInicio?: string;
    dataFim?: string;
    identificador?: string;
    nome?: string;
    telefone?: string;
}

export const RecuperacaoPedido: React.FC = () => {
    const service = usePedidoOrcamentoService();
    const router = useRouter();

    const { podeCadastrar, podeConsultar } = usePermissao("Recuperação Venda");

    const [recuperacaoVenda, setRecuperacaoVenda] = useState<PedidoOrcamentoRecuperacaoDto[]>([]); // Lista de clientes atual
    const [currentPage, setCurrentPage] = useState(0); // Página atual
    const [loading, setLoading] = useState(false); // Estado de carregamento
    const [hasMore, setHasMore] = useState(true); // Se há mais registros para carregar
    const pageSize = 100; // Tamanho da página

    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');

    const statusOptions = [
        { label: 'Aberta', value: 'Aberta', className: 'status-Aberta' },
        { label: 'Aguardando Resposta', value: 'Aguardando-Resposta', className: 'status-Aguardando-Resposta' },
        { label: 'Em Andamento', value: 'Em-Andamento', className: 'status-Em-Andamento' },
        { label: 'Encerrada', value: 'Encerrada', className: 'status-Encerrada' },
        { label: 'Cancelada', value: 'Cancelada', className: 'status-Cancelada' },
    ];

    const customHandleChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name } = event.target;

        if (name === "tipoFiltro") {
            setFieldValue("identificador", "");
            setFieldValue("dataInicio", "");
            setFieldValue("dataFim", "");
            setFieldValue("nome", "");
            setFieldValue("telefone", "");
        }

        handleChange(event);
    };

    const handleSubmit = (filtro: ConsultaRecuperacaoVendaForm) => {
        setCurrentPage(0);
        setHasMore(true);
        loadData(0, pageSize, filtro); // Carrega os dados da primeira página
    };

    const { handleSubmit: formikSubmit, values: filtro, handleChange, setFieldValue } = useFormik<ConsultaRecuperacaoVendaForm>({
        onSubmit: handleSubmit,
        initialValues: { tipoFiltro: "Data", identificador: "", nome: "", telefone: "" },
    });

    const loadData = async (page: number, size: number, filtro: ConsultaRecuperacaoVendaForm) => {
        if (loading) return; // Evita chamadas duplicadas
        setLoading(true);

        await service.findPedidosRecuperacao(filtro.identificador, filtro.nome, filtro.telefone, filtro.dataInicio, filtro.dataFim, page, size).then((result) => {
        if (result.data.content?.length > 0) {
            setRecuperacaoVenda(result.data.content);
            
        }
        else {
            setRecuperacaoVenda(result.data.content);
            exibirMensagem("Não tem registros para o filtro informado", 'error')
        }
    
        setHasMore(result.data.content.length === size); // Define se há mais registros
        setLoading(false);
        })
        .catch((error) => {
            exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
        });
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
        const previousPage = currentPage - 1;
        setCurrentPage(previousPage);
        loadData(previousPage, pageSize, filtro);
        }
    };

    const handleNextPage = () => {
        if (hasMore) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        loadData(nextPage, pageSize, filtro);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const atualizarRecuperacaoVenda = (id: string, campo: string, valor: any) => {
        setRecuperacaoVenda((prev) =>
        prev.map((recVen) =>
            recVen.id === id ? { ...recVen, [campo]: valor } : recVen
        )
        );
    };

    const actionTemplateAtualizar = (registro: PedidoOrcamentoRecuperacaoDto[]) => {
        exibirMensagem("Pedidos sendo atualizada, aguarde...", "loading");
    
        // Substituir dataRecuperacaoVenda vazia por null
        const registrosAtualizados = registro.map(item => ({
            ...item,
            dataRecuperacaoVenda: item.dataRecuperacaoVenda === "" ? null : item.dataRecuperacaoVenda
        }));
    
        service.atualizarRecuperacaoPedido(registrosAtualizados)
            .then(async () => {
                await service.findPedidosRecuperacao("", "", "", "", "", 0, pageSize)
                    .then((result) => {
                        if (result.data.content?.length > 0) {
                            setRecuperacaoVenda(result.data.content);
                            setModalVisivel(false);
                            exibirMensagem('Pedidos atualizados com sucesso!', 'success');
                        } else {
                            setRecuperacaoVenda(result.data.content);
                            setModalVisivel(false);
                            exibirMensagem('Pedidos atualizados com sucesso! Não tem pedido com o status Aguardando Resposta', 'success');
                        }
    
                        setHasMore(result.data.content.length === pageSize); // Define se há mais registros
                        setLoading(false);
                    })
                    .catch((error) => {
                        exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
                    });
            })
            .catch((error) => {
                exibirMensagem(error?.data, 'error'); // Exibindo a mensagem para o usuário
            });
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

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(`
            <html>
                <head>
                <title>Impressão de Pedidos</title>
                <style>
                    table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    }
                    th, td {
                    border: 1px solid black;
                    padding: 8px;
                    text-align: left;
                    }
                    th {
                    background-color: #f2f2f2;
                    }
                </style>
                </head>
                <body>
                <h2>Relatório de Recuperação de Venda</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Telefone</th>
                        <th>Data Pedido</th>
                        <th>Data Recuperação</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${recuperacaoVenda.map((recVen) => `
                        <tr>
                        <td>${recVen.nomeCliente ?? ''}</td>
                        <td>${recVen.telefoneCliente ?? ''}</td>
                        <td>${formatDateToBackend(recVen.dataPedido ?? '') ?? ''}</td>
                        <td>${formatDateToBackend(recVen.dataRecuperacaoVenda ?? '') ?? ''}</td>
                        <td>${recVen.status ?? ''}</td>
                        </tr>
                    `).join('')}
                    </tbody>
                </table>
                </body>
            </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

  return (
    <Layout titulo="Recuperação Venda">
      <form onSubmit={formikSubmit}>
        <div className="columns">
            {/* Campo para selecionar o tipo de filtro */}
            <div className="column is-2">
                <div className="field">
                    <label className="label">Tipo de Filtro</label>
                    <div className="control">
                        <div className="select is-fullwidth">
                            <select
                            id="tipoFiltro"
                            name="tipoFiltro"
                            value={filtro.tipoFiltro}
                            autoComplete="off"
                            onChange={customHandleChange} // Substitui o handleChange padrão
                            disabled={!podeConsultar}
                            >
                            <option value="Numero">Número</option>
                            <option value="Nome">Cliente</option>
                            <option value="Data">Data (Pedido)</option>
                            <option value="Telefone">Celular</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campo para o valor do filtro */}
            {filtro.tipoFiltro === 'Nome' ?
                <div className="column is-10">
                    <Input
                    label="Digite o Nome"
                    id="nome"
                    name="nome"
                    type="text"
                    value={filtro.nome}
                    autoComplete="off"
                    onChange={handleChange}
                    disabled={!podeConsultar}
                    />
                </div>
            :
            filtro.tipoFiltro === 'Numero' ?
                <div className="column is-10">
                    <Input
                    label="Digite o número"
                    id="numero"
                    name="numero"
                    type="text"
                    value={filtro.identificador}
                    autoComplete="off"
                    onChange={handleChange}
                    disabled={!podeConsultar}
                    />
                </div>
            :
            filtro.tipoFiltro === 'Telefone' ?
                <div className="column is-10">
                    <Input
                    label="Digite o Celular"
                    id="telefone"
                    name="telefone"
                    type="text"
                    value={filtro.telefone}
                    autoComplete="off"
                    onChange={handleChange}
                    disabled={!podeConsultar}
                    />
                </div>
            :
            <>
                <div className="column is-3">
                    <Input
                    label="Data Início"
                    id="dataInicio"
                    name="dataInicio"
                    type="date"
                    autoComplete="off"
                    value={filtro.dataInicio || ""}
                    onChange={handleChange}
                    disabled={!podeConsultar}
                    />
                </div>
                <div className="column is-3">
                    <Input
                    label="Data Fim"
                    id="dataFim"
                    name="dataFim"
                    type="date"
                    autoComplete="off"
                    value={filtro.dataFim || ""}
                    onChange={handleChange}
                    disabled={!podeConsultar}
                    />
               </div>  
               </> 
            }
        </div>
        <div className="field is-grouped">
          <ButtonType 
            label={"Consultar"}
            className='button is-success'
            disabled={!podeConsultar}
            type="submit"
          />
          <ButtonType 
            label={"Novo"}
            className='button is-warning'
            type="button"
            disabled={!podeCadastrar}
            onClick={() => router.push("/cadastros/categorias")}
          />
        </div>
      </form>

      {modalVisivel && (
          <ModalCard 
              mensagem={modalMensagem} 
              tipo={modalTipo} 
              tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
              onClose={() => setModalVisivel(false)}
          />
      )}
      <br />
      <div className="columns">
        <div className="column is-full">
            <div className="columns">
                <div className="column is-full">
                    <table className="table is-bordered is-striped is-hoverable is-fullwidth">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Telefone</th>
                                <th>Data Pedido</th>
                                <th>Data Recuperação</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recuperacaoVenda.map((recVen) => (
                                <tr key={recVen.id}>
                                    <td>
                                        <input
                                        type="text"
                                        className="input"
                                        value={recVen.nomeCliente ?? ''}
                                        disabled
                                        readOnly
                                        />
                                    </td>
                                    <td>
                                        <input
                                        type="text"
                                        className="input"
                                        value={recVen.telefoneCliente ?? ''}
                                        disabled
                                        readOnly
                                        />
                                    </td>
                                    <td>
                                        <input
                                        type="date"
                                        className="input"
                                        value={recVen.dataPedido ?? ''}
                                        disabled
                                        readOnly
                                        />
                                    </td>
                                    <td>
                                        <input
                                        type="date"
                                        className="input"
                                        value={recVen.dataRecuperacaoVenda ?? ''}
                                        disabled={!podeCadastrar}
                                        onChange={(e) => atualizarRecuperacaoVenda(recVen.id || '', "dataRecuperacaoVenda", e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <div className={`control dropdown-${recVen.status || 'default'}`} /* Adiciona classe dinâmica ao contêiner com um fallback */> 
                                            <Dropdown
                                                autoComplete='off'
                                                value={recVen.status}
                                                options={statusOptions}
                                                optionLabel="label"
                                                optionValue="value"
                                                onChange={(e) => atualizarRecuperacaoVenda(recVen.id || '', "status", e.value)}
                                                placeholder="Selecione o status"
                                                className="w-full custom-dropdown-height"
                                                disabled={!podeCadastrar}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                {recuperacaoVenda.length > 0 && (
                                    <td colSpan={5} className="has-text-right">
                                        <div className="field is-grouped is-justify-content-flex-end">
                                            <ButtonType 
                                                label={"Imprimir"}
                                                type="button" 
                                                className="button is-link"
                                                onClick={handlePrint}
                                            />
                                            <ButtonType 
                                                label={"Salvar"}
                                                type="button" 
                                                className="button is-primary is-rounded"
                                                onClick={() => actionTemplateAtualizar(recuperacaoVenda)}
                                            />
                                        </div>
                                    </td>
                                )}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div className="pagination">
                <ButtonType 
                    label={"<"}
                    className='button is-link'
                    type="button"
                    disabled={loading || currentPage === 0}
                    onClick={handlePreviousPage}
                />
                <ButtonType 
                    label={">"}
                    className='button is-link'
                    type="button"
                    disabled={recuperacaoVenda.length === 0 || loading || !hasMore}
                    onClick={handleNextPage}
                />
            </div>
        </div>
      </div>
    </Layout>
  );
};
