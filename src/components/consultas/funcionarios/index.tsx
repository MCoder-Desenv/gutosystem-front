"use client";
import { Layout } from "../../layout";
import { Input } from "../../common";
import { useFormik } from "formik";
import { useState } from "react";
import { FuncionarioDto, Terceiro } from "../../../app/models/terceiros";
import { useTerceiroService } from "../../../app/services";
import { useRouter } from "next/navigation";
import { ButtonType } from "../../common/button";
import { ModalCard } from "../../common/modal";
import TabelaDinamica, { Column } from "../../common/tabelaDinamica";
import { usePermissao } from "../../../app/hooks/usePermissoes";

interface ConsultaFuncionariosForm {
  nome?: string;
}

export const ListagemFuncionarios: React.FC = () => {
  const service = useTerceiroService();
  const router = useRouter();

  const { podeCadastrar, podeConsultar } = usePermissao("Funcionários");

  const [funcionarios, setFuncionarios] = useState<FuncionarioDto[]>([]); // Lista de funcionários atual
  const [currentPage, setCurrentPage] = useState(0); // Página atual
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [hasMore, setHasMore] = useState(true); // Se há mais registros para carregar

  //mensagem
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalTipo, setModalTipo] = useState<'success' | 'error'>('success');

  const pageSize = 10; // Tamanho da página

  const handleSubmit = (filtro: ConsultaFuncionariosForm) => {
    setCurrentPage(0);
    setHasMore(true);
    loadData(0, pageSize, filtro); // Carrega os dados da primeira página
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange } = useFormik<ConsultaFuncionariosForm>({
    onSubmit: handleSubmit,
    initialValues: { nome: "" },
  });

  const loadData = async (page: number, size: number, filtro: ConsultaFuncionariosForm) => {
    if (loading) return; // Evita chamadas duplicadas
    setLoading(true);

    await service.findFuncionarios(filtro.nome, page, size).then((result) => {
      if (result.data.content?.length > 0) {
        setFuncionarios(result.data.content);
        
      }
      else {
        setFuncionarios(result.data.content);
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

  const actionTemplate = (registro: Terceiro) => {
    const url = `/cadastros/funcionarios?id=${registro.id}`;
    return (
      <div>
        <ButtonType 
          label={!podeCadastrar ? "Visualizar" : "Editar"}
          type="button" 
          className="button is-info is-rounded"
          onClick={() => router.push(url)}
        />
      </div>
    );
  };

  const getStatusClass = (status: string) => {
    return `status-${status.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}`;
  };

  const columns: Column[] = [
    { label: "Código", key: "id", width: "6%" },
    { label: "Nome", key: "nome", width: "74%" },
    { label: "Status", key: "status", width: "15%" },
    { label: "Ações", key: "acoes", width: "5%" }
  ];
  
  const data = funcionarios.map((func) => ({
    id: func.id || '',
    nome: func.nome || '',
    status: <span className={`has-text-centered ${getStatusClass(func.status || '')}`}>{func.status || "N/A"}</span>,
    acoes: (actionTemplate(func)),
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
    <Layout titulo="Funcionários">
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
            onClick={() => router.push("/cadastros/funcionarios")}
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
              disabled={funcionarios.length === 0 || loading || !hasMore}
              onClick={handleNextPage}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};
