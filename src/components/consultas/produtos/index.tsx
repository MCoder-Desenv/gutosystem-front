"use client";
import { Layout } from "@/components/layout";
import { Input } from "@/components/common";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useCategoriaService, useProdutoService } from "@/app/services";
import { useRouter } from "next/navigation";
import { CategoriaProduto, Produto } from "@/app/models/produtos";
import { ButtonType } from "@/components/common/button";
import { SelectGenerico } from "@/components/common/selectGenerico";
import { ModalCard } from "@/components/common/modal";
import TabelaDinamica, { Column } from "@/components/common/tabelaDinamica";
import { usePermissao } from "@/app/hooks/usePermissoes";

interface ConsultaProdutosForm {
  nome?: string;
  status?: string;
  categoria?: CategoriaProduto;
}

export const ListagemProdutos: React.FC = () => {
  const service = useProdutoService();
  const serviceCategoria = useCategoriaService();
  const router = useRouter();

  const { podeCadastrar, podeConsultar } = usePermissao("Produtos");

  const [produtos, setProdutos] = useState<Produto[]>([]); // Lista de clientes atual
  const [currentPage, setCurrentPage] = useState(0); // Página atual
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [hasMore, setHasMore] = useState(true); // Se há mais registros para carregar

  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  const pageSize = 10; // Tamanho da página

  //mensagem
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalTipo, setModalTipo] = useState<'success' | 'error'>('success');
  const [erroCategorias, setErroCategorias] = useState('');

  useEffect(() => {
    const carregarCategorias = async () => {
      setLoadingCategorias(true);
      try {
        const result = await serviceCategoria.findAllCategoriaProduto();
        setCategorias(result.data);
        setErroCategorias('')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setErroCategorias("Erro ao carregar categorias:" + error?.message);
      } finally {
        setLoadingCategorias(false);
        setErroCategorias('')
      }
    };
    
    carregarCategorias();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Esse useEffect só roda uma vez ao montar o componente

  const handleSubmit = (filtro: ConsultaProdutosForm) => {
    setCurrentPage(0);
    setHasMore(true);
    loadData(0, pageSize, filtro); // Carrega os dados da primeira página
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange, setFieldValue, resetForm } = useFormik<ConsultaProdutosForm>({
    onSubmit: handleSubmit,
    initialValues: { nome: "", categoria: undefined, status: '' },
  });
  

  const loadData = async (page: number, size: number, filtro: ConsultaProdutosForm) => {
    if (loading) return; // Evita chamadas duplicadas
    setLoading(true);
    const categoria = (filtro?.categoria?.id === '' || filtro?.categoria?.id === undefined || filtro?.categoria?.id === null) ? '' : filtro?.categoria?.id;

    await service.findProdutos(filtro.nome || '', filtro.status === 'Todos' ? '' : filtro.status, categoria, page, size).then((result) => {
      if (result.data.content?.length > 0) {
        setProdutos(result.data.content);
        
      }
      else {
        setProdutos(result.data.content);
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

  const actionTemplate = (registro: Produto) => {
    const url = `/cadastros/produtos?id=${registro.id}`;
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
    { label: "Código", key: "id", width: "8%" },
    { label: "Descrição", key: "descricao", width: "50%" },
    { label: "Categoria", key: "categoria", width: "22%" },
    { label: "Status", key: "status", width: "15%" },
    { label: "Ações", key: "acoes", width: "5%" }
  ];
    
  const data = produtos.map((prod) => ({
    id: prod.id || '',
    descricao: prod.descricao || '',
    categoria: prod.categoria?.nome || '',
    status: <span className={`has-text-centered ${getStatusClass(prod.status || '')}`}>{prod.status?.replace("-", " ") || "N/A"}</span>,
    acoes: (actionTemplate(prod)),
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

  const categoriaSelecionada = useMemo(() => {
    return filtro.categoria
      ? filtro.categoria
      : null;
  }, [filtro.categoria]); // Só atualiza se `categoria` mudar

  return (
    <Layout titulo="Produtos">
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
        <div className="columns">
          <SelectGenerico
            value={categoriaSelecionada}
            onChange={(categoria) => {
              setFieldValue("categoria", categoria || undefined); // Atualiza o Formik corretamente
            }}
            items={categorias}
            getLabel={(categoria) => `${categoria.id} - ${categoria.nome}`}
            getId={(categoria) => String(categoria.id)}
            label="Categoria"
            loading={loadingCategorias}
            disabled={!podeConsultar}
            error={erroCategorias}
          />
          <SelectGenerico
            value={{ id: filtro.status || 'Todos', nome: filtro.status || 'Todos' }} // Objeto esperado
            onChange={(status) => setFieldValue("status", status?.id || '')} // Pegando apenas o id
            items={[
              { id: "Ativo", nome: "Ativo", value: 'Ativo' },
              { id: "Inativo", nome: "Inativo", value: 'Inativo' },
              { id: "Todos", nome: "Todos", value: 'Todos' }
            ]}
            getLabel={(status) => status.nome}
            getId={(status) => status.id}
            label="Status"
            loading={false} // Lista fixa, sem necessidade de loading
            disabled={!podeConsultar}
          />
        </div>
        <div className="field is-grouped">
          <ButtonType 
            label={"Consultar"}
            type="submit" 
            className="button is-success"
            disabled={!podeConsultar}
          />
          <ButtonType 
            label={"Novo"}
            type="button" 
            className="button is-warning"
            onClick={() => router.push("/cadastros/produtos")}
            disabled={!podeCadastrar}
          />
          <ButtonType 
            label={"Limpar Filtros"}
            type="button" 
            className="button is-danger"
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
              disabled={produtos.length === 0 || loading || !hasMore}
              onClick={handleNextPage}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};
