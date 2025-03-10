"use client";
import { Layout } from "../../layout";
import { Input } from "../../common";
import { useFormik } from "formik";
import { useState } from "react";
import { Fornecedores, FornecedorDto } from "../../../app/models/terceiros";
import { useTerceiroService } from "../../../app/services";
import { useRouter } from "next/navigation";
import { ButtonType } from "../../common/button";
import React from "react";
import { ModalCard } from "../../common/modal";
import TabelaDinamica, { Column } from "../../common/tabelaDinamica";
import { usePermissao } from "../../../app/hooks/usePermissoes";

interface ConsultaFornecedoresForm {
  nome?: string;
}

export const ListagemFornecedores: React.FC = () => {
  const service = useTerceiroService();
  const router = useRouter();

  const { podeCadastrar, podeConsultar } = usePermissao("Fornecedores");

  const [fornecedores, setFornecedores] = useState<FornecedorDto[]>([]); // Lista de clientes atual
  const [currentPage, setCurrentPage] = useState(0); // Página atual
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [hasMore, setHasMore] = useState(true); // Se há mais registros para carregar

  const pageSize = 10; // Tamanho da página

  //mensagem
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalTipo, setModalTipo] = useState<'success' | 'error'>('success');

  const handleSubmit = (filtro: ConsultaFornecedoresForm) => {
    setCurrentPage(0);
    setHasMore(true);
    loadData(0, pageSize, filtro); // Carrega os dados da primeira página
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange } = useFormik<ConsultaFornecedoresForm>({
    onSubmit: handleSubmit,
    initialValues: { nome: "" },
  });

  const loadData = async (page: number, size: number, filtro: ConsultaFornecedoresForm) => {
    if (loading) return; // Evita chamadas duplicadas
    setLoading(true);

    await service.findFornecedores(filtro.nome, page, size).then((result) => {
      if (result.data.content?.length > 0) {
        setFornecedores(result.data.content);
        
      }
      else {
        setFornecedores(result.data.content);
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

  const actionTemplate = (registro: Fornecedores) => {
    const url = `/cadastros/fornecedores?id=${registro.id}`;
    return (
      <ButtonType 
        label={!podeCadastrar ? "Visualizar" : "Editar"}
        type="button" 
        className="button is-info is-rounded"
        onClick={() => router.push(url)}
      />
    );
  };

  const getStatusClass = (status: string) => {
    return `status-${status.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}`;
  };

  const columns: Column[] = [
    { label: "Código", key: "id", width: "6%" },
    { label: "Nome", key: "nome", width: "47%" },
    { label: "Tipo Cliente", key: "tipoTerceiro", width: "12%" },
    { label: "CPF/CNPJ", key: "cpfcnpf", width: "15%" },
    { label: "Status", key: "status", width: "15%" },
    { label: "Ações", key: "acoes", width: "5%" }
  ];

  const data = fornecedores.map((forn) => ({
    id: forn.id || '',
    nome: forn.nome || '',
    tipoTerceiro: forn.tipoTerceiro === "4" ? "CPF" : forn.tipoTerceiro === "5" ? "CNPJ" : "Desconhecido",
    cpfcnpf: forn.cpf || forn.cnpj || "N/A",
    status: <span className={`has-text-centered ${getStatusClass(forn.status || '')}`}>{forn.status || "N/A"}</span>,
    acoes: (actionTemplate(forn)),
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
    <Layout titulo="Fornecedores">
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
            onClick={() => router.push("/cadastros/fornecedores")}
            disabled={!podeCadastrar}
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
      <br/>
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
              disabled={fornecedores.length === 0 || loading || !hasMore}
              onClick={handleNextPage}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};
