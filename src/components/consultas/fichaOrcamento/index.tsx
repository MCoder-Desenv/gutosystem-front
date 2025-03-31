"use client";
import { Layout } from "../../layout";
import { Input } from "../../common/input";
import { useFormik } from "formik";
import { useState } from "react";
import { useFichaOrcamentoService } from "../../../app/services";
import { useRouter } from "next/navigation";
import { FichaOrcamento, FichaOrcamentoDto } from "../../../app/models/fichaOrcamento";
import { ButtonType } from "../../common/button";
import { ModalCard } from "../../common/modal";
import { formatDateToBackend } from "../../../app/util/formatData";
import TabelaDinamica, { Column } from "../../common/tabelaDinamica";
import { usePermissao } from "../../../app/hooks/usePermissoes";

interface ConsultaFichaOrcamentoForm {
  tipoFiltro: string;
  valorFiltro: string;
  dataInicio?: string;
  dataFim?: string;
}

export const ListagemFichaOrcamento: React.FC = () => {
  const service = useFichaOrcamentoService();
  const router = useRouter();

  const { podeCadastrar, podeConsultar } = usePermissao("Ficha de Orçamento");

  const [fichaOrcamento, setFichaOrcamento] = useState<FichaOrcamentoDto[]>([]); // Lista de clientes atual
  const [currentPage, setCurrentPage] = useState(0); // Página atual
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [hasMore, setHasMore] = useState(true); // Se há mais registros para carregar

  //mensagem
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalTipo, setModalTipo] = useState<'success' | 'error'>('success');

  const pageSize = 10; // Tamanho da página

  const handleSubmit = (filtro: ConsultaFichaOrcamentoForm) => {
    setCurrentPage(0);
    setHasMore(true);
    loadData(0, pageSize, filtro); // Carrega os dados da primeira página
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange, setFieldValue, resetForm } =
    useFormik<ConsultaFichaOrcamentoForm>({
      onSubmit: handleSubmit,
      initialValues: { tipoFiltro: "nome", valorFiltro: "" },
    });

  const loadData = async (page: number, size: number, filtro: ConsultaFichaOrcamentoForm) => {
    if (loading) return;
    setLoading(true);

    // Chama a função unificada, passando as datas, se estiverem disponíveis
    const result = await service.findFichas(
      filtro.tipoFiltro === "nome" ? filtro.valorFiltro : '',
      filtro.tipoFiltro === "telefone" ? filtro.valorFiltro : '',
      filtro.tipoFiltro === "codigo" ? filtro.valorFiltro : '',
      filtro.dataInicio,
      filtro.dataFim,
      page,
      size
    );
    if (result.content?.length > 0) {
      setFichaOrcamento(result.content);
      
    }
    else {
      setFichaOrcamento(result.content);
      exibirMensagem("Não tem registros para o filtro informado", 'error')
    }
    
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

  const validateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (filtro.tipoFiltro === "codigo") {
      // Permitir apenas números
      const numericValue = value.replace(/[^0-9]/g, "");
      setFieldValue("valorFiltro", numericValue);
    } else {
      // Permitir texto normal
      setFieldValue("valorFiltro", value);
    }
  };

  const getStatusClass = (status: string) => {
    return `status-${status.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}`;
  };

  const actionTemplate = (registro: FichaOrcamento) => {
    const url = `/cadastros/fichaOrcamento?id=${registro.id}`;
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
    { label: "Código", key: "id", width: "10%" },
    { label: "Nome", key: "nomeCliente", width: "40%" },
    { label: "Telefone", key: "telefoneCliente", width: "15%" },
    { label: "Data Solicitação", key: "dataSolicitacaoCliente", width: "15%" },
    { label: "Status", key: "status", width: "15%" },
    { label: "Ações", key: "acoes", width: "5%" }
  ];

  const data = fichaOrcamento.map((ficha) => ({
    id: ficha.id || '',
    nomeCliente: ficha.nomeCliente || '',
    telefoneCliente: ficha.telefoneCliente || '',
    dataSolicitacaoCliente: ficha.dataSolicitacaoCliente ? formatDateToBackend(ficha.dataSolicitacaoCliente) : '',
    status: <span className={`has-text-centered ${getStatusClass(ficha.status || '')}`}>{ficha.status || "N/A"}</span>,
    acoes: (actionTemplate(ficha))
  }));

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
    <Layout titulo="Ficha Orçamento">
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
                    onChange={handleChange}
                    autoComplete="off"
                    disabled={!podeConsultar}
                  >
                    <option value="nome">Nome</option>
                    <option value="telefone">Telefone</option>
                    <option value="codigo">Código</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Campo para o valor do filtro */}
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
        </div>

        <div className="columns">
          <div className="column is-5">
            <Input
              label="Data Início"
              id="dataInicio"
              autoComplete="off"
              name="dataInicio"
              type="date"
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
              autoComplete="off"
              type="date"
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
            type="submit"
            disabled={!podeConsultar}
          />
          <ButtonType 
            label={"Novo"}
            className='button is-warning'
            type="button"
            disabled={!podeCadastrar}
            onClick={() => router.push("/cadastros/fichaOrcamento")}
          />
          <ButtonType 
            label={"Limpar Filtros"}
            className='button is-danger'
            type="button"
            onClick={() => {
              resetForm();
            }}
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
              disabled={fichaOrcamento.length === 0 || loading || !hasMore}
              onClick={handleNextPage}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};
