"use client";
import { Layout } from "../../layout";
import { Input } from "../../common";
import { useFormik } from "formik";
import { useState } from "react";
import { useUnidadeMedidaService } from "../../../app/services";
import { useRouter } from "next/navigation";
import { UnidadeMedida } from "../../../app/models/unidadeMedida";
import { ModalCard } from "../../common/modal";
import { ButtonType } from "../../common/button";
import TabelaDinamica, { Column } from "../../common/tabelaDinamica";
import { usePermissao } from "../../../app/hooks/usePermissoes";

interface ConsultaUnidadeMedidaForm {
  unidade?: string;
}

export const ListagemUnidadesMedida: React.FC = () => {
  const service = useUnidadeMedidaService();
  const router = useRouter();

  const { podeCadastrar, podeConsultar } = usePermissao("Unidade Medida");

  const [unidadeMedida, setUnidadeMedida] = useState<UnidadeMedida[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalMensagem, setModalMensagem] = useState("");
  const [modalTipo, setModalTipo] = useState<"success" | "error">("success");

  const handleSubmit = (filtro: ConsultaUnidadeMedidaForm) => {
    setCurrentPage(0);
    setHasMore(true);
    loadData(0, pageSize, filtro);
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange } = useFormik<ConsultaUnidadeMedidaForm>({
    onSubmit: handleSubmit,
    initialValues: { unidade: "" },
  });

  const loadData = async (page: number, size: number, filtro: ConsultaUnidadeMedidaForm) => {
    if (loading) return;
    setLoading(true);
    const result = await service.findUnidadesMedida(filtro.unidade, "", page, size);
    
    if (result.data?.content?.length > 0) {
        setUnidadeMedida(result.data.content);
    } else {
      setUnidadeMedida([]);
      exibirMensagem("Não tem registros para o filtro informado", "error");
    }
    setHasMore(result.data.content.length === size);
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

  const getStatusClass = (status: string) => {
    return `status-${status.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}`;
  };

  const columns: Column[] = [
    { label: "Código", key: "id", width: "10%" },
    { 
      label: "Unidade", 
      key: "unidade", 
      width: "20%" 
    },
    { 
      label: "Descrição", 
      key: "descricao", 
      width: "55%" 
    },
    { 
      label: "Status", 
      key: "status", 
      width: "15%"
    }, 
    { label: "Ações", key: "acoes", width: "15%" }
  ];

  const data = unidadeMedida.map((uniMed) => ({
    id: uniMed.id || "", 
    unidade: uniMed.unidade || "",
    descricao: uniMed.descricao || "",
    status: <span className={`has-text-centered ${getStatusClass(uniMed.status || '')}`}>{uniMed.status || "N/A"}</span>, 
    acoes: (
      <ButtonType
        label={!podeCadastrar ? "Visualizar" : "Editar"}
        type="button"
        className="button is-info is-rounded"
        onClick={() => router.push(`/cadastros/unidadesMedida?id=${uniMed.id}`)}
      />
    ),
  }));

  const exibirMensagem = (texto: string, tipo: "success" | "error") => {
    setModalMensagem(texto);
    setModalTipo(tipo);
    setModalVisivel(true);
    if (tipo === "success") {
      setTimeout(() => {
        setModalVisivel(false);
      }, 1500);
    }
  };

  return (
    <Layout titulo="Unidades de Medida">
      <form onSubmit={formikSubmit}>
        <div className="columns">
          <Input
            label="Unidade"
            id="unidade"
            name="unidade"
            value={filtro.unidade}
            columnClasses="column is-full"
            autoComplete="off"
            onChange={handleChange}
            disabled={!podeConsultar}
          />
        </div>
        <div className="field is-grouped">
          <ButtonType label={"Consultar"} className="button is-success" type="submit" disabled={!podeConsultar}/>
          <ButtonType
            label={"Novo"}
            className="button is-warning"
            type="button"
            onClick={() => router.push("/cadastros/unidadesMedida")}
            disabled={!podeCadastrar}
          />
        </div>
      </form>

      {modalVisivel && (
        <ModalCard
          mensagem={modalMensagem}
          tipo={modalTipo}
          tempoAutoFechamento={modalTipo === "success" ? 1500 : 0}
          onClose={() => setModalVisivel(false)}
        />
      )}
      <br />
      <TabelaDinamica columns={columns} data={data} className={{ table: "table is-fullwidth is-bordered is-striped is-hoverable" }} />
      <br />
      <div className="pagination">
        <ButtonType
          label={"<"}
          className="button is-link"
          type="button"
          disabled={loading || currentPage === 0}
          onClick={handlePreviousPage}
        />
        <ButtonType
          label={">"}
          className="button is-link"
          type="button"
          disabled={unidadeMedida.length === 0 || loading || !hasMore}
          onClick={handleNextPage}
        />
      </div>
    </Layout>
  );
};
