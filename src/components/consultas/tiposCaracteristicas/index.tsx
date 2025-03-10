"use client";
import { Layout } from "@/components/layout";
import { Input } from "@/components/common";
import { useFormik } from "formik";
import { useState } from "react";
import { useTipoCaracteristicaService } from "@/app/services";
import { useRouter } from "next/navigation";
import { TiposCaracteristicas } from "@/app/models/tiposCaracteristicas";
import { ModalCard } from "@/components/common/modal";
import { ButtonType } from "@/components/common/button";
import TabelaDinamica, { Column } from "@/components/common/tabelaDinamica";
import { usePermissao } from "@/app/hooks/usePermissoes";

interface ConsultaTipoCaracteristicaForm {
  nome?: string;
}

export const ListagemTiposCaracteristicas: React.FC = () => {
  const service = useTipoCaracteristicaService();
  const router = useRouter();

  const { podeCadastrar, podeConsultar } = usePermissao("Tipos Características");

  const [tipoCaracteristica, setTipoCaracteristica] = useState<TiposCaracteristicas[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalMensagem, setModalMensagem] = useState("");
  const [modalTipo, setModalTipo] = useState<"success" | "error">("success");

  const handleSubmit = (filtro: ConsultaTipoCaracteristicaForm) => {
    setCurrentPage(0);
    setHasMore(true);
    loadData(0, pageSize, filtro);
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange } = useFormik<ConsultaTipoCaracteristicaForm>({
    onSubmit: handleSubmit,
    initialValues: { nome: "" },
  });

  const loadData = async (page: number, size: number, filtro: ConsultaTipoCaracteristicaForm) => {
    if (loading) return;
    setLoading(true);
    const result = await service.tiposCaracteristicas(filtro.nome || "", "", page, size);
    
    if (result.content?.length > 0) {
      setTipoCaracteristica(result.content);
    } else {
      setTipoCaracteristica([]);
      exibirMensagem("Não tem registros para o filtro informado", "error");
    }
    setHasMore(result.content.length === size);
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
      label: "Nome", 
      key: "nome", 
      width: "60%" 
    },
    { 
      label: "Status", 
      key: "status", 
      width: "15%"
    }, 
    { label: "Ações", key: "acoes", width: "15%" }
  ];

  const data = tipoCaracteristica.map((tipCar) => ({
    id: tipCar.id || "", 
    nome: tipCar.nome || "", 
    status: <span className={`has-text-centered ${getStatusClass(tipCar.status || '')}`}>{tipCar.status || "N/A"}</span>, 
    acoes: (
      <ButtonType
        label={!podeCadastrar ? "Visualizar" : "Editar"}
        type="button"
        className="button is-info is-rounded"
        onClick={() => router.push(`/cadastros/tiposCaracteristicas?id=${tipCar.id}`)}
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
    <Layout titulo="Informações Complementares">
      <form onSubmit={formikSubmit}>
        <div className="columns">
          <Input
            label="Nome"
            id="nome"
            name="nome"
            value={filtro.nome}
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
            onClick={() => router.push("/cadastros/tiposCaracteristicas")}
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
          disabled={tipoCaracteristica.length === 0 || loading || !hasMore}
          onClick={handleNextPage}
        />
      </div>
    </Layout>
  );
};
