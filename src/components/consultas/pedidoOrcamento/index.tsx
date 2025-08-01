"use client";
import { Layout } from "../../layout";
import { Input } from "../../../components/common";
import { useFormik } from "formik";
import { useState } from "react";
import { usePedidoOrcamentoService, useTerceiroService } from "../../../app/services";
import { useRouter } from "next/navigation";
import { PedidoOrcamento, PedidoOrcamentoDto } from "../../../app/models/pedidoOrcamento";
import { AutoComplete } from "primereact/autocomplete";
import { ClienteFichaDto } from "../../../app/models/terceiros";
import { formatDateToBackend } from "../../../app/util/formatData";
import { ButtonType } from "../../common/button";
import { ModalCard } from "../../common/modal";
import TabelaDinamica, { Column } from "../../../components/common/tabelaDinamica";
import { usePermissao } from "../../../app/hooks/usePermissoes";

interface ConsultaPedidoOrcamentoForm {
  tipoFiltro: string;
  valorFiltro: string;
  dataInicio?: string;
  dataFim?: string;
  nomeTerceiro?: string;
}

export const ListagemPedidoOrcamento: React.FC = () => {
  const service = usePedidoOrcamentoService();
  const serviceTerceiro = useTerceiroService();
  const router = useRouter();

  const { podeCadastrar, podeConsultar } = usePermissao("Pedido Orçamento");

  const [pedidoOrcamento, setPedidoOrcamento] = useState<PedidoOrcamentoDto[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchResults, setSearchResults] = useState<ClienteFichaDto[]>([]);

  //mensagem
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalTipo, setModalTipo] = useState<'success' | 'error'>('success');
  
  const [erroCarregarCliente, setErroCarregarCliente] = useState('');

  const customHandleChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name } = event.target;

    if (name === "tipoFiltro") {
      setFieldValue("valorFiltro", "");
      setFieldValue("dataInicio", "");
      setFieldValue("dataFim", "");
      setFieldValue("nomeTerceiro", "");
    }

    handleChange(event);
  };

  const pageSize = 10;

  const handleSubmit = (filtro: ConsultaPedidoOrcamentoForm) => {
    setCurrentPage(0);
    setHasMore(true);
    loadData(0, pageSize, filtro);
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange, setFieldValue, resetForm } =
    useFormik<ConsultaPedidoOrcamentoForm>({
      onSubmit: handleSubmit,
      initialValues: { tipoFiltro: "Numero", valorFiltro: "" },
    });

  const loadData = async (page: number, size: number, filtro: ConsultaPedidoOrcamentoForm) => {
    if (loading) return;
    setLoading(true);

    // Chama a função unificada, passando as datas, se estiverem disponíveis
    const result = await service.findPedidos(
      filtro.tipoFiltro === "Numero" ? filtro.valorFiltro : '',
      filtro.tipoFiltro === "Telefone" ? filtro.valorFiltro : '',
      filtro.tipoFiltro === "Cliente" ? filtro.valorFiltro : '',
      filtro.dataInicio,
      filtro.dataFim,
      page,
      size
    );

    if (result.content?.length > 0) {
      setPedidoOrcamento(result.content);
      
    }
    else {
      setPedidoOrcamento(result.content);
      exibirMensagem("Não tem registros para o filtro informado", 'error')
    }

    setPedidoOrcamento(result.content);
    setHasMore(result.content?.length === size);
    setLoading(false);
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

  const handleSearch = async (query: string) => {
    try {
      setErroCarregarCliente('')
      const results = await serviceTerceiro.findClienteAutoComplete(query);
      setSearchResults(results.data || []);
    } catch (error) {
      setErroCarregarCliente("Erro ao buscar clientes:" + error)
    }
  };

  const validateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (filtro.tipoFiltro === "Cliente") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFieldValue("valorFiltro", numericValue);
    } else {
      setFieldValue("valorFiltro", value);
    }
  };

  const getStatusClass = (status: string) => {
    return `status-${status.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}`;
  };

  const actionTemplate = (registro: PedidoOrcamento) => {
    const url = `/cadastros/pedidoOrcamento?id=${registro.id}`;
    return (
      <ButtonType 
        label={!podeCadastrar ? "Visualizar" : "Editar"}
        type="button" 
        className="button is-info is-rounded"
        onClick={() => router.push(url)}
      />
    );
  };

  const columns: Column[] = [
    { label: "Número", key: "identificador", width: "15%"},
    { label: "Nome", key: "nomeTerceiro", width: "35%" },
    { label: "Telefone/Celular", key: "telefoneCliente", width: "15%" },
    { label: "Data Pedido", key: "dataPedido", width: "15%" },
    { label: "Status", key: "status", width: "15%" },
    { label: "Ações", key: "acoes", width: "5%" }
  ];
    
  const data = pedidoOrcamento.map((ped) => ({
    identificador: <span style={{
      fontWeight: "bold" // Borda preta para destaque
  }}> {ped.identificador || '' }</span>,
    nomeTerceiro: ped.nomeTerceiro || '',
    telefoneCliente: ped.telefoneCliente || '',
    dataPedido: ped.dataPedido ? formatDateToBackend(ped.dataPedido) : '',
    status: <span className={`has-text-centered ${getStatusClass(ped.status || '')}`}>{ped.status?.replace(/-/g, " ") || "N/A"}</span>,
    acoes: (actionTemplate(ped)),
  }));

  {pedidoOrcamento?.map((pedido) => (
    <tr key={pedido.id}>
      <td>{pedido.identificador}</td>
      <td>{pedido.nomeTerceiro}</td>
      <td>
        {pedido.dataPedido ? formatDateToBackend(pedido.dataPedido) : ''}
      </td>
      <td className={`status-${pedido.status}`} style={{textAlign:'center'}}>
        {pedido.status?.replace("-", " ")}
      </td>
      <td>{actionTemplate(pedido)}</td>
    </tr>
  ))}

  const exibirMensagem = (texto: string, tipo: 'success' | 'error') => {
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
    <Layout titulo="Pedido Orçamento">
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
                    <option value="Cliente">Cliente</option>
                    <option value="Telefone">Telefone</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Campo para o valor do filtro */}
          { filtro.tipoFiltro === 'Numero' ?
            <div className="column is-10">
              <Input
                label="Valor do Filtro"
                id="valorFiltro"
                name="valorFiltro"
                value={filtro.valorFiltro}
                autoComplete="off"
                onChange={validateInput}
                disabled={!podeConsultar}
              />
            </div>
            :
            filtro.tipoFiltro === 'Telefone' ?
            <div className="column is-10">
              <Input
                label="Valor do Filtro"
                id="valorFiltro"
                name="valorFiltro"
                value={filtro.valorFiltro}
                autoComplete="off"
                onChange={validateInput}
                disabled={!podeConsultar}
              />
            </div>
            :
            <div className="field column is-10">
                <label htmlFor="valorFiltro" className="label">
                  Valor do Filtro
                </label>
                <div className="control custom-autocomplete-height">
                <AutoComplete
                  id="valorFiltro"
                  name="valorFiltro"
                  autoComplete="off"
                  value={filtro.nomeTerceiro} // Usa o valor sincronizado do formik
                  suggestions={searchResults} // Sugestões retornadas pela busca
                  completeMethod={(e) => {
                    const query = e.query.trim(); // Captura e limpa espaços no início ou final
                    handleSearch(query); // Faz a busca
                  }}
                  field="customField" // Campo customizado que iremos construir
                  itemTemplate={(item) => (
                    <span>
                      {item.id} - {item.nome}
                    </span>
                  )}
                  onChange={(e) => {
                    const newValue = e.target.value; // Valor digitado pelo usuário
                    setFieldValue("nomeTerceiro", newValue); // Atualiza o campo nomeTerceiro
                    setFieldValue("valorFiltro", ""); // Reseta o id associado ao filtro
                  }}
                  onSelect={(e) => {
                    const selectedClient = e.value; // Objeto selecionado
                    setFieldValue("valorFiltro", selectedClient.id); // Atualiza o valorFiltro com o ID
                    setFieldValue(
                      "nomeTerceiro",
                      `${selectedClient.id} - ${selectedClient.nome}` // Atualiza nomeTerceiro com código e nome
                    );
                  }}
                  placeholder="Digite Nome do Cliente"
                  disabled={!podeConsultar}
                />
                <p/>
                {erroCarregarCliente !== '' ? <p className="help is-danger">{erroCarregarCliente}</p> : null}
                
                </div>
            </div>
          }
        </div>

        <div className="columns">
          <div className="column is-5">
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
          <div className="column is-5">
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
        </div>
        <div className="field is-grouped">
          <ButtonType 
            label={"Consultar"}
            className='button is-success'
            type='submit'
            disabled={!podeConsultar}
          />
          <ButtonType 
            label={"Novo"}
            className='button is-warning'
            type='button'
            onClick={() => router.push("/cadastros/pedidoOrcamento")}
            disabled={!podeCadastrar}
          />
          <ButtonType 
            label={"Limpar Filtros"}
            className='button is-danger'
            type='button'
            onClick={() => {
              resetForm();
            }}
            disabled={!podeConsultar}
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
          <TabelaDinamica columns={columns} data={data} className={{ table: "table is-fullwidth is-bordered is-striped is-hoverable" }} />
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
              disabled={pedidoOrcamento.length === 0 || loading || !hasMore}
              onClick={handleNextPage}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};
