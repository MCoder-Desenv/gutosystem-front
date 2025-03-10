"use client";
import { Layout } from "@/components/layout";
import { Input } from "@/components/common";
import { useFormik } from "formik";
import { useState } from "react";
import { Terceiro, ClienteDto } from "@/app/models/terceiros";
import { useTerceiroService } from "@/app/services";
import { useRouter } from "next/navigation";
import { ButtonType } from "@/components/common/button";
import { ModalCard } from "@/components/common/modal";
import TabelaDinamica, { Column } from "@/components/common/tabelaDinamica";
import { usePermissao } from "@/app/hooks/usePermissoes";

interface ConsultaClientesForm {
  nome?: string;
}

export const ListagemClientes: React.FC = () => {
  const service = useTerceiroService();
  const router = useRouter();

  const { podeCadastrar, podeConsultar } = usePermissao("Clientes");

  const [clientes, setClientes] = useState<ClienteDto[]>([]); // Lista de clientes atual
  const [currentPage, setCurrentPage] = useState(0); // Página atual
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [hasMore, setHasMore] = useState(true); // Se há mais registros para carregar

  //mensagem
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalTipo, setModalTipo] = useState<'success' | 'error'>('success');

  const pageSize = 10; // Tamanho da página

  const handleSubmit = (filtro: ConsultaClientesForm) => {
    setCurrentPage(0);
    setHasMore(true);
    loadData(0, pageSize, filtro); // Carrega os dados da primeira página
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange } = useFormik<ConsultaClientesForm>({
    onSubmit: handleSubmit,
    initialValues: { nome: "" },
  });

  const loadData = async (page: number, size: number, filtro: ConsultaClientesForm) => {
    if (loading) return; // Evita chamadas duplicadas
    setLoading(true);

    await service.findClientes(filtro.nome, page, size).then((result) => {
      if (result.data.content?.length > 0) {
        setClientes(result.data.content);
        
      }
      else {
        setClientes(result.data.content);
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
    const url = `/cadastros/clientes?id=${registro.id}`;
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

  const data = clientes.map((cli) => ({
    id: cli.id || '',
    nome: cli.nome || '',
    tipoTerceiro: cli.tipoTerceiro === "2" ? "CPF" : cli.tipoTerceiro === "3" ? "CNPJ" : "Desconhecido",
    cpfcnpf: cli.cpf || cli.cnpj || "N/A",
    status: <span className={`has-text-centered ${getStatusClass(cli.status || '')}`}>{cli.status || "N/A"}</span>,
    acoes: (actionTemplate(cli)),
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
    <Layout titulo="Clientes">
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
            onClick={() => router.push("/cadastros/clientes")}
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
              disabled={clientes.length === 0 || loading || !hasMore}
              onClick={handleNextPage}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};
