
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { ButtonType } from "../../../components/common/button";
import { UsuarioFuncao, Usuarios } from "../../../app/models/usuarios";
import { AutoCompleteGenerico, Input } from "../../../components/common";
import GridComponent from "../../../components/common/GridComponent";
import { useFuncoesService, useTerceiroService, useUsuarioService } from "../../../app/services";
import { useMemo, useState } from "react";
import { ModalCard } from "../../../components/common/modal";
import { Dropdown } from "primereact/dropdown";
import { usePermissao } from "../../../app/hooks/usePermissoes";
import { FuncionarioDto } from "@/app/models/terceiros";

interface UsuariosFormProps {
  usuarios: Usuarios;
  onSubmit: (usuarios: Usuarios) => void;
}

const campoObrigatorio = 'Campo Obrigatório';

const validationScheme = Yup.object().shape({
  role: Yup.string().trim().required(campoObrigatorio),
  email: Yup.string().trim().required(campoObrigatorio),
  name: Yup.string().required(campoObrigatorio),
  usuariosFuncoes: Yup.array()
    .of(
      Yup.object().shape({
        funcao: Yup.object()
          .shape({
            nome: Yup.string().required(campoObrigatorio),
          })
          .required(campoObrigatorio),
      })
    )
    .test("unique-funcao", "Não pode haver funções duplicadas", (value) => {
      if (!value) return true;
      const nomes = value.map((item) => item.funcao?.nome).filter(Boolean);
      return new Set(nomes).size === nomes.length; // Verifica se há duplicatas
    }),
});

