"use client";
import { Layout } from "../../../components/layout";
import { Input } from "../../../components/common";
import { useFormik } from "formik";
import { useState } from "react";
import { useCategoriaService } from "../../../app/services";
import { useRouter } from "next/navigation";
import { Categoria } from "../../../app/models/categorias";
import { ButtonType } from "../../../components/common/button";
import { ModalCard } from "../../../components/common/modal";
import TabelaDinamica, { Column } from "../../../components/common/tabelaDinamica";
import { usePermissao } from "../../../app/hooks/usePermissoes";

interface ConsultaCategoriasForm {
  nome?: string;
}

export const ListagemCategorias: React.FC = () => {
  const service = useCategoriaService();
  const router = useRouter();

  const { podeCadastrar, podeConsultar } = usePermissao("Categorias");

  const [categorias, setCategorias] = useState<Categoria[]>([]); // Lista de clientes atual
  const [currentPage, setCurrentPage] = useState(0); // Página atual
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [hasMore, setHasMore] = useState(true); // Se há mais registros para carregar
  const pageSize = 20; // Tamanho da página

  //mensagem
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalTipo, setModalTipo] = useState<'success' | 'error'>('success');

  const handleSubmit = (filtro: ConsultaCategoriasForm) => {
    setCurrentPage(0);
    setHasMore(true);
    loadData(0, pageSize, filtro); // Carrega os dados da primeira página
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange } = useFormik<ConsultaCategoriasForm>({
    onSubmit: handleSubmit,
    initialValues: { nome: "" },
  });

  const loadData = async (page: number, size: number, filtro: ConsultaCategoriasForm) => {
    if (loading) return; // Evita chamadas duplicadas
    setLoading(true);

    await service.listarCategoria(filtro.nome || '', '', page, size).then((result) => {
      if (result.data.content?.length > 0) {
        setCategorias(result.data.content);
        
      }
      else {
        setCategorias(result.data.content);
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

  const getStatusClass = (status: string) => {
    return `status-${status.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}`;
  };

  const actionTemplate = (registro: Categoria) => {
    const url = `/cadastros/categorias?id=${registro.id}`;
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
      { label: "Nome", key: "nome", width: "70%" },
      { label: "Status", key: "status", width: "15%" },
      { label: "Ações", key: "acoes", width: "5%" }
    ];
  
    const data = categorias.map((cat) => ({
      id: cat.id || '',
      nome: cat.nome || '',
      status: <span className={`has-text-centered ${getStatusClass(cat.status || '')}`}>{cat.status || "N/A"}</span>,
      acoes: (actionTemplate(cat)),
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
    <Layout titulo="Categorias">

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
              disabled={categorias.length === 0 || loading || !hasMore}
              onClick={handleNextPage}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};
