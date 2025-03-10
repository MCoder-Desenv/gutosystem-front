"use client";
import { Layout } from "@/components/layout";
import { useFormik } from "formik";
import { useState } from "react";
import { useUsuarioService } from "@/app/services";
import { useRouter } from "next/navigation";
import { CategoriaProduto } from "@/app/models/produtos";
import { ButtonType } from "@/components/common/button";
import { ModalCard } from "@/components/common/modal";
import TabelaDinamica, { Column } from "@/components/common/tabelaDinamica";
import { UsuarioProjection, Usuarios } from "@/app/models/usuarios";
import { usePermissao } from "@/app/hooks/usePermissoes";

interface ConsultaUsuariosForm {
  nome?: string;
  status?: string;
  categoria?: CategoriaProduto;
}

export const ListagemUsuarios: React.FC = () => {
  const service = useUsuarioService();
  const router = useRouter();
  const { role } = usePermissao();
  const [usuarios, setUsuarios] = useState<UsuarioProjection[]>([]); // Lista de clientes atual
  const [loading, setLoading] = useState(false); // Estado de carregamento

  //mensagem
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalTipo, setModalTipo] = useState<'success' | 'error'>('success');
  const podeExcluirUsuario = role === "ROLE_MASTER_FULL"; // Somente ROLE_MASTER_FULL pode excluir


  //Deletar Usuario
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuarios | null>(null);

  const handleSubmit = () => {
    loadData(); // Carrega os dados da primeira página
  };

  const { handleSubmit: formikSubmit, resetForm } = useFormik<ConsultaUsuariosForm>({
    onSubmit: handleSubmit,
    initialValues: { nome: "", categoria: undefined, status: '' },
  });
  

  const loadData = async () => {
    if (loading) return; // Evita chamadas duplicadas
    setLoading(true);
    const result = await service.findUser();

    if (result?.length > 0) {
        setUsuarios(result);
    }
    else {
        setUsuarios(result);
      exibirMensagem("Não tem registros para o filtro informado", 'error')
    }
    setLoading(false);
  };

  const excluirUsuario = async (id: string) => {
    await service.excluirUsuario(id)
    .then((del) => {
      exibirMensagem(del?.message || 'Usuário excluído com sucesso', 'success');
      formikSubmit()
    })
    .catch((error) => {
        exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
    });
  }

  // Função para abrir o diálogo de exclusão
  const openDelete = (registro: Usuarios) => {
      setUsuarioToDelete(registro);
      setShowDeleteDialog(true);
  };

  // Função para fechar o diálogo sem excluir
  const cancelDelete = () => {
      setUsuarioToDelete(null);
      setShowDeleteDialog(false);
  };

  // Função para confirmar a exclusão
  const confirmDelete = () => {
      if (usuarioToDelete) {
        excluirUsuario(usuarioToDelete.id || '');
      }
      setUsuarioToDelete(null);
      setShowDeleteDialog(false);
  };

  const actionTemplate = (registro: Usuarios) => {
    const url = `/cadastros/usuarios?id=${registro.id}`;
    return (
      <>
        <span className="is-inline-flex gap-2">
        <ButtonType
          label={"Editar"}
          type="button"
          className="button is-info is-rounded"
          onClick={() => router.push(url)}
        />
        <ButtonType
          label={"Excluir"}
          type="button"
          disabled={!podeExcluirUsuario}
          className="button is-danger is-rounded"
          onClick={() => openDelete(registro)}
        />
      </span>
      </>
    );
  };
    
  const columns: Column[] = [
    { label: "Código", key: "id", width: "8%" },
    { label: "Email", key: "email", width: "33%" },
    { label: "Nome", key: "name", width: "25%" },
    { label: "Role", key: "role", width: "16%" },
    { label: "Ações", key: "acoes", width: "18%" }
  ];
    
  const data = usuarios.map((user) => ({
    id: user.id || '',
    email: user.email || '',
    name: user.name || '',
    role: user.role || '',
    acoes: (actionTemplate(user)),
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
    <Layout titulo="Usuarios">
      <form onSubmit={formikSubmit}>
        <div className="field is-grouped">
          <ButtonType 
            label={"Consultar"}
            type="submit" 
            className="button is-success"
          />
          <ButtonType 
            label={"Novo"}
            type="button" 
            className="button is-warning"
            onClick={() => router.push("/cadastros/usuarios")} 
          />
          <ButtonType 
            label={"Limpar Filtros"}
            type="button" 
            className="button is-danger"
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
      {showDeleteDialog && (
          <div className="modal is-active">
              <div className="modal-background" onClick={cancelDelete}></div>
              <div className="modal-card">
                  <header className="modal-card-head">
                      <p className="modal-card-title">Confirmação</p>
                      <button
                          className="delete"
                          aria-label="close"
                          type='button'
                          onClick={cancelDelete}
                      ></button>
                  </header>
                  <section className="modal-card-body">
                      <p>
                          Você tem certeza que deseja remover o Usuário{' '}
                          <strong>{usuarioToDelete?.email}</strong>?
                      </p>
                  </section>
                  <footer className="modal-card-foot">
                      <button className="button is-danger" onClick={confirmDelete} type='button'>
                          Sim
                      </button>
                      <button className="button" onClick={cancelDelete} type='button'>
                          Não
                      </button>
                  </footer>
              </div>
          </div>
      )}
      <br />
      <div className="columns">
        <div className="column is-full">
          <TabelaDinamica columns={columns} data={data} className={{ table: "table is-fullwidth is-bordered is-striped is-hoverable" }} />
        </div>
      </div>
    </Layout>
  );
};