export const UsuariosForm: React.FC<UsuariosFormProps> = ({ onSubmit, usuarios }) => {
  const router = useRouter();
  const service = useUsuarioService();
  const serviceTerceiro = useTerceiroService();
  const serviceFuncao = useFuncoesService();
  const { role } = usePermissao();
  const [selecionarTodosCadastrar, setSelecionarTodosCadastrar] = useState(false);
  const [selecionarTodosConsultar, setSelecionarTodosConsultar] = useState(false);

  const roleOptions = [
    ...(role === "ROLE_MASTER_FULL" ? [{ label: "MASTER FULL", value: "ROLE_MASTER_FULL", className: "role-MasterFull" }] : []),
    { label: "MASTER", value: "ROLE_MASTER", className: "role-Master" },
    { label: "USER", value: "ROLE_USER", className: "role-User" },
  ];

  //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [erroBuscarFuncionario, setErroBuscarFuncionario] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error'>('success');

    const formik = useFormik<Usuarios>({
      initialValues: {
        id: usuarios.id || null,
        email: usuarios.email || null,
        name: usuarios.name || null,
        role: usuarios.role || null,
        password: usuarios.password || null,
        usuarioFuncionario: usuarios.usuarioFuncionario ? {
          id: usuarios.usuarioFuncionario.id || null,
          funcionario: usuarios.usuarioFuncionario.funcionario || null
          }:
          { funcionario: { id: null, nome: null } 
        },
        usuariosFuncoes: usuarios.usuariosFuncoes || []
      },
      onSubmit: (values) => {
        const formattedValues = {
          ...values,
          usuariosFuncoes: values.usuariosFuncoes || [],
          usuarioFuncionario: (values.usuarioFuncionario?.funcionario?.id || formik.values.usuarioFuncionario?.funcionario?.id)
           ? { userId: values.id, ...values.usuarioFuncionario }
           : null
        };
        onSubmit(formattedValues);
      },
      enableReinitialize: true,
      validationSchema: validationScheme
    });

  const handleSearchFuncao = async (query: string) => {
    const results = await serviceFuncao.findFuncoesNome(query);
    return results
      .filter((item) => item.id !== undefined && item.id !== null)
      .map((item) => ({
        ...item,
        id: item.id ?? '',
      }));
  };

  const carregarFuncoes = async () => {
    const result = await serviceFuncao.findAllFuncoes();

    formik.setFieldValue("usuariosFuncoes", [
        ...(formik.values.usuariosFuncoes ?? []), // ✅ Garante que sempre é um array
        ...result
            .filter((novaFuncao) => !formik.values.usuariosFuncoes?.some((func) => func.funcao?.id === (novaFuncao.id ?? '')))
            .map((funcao) => ({
                id: null,
                funcao,
                podeCadastrar: false,
                podeConsultar: false,
            }))
    ]);
  };

  const toggleSelecionarTodos = (campo: "podeCadastrar" | "podeConsultar", valor: boolean) => {
    setSelecionarTodosCadastrar(campo === "podeCadastrar" ? valor : selecionarTodosCadastrar);
    setSelecionarTodosConsultar(campo === "podeConsultar" ? valor : selecionarTodosConsultar);
  
    formik.setFieldValue(
      "usuariosFuncoes",
      (formik.values.usuariosFuncoes || []).map((item) => ({
        ...item,
        [campo]: valor,
      }))
    );
  };

  const redefinirSenha = (user: Usuarios) => {
    service.forcarAtualizacaoSenha(user.id || '').then(tipCarAtualizada => {
        exibirMensagem(tipCarAtualizada?.message || '', 'success');
    })
    .catch((error) => {
        exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
    });
  }

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

  //VENDEDOR
  const usuarioFuncionarioSelecionado = useMemo(() => {
    return formik.values.usuarioFuncionario && formik.values.usuarioFuncionario?.funcionario?.id
      ? formik.values.usuarioFuncionario
      : null;
  }, [formik.values.usuarioFuncionario]);

  const handleSearchFuncionario = async (query: string): Promise<{ id: string | number; nome: string | null }[]> => {
    try {
        const results = await serviceTerceiro.findFuncionarioAutoComplete(query);
        setErroBuscarFuncionario('');
        if (!results?.data) return []; // Retorna um array vazio se não houver dados

        return results.data
            .filter((item: FuncionarioDto) => item.id !== undefined && item.id !== null)
            .map((item: FuncionarioDto) => ({
                id: item.id ?? "", // Garante que o id nunca seja undefined
                nome: item.nome ?? null, // Garante que descricao nunca seja undefined
            }));
    } catch (error) {
        setErroBuscarFuncionario("Erro ao buscar Funcionário: " + error);
        return []; // Retorna um array vazio em caso de erro
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectFuncionario = (item: any) => {
    // Atualiza o formulário com os valores do item selecionado
    formik.setFieldValue('usuarioFuncionario.funcionario.id', item?.id); // Salva o ID no formik
    formik.setFieldValue('usuarioFuncionario.funcionario.nome', item?.nome); // Salva o ID no formik
  };

  return (
    <form onSubmit={formik.handleSubmit}>
        <div className="columns">
          {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            {formik.values.id &&
                <Input
                    id="id"
                    autoComplete='off'
                    columnClasses="column is-half"
                    label="Código"
                    value={formik.values.id}
                    style={{
                        fontWeight: "bold", 
                        border: "2px solid rgb(0, 0, 0)", // Borda preta para destaque
                        padding: "8px",
                        borderRadius: "5px"
                    }}
                    type="text"
                    disabled
                />
            }
            <Input
                id="name"
                autoComplete='off'
                columnClasses="column is-half"
                label="Nome do Usuário *"
                value={formik.values.name || ''}
                type="text"
                onChange={formik.handleChange}
                placeholder="Digite o nome do Usuário"
                erro={formik.errors.name}
            />
        </div>

        <div className="columns">
            <Input
                id="email"
                label="Email: *"
                value={formik.values.email || ''}
                columnClasses="column is-full"
                onChange={formik.handleChange}
                placeholder="Digite o Email"
                autoComplete="off"
                erro={formik.errors.email}
            />
        </div>

        <div className="columns">
            <div className="column">
                <label htmlFor="role" className="label">Role: *</label>
                <div className={`control dropdown-${formik.values.role || 'default'}`} /* Adiciona classe dinâmica ao contêiner com um fallback */> 
                    <Dropdown
                        id="role"
                        name="role"
                        autoComplete='off'
                        value={formik.values.role}
                        options={roleOptions}
                        optionLabel="label"
                        optionValue="value"
                        onChange={(e) => formik.setFieldValue('role', e.value)}
                        placeholder="Selecione a Role"
                        className="w-full custom-dropdown-height"
                    />
                </div>
                {formik.errors.role && (
                    <p className="help is-danger">{formik.errors.role}</p>
                )}
            </div>
        </div>

        <div className="columns">
          <AutoCompleteGenerico
            id="usuarioFuncionario"
            name="usuarioFuncionario"
            autoComplete='off'
            label="Funcionário:"
            value={
              usuarioFuncionarioSelecionado
                ? `${usuarioFuncionarioSelecionado.funcionario?.id} - ${usuarioFuncionarioSelecionado.funcionario?.nome}`
                : ''
            } // Usa o valor formatado corretamente
            onSearch={(query) => {
              const trimmedQuery = query.trim();
              return handleSearchFuncionario(trimmedQuery); // <- isso já retorna uma Promise
            }}
            onClear={() => formik.setFieldValue('usuarioFuncionario.funcionario', null)}
            onSelect={(item) => handleSelectFuncionario(item)}
            formatResult={(item) => `${item.id} - ${item.nome}`}
            placeholder="Digite o nome do Funcionário"
            erro={erroBuscarFuncionario !== '' ? erroBuscarFuncionario : ''}
          />
        </div>

        <div className="is-flex is-justify-content-space-between">
          <ButtonType 
              label={"Carregar Funções"}
              className='button is-warning'
              type='button'
              onClick={() => carregarFuncoes()}
          />
          <ButtonType 
              label={"Redefinir senha"}
              className='button is-danger'
              disabled={usuarios.id === ''}
              type='button'
              onClick={() => redefinirSenha(formik.values || usuarios)}
          />
        </div>
        <br/>
        <div className="columns">
          <div className="column is-half">
            <label className="checkbox">
              <input
                autoComplete='off'
                type="checkbox"
                checked={selecionarTodosCadastrar}
                onChange={(e) => toggleSelecionarTodos("podeCadastrar", e.target.checked)}
              />
              Selecionar todos - Pode Cadastrar 
            </label>
          </div>
          <div className="column is-half">
            <label className="checkbox">
              <input
                autoComplete='off'
                type="checkbox"
                checked={selecionarTodosConsultar}
                onChange={(e) => toggleSelecionarTodos("podeConsultar", e.target.checked)}
              />
              Selecionar todos - Pode Consultar
            </label>
          </div>
        </div>

        <br/>   
        <GridComponent<UsuarioFuncao>
            parentColumns={[
              { 
                key: "funcao", 
                label: "Função", 
                type: "autocompleteinput",
                onSearch: async (query) => handleSearchFuncao(query),
                formatResult: (funcao) => funcao.nome, // Para exibir corretamente no dropdown
                formatValue: (funcao) => funcao?.nome ?? "" // Para exibir corretamente na célula da tabela
              },
              { key: "podeCadastrar", label: "Pode Cadastrar", type: "checkbox", width:'15%' },
              { key: "podeConsultar", label: "Pode Consultar", type: "checkbox", width:'15%' },
            ]}
            comparadores={["funcao.nome"]} // Evita que haja dois "Jose"
            tituloParent={"Funções"}
            tituloBotaoParent={"Adicionar"}
            allowDeleteParent
            data={(formik.values.usuariosFuncoes ?? []).map((item) => ({
                ...item,
                id: item.id || "", // Garante que `id` sempre tenha um valor
            }))}                           
            setData={(newData) => {
              formik.setValues((prevValues) => ({
                ...prevValues,
                usuariosFuncoes: (typeof newData === "function" ? newData(prevValues.usuariosFuncoes ?? []) : newData).map((item) => ({
                  ...item || [],
                  //usuariosFuncoes: item || [], // ✅ GARANTE QUE `usuariosFuncoes` SEJA UM ARRAY
                })),
              }));
            }}                    
        />
        {formik.errors.usuariosFuncoes && typeof formik.errors.usuariosFuncoes === "string" && (
          <p style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>
            {formik.errors.usuariosFuncoes}
          </p>
        )}
        <br/>
        <div className="field is-grouped">
            <ButtonType 
                label={formik.values.id ? 'Atualizar' : 'Salvar'}
                className='button is-link'
                type='submit'
                disabled={!formik.dirty || !formik.isValid } // Botão só habilita se houver alterações
            />
            <ButtonType 
                type="button"
                label={"Voltar (Tela de Consulta)"}
                className='button'
                onClick={() => router.push("/consultas/usuarios")}
            />  
        </div>
    </form>
  );
};
