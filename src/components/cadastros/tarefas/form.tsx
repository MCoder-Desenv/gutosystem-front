"use client";
import { CadastroTarefa, FuncionariosTarefa } from "../../../app/models/tarefa";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ButtonType } from "../../../components/common/button";
import FormGridComponent from "../../../components/common/tarefaComponent";
import { TerceirosEnderecosClienteDto } from '../../../app/models/terceiros';
import { Fragment, useEffect, useState } from "react";
import GenericMultiSelect from "../../../components/common/genericMultiSelect";
import {
  useFichaOrcamentoService,
  useOrdemServicoManutencaoService,
  usePedidoOrcamentoService,
  useTerceiroEnderecoService,
  useTerceiroService,
  useUsuarioFuncionarioService
} from "../../../app/services";
import { AutoCompleteGenerico } from '../../../components/common';
import { Dropdown } from "primereact/dropdown";
import { Input } from "../../../components/common/input";
import { Checkbox } from "primereact/checkbox";
import { formatDateToBackend } from "../../../app/util/formatData";
import { useSession } from "next-auth/react";

interface TarefaFormProps {
  tarefas: CadastroTarefa[];
  onSubmit: (tarefa: CadastroTarefa[]) => void;
}

const campoObrigatorio = "Campo Obrigatório";

// Validação do array de funções
const validationScheme = Yup.object().shape({
  funcoes: Yup.array().of(
    Yup.object().shape({
      nome: Yup.string().required(campoObrigatorio), // Nome é obrigatório
      status: Yup.boolean().required(campoObrigatorio), // Status é obrigatório
    })
  ),
});

export const TarefasForm: React.FC<TarefaFormProps> = ({ onSubmit, tarefas }) => {
  const serviceTerceiro = useTerceiroService();
  const [dataCadastroManual, setDataCadastroManual] = useState<string>("");
  const [checkboxMarcado, setCheckboxMarcado] = useState<boolean>(false);
  const [enderecosPorLinha, setEnderecosPorLinha] = useState<Record<number, TerceirosEnderecosClienteDto[]>>({});

  const serviceClienteEnderecos = useTerceiroEnderecoService();
  const serviceFicha = useFichaOrcamentoService();
  const servicePedido = usePedidoOrcamentoService();
  const serviceOrdemMnt = useOrdemServicoManutencaoService();
  const serviceUserFunc = useUsuarioFuncionarioService();
  const { data: session } = useSession();

  const pioridadeOptions = [
    { label: 'Alta', value: 'Alta', className: 'prioridade-Alta' },
    { label: 'Normal', value: 'Normal', className: 'prioridade-Normal' },
    { label: 'Baixa', value: 'Baixa', className: 'prioridade-Baixa' }
  ];

  const formik = useFormik({
    initialValues: {
        tarefas: tarefas,
    },
    onSubmit: (values) => {
      onSubmit(values.tarefas);
    },
    enableReinitialize: true,
    validationSchema: validationScheme,
  });

  useEffect(() => {
    if (checkboxMarcado && dataCadastroManual) {
      const novasTarefas = formik.values.tarefas.map(tar => ({
        ...tar,
        dataHoraAtividade: tar.dataHoraAtividade || `${dataCadastroManual}T00:00`
        // Só sobrescreve se NÃO tiver data preenchida
      }));
      formik.setFieldValue("tarefas", novasTarefas);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.tarefas.length, checkboxMarcado, dataCadastroManual]);

  const handleSearchFicha = async (query: string, tipo: "nome" | "telefone") => {
    let results
    
    if (tipo === 'telefone') {
      results = await serviceFicha.carregarFichaTarefa('', query);
    }
    else {
      results = await serviceFicha.carregarFichaTarefa(query, '');
    }
    
    return results.data
      .filter((item) => item.id !== undefined && item.id !== null)
      .map((item) => ({
        ...item,
        id: item.id ?? '',
      }));
  };

  const handleSearchPedido = async (query: string) => {
    
    const results = await servicePedido.carregarPedidoTarefa(query);

    
    return results.data
      .filter((item) => item.id !== undefined && item.id !== null)
      .map((item) => ({
        ...item,
        id: item.id ?? '',
      }));
  };

  const handleSearchOrdemManutencao = async (query: string) => {
    
    const results = await serviceOrdemMnt.carregarOrdemTarefa(query);

    
    return results.data
      .filter((item) => item.id !== undefined && item.id !== null)
      .map((item) => ({
        ...item,
        id: item.id ?? '',
      }));
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="columns">
        <Input
          id="dataCadastroManual"
          name="dataCadastroManual"
          label="Data Manual:"
          autoComplete="off"
          columnClasses="column is-one-fifth"
          type="date"
          value={dataCadastroManual}
          onChange={(e) => setDataCadastroManual(e.target.value)}
        />
        <div className="field column">
          <label className="label">Colocar a data em todos</label>
          <div className="control">
              <Checkbox
                  inputId="checkboxMarcado"
                  checked={checkboxMarcado}
                  autoComplete='off'
                  onChange={(e) => setCheckboxMarcado(e.target.checked || false)}
              />
          </div>
        </div>
      </div>
      <FormGridComponent<CadastroTarefa>
        items={(formik.values.tarefas || []).map((tar) => ({
          id: tar.id ?? null,
          data: { ...tar },
        }))}
        setItems={(updatedItems) =>
          formik.setFieldValue(
            'tarefas',
            updatedItems.map((item) => item.data)
          )
        }
        createNewItem={() => ({
          id: null,
          dataHoraAtividade: '',
          titulo: '',
          descricao: '',
          funcionarios: [],
          prioridade: '',
          status: 'Aberta',
          observacoes: '',
          cliente:{},
          criadoPor: session?.user?.name,
          tipo: 'ficha'
        })}
        enableRemoveItem={true}
        collapsedRow={(item, index) => (
          <div>
            <strong>{item.data.titulo}</strong> -{" "}
            {item.data.funcionarios?.length ? (
              item.data.funcionarios.map((funcionario, idx) => (
                <span key={idx}>
                  {funcionario.funcNome}
                  {item.data.funcionarios && idx < item.data.funcionarios.length - 1 && ", "}
                </span>
              ))
            ) : (
              <span>Nenhum funcionário</span>
            )}
          </div>
        )}                  
        renderRow={(item, index, updateItem, updateItemObject) => {
          const clienteSelecionado = item.data.cliente?.id
            ? item.data.cliente
            : null;

          const fichaSelecionada = item.data.ficha?.id
            ? item.data.ficha
            : null;

          const listaEnderecos = enderecosPorLinha[index] || [];
          let erroBuscarEnderecos = '';

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formatarEndereco = (enderecoObj: any): string => {
            return `${enderecoObj.endereco}, ${enderecoObj.numero}, ${enderecoObj.bairro}, ${enderecoObj.complemento}, ${enderecoObj.cidade}`;
          };
          console.log(clienteSelecionado)
          const handleSearchCliente = async (query: string) => {
            try {
                //setErroBuscarClientes('')
        
                const response = await serviceTerceiro.findClienteAutoComplete(query);
                const results = response.data
                
                return results
                    .filter((item) => item.id !== undefined && item.id !== null)
                    .map((item) => ({
                        ...item,
                        id: item.id ?? '',
                    }));
            } catch (error) {
                console.error(error)
                //setErroBuscarClientes('Erro ao buscar clientes:' + error)
                return []; // Garante que sempre retorna um array
            }
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const handleSelectCliente = async (item: any) => {
            if (!item || !item.id) {
              console.error("Cliente inválido:", item);
              return;
            }
          
            console.log("item aqui: " + item.id);
            console.log("item aqui: " + item.nome);
          
            try {
              const enderecos = await serviceClienteEnderecos.findClienteEnderecoFicha(item.id);
              erroBuscarEnderecos = '';
          
              if (enderecos.length > 0) {
                if (enderecos.length === 1) {
                  const enderecoFormatado = formatarEndereco(enderecos[0]);
                  updateItemObject(index, {
                    cliente: {
                      id: item.id,
                      nome: item.nome
                    },
                    local: enderecoFormatado
                  });
                }
                else {
                  updateItem(index, "cliente", {
                    id: item.id,
                    nome: item.nome
                  });
                }
          
                setEnderecosPorLinha(prev => ({
                  ...prev,
                  [index]: enderecos
                }));
              } else {
                const partes = item.data?.local?.split(',').map((part: string) => part.trim()) || [];
                const enderecoDefault = {
                  endereco: partes[0] ?? "",
                  numero: partes[1] ?? "",
                  bairro: partes[2] ?? "",
                  cidade: partes[3] ?? "",
                };
          
                setEnderecosPorLinha(prev => ({
                  ...prev,
                  [index]: [enderecoDefault]
                }));

                // Sempre atualiza o cliente no fim
                updateItem(index, "cliente", {
                  id: item.id,
                  nome: item.nome
                });
              }
            } catch (error) {
              erroBuscarEnderecos = '🚨 Erro ao buscar endereços do Cliente: ' + error;
            }
          };          
          
          return (
          <>
            <div className="buttons mb-4">
              <>
                <div className="buttons mb-4">
                  <button
                    type="button"
                    className={`button ${item.data.tipo === 'ficha' ? 'is-primary' : ''}`}
                    onClick={() => updateItem(index, 'tipo', 'ficha')}
                    //disabled={!podeCadastrar}
                  >
                    Ficha
                  </button>
                  <button
                    type="button"
                    className={`button ${item.data.tipo === 'pedido' ? 'is-primary' : ''}`}
                    onClick={() => updateItem(index, 'tipo', 'pedido')}
                    //disabled={!podeCadastrar}
                  >
                    Pedido
                  </button>
                  <button
                    type="button"
                    className={`button ${item.data.tipo === 'ordemsm' ? 'is-primary' : ''}`}
                    onClick={() => updateItem(index, 'tipo', 'ordemsm')}
                    //disabled={!podeCadastrar}
                  >
                    Ordem Manutenção
                  </button>
                  <button
                    type="button"
                    className={`button ${item.data.tipo === 'avulsa' ? 'is-primary' : ''}`}
                    onClick={() => updateItem(index, 'tipo', 'avulsa')}
                    //disabled={!podeCadastrar}
                  >
                    Avulsa
                  </button>
                </div>
              </>
            </div>
            {item.data.tipo === 'ficha' ?
              <div className="columns">
                <AutoCompleteGenerico
                  id={`tarefas.${index}.ficha`}
                  name={`tarefas.${index}.ficha`}
                  label="Ficha Orçamento: *"
                  autoComplete='off'
                  value={fichaSelecionada?.id || ''} // Usa o valor formatado corretamente
                  onClear={() => updateItemObject(index, {
                    ficha: null,
                    cliente: null,
                    local: ''
                  })}
                  onSearch={(query) => {
                    const trimmedQuery = query.trim();
                
                    if (/^\d+$/.test(trimmedQuery)) {
                      return handleSearchFicha(trimmedQuery, "telefone"); // 🔹 Retorna a Promise
                    } else {
                      return handleSearchFicha(trimmedQuery, "nome"); // 🔹 Retorna a Promise
                    }
                  }}
                  //onSelect={(item) => updateItem(index, "ficha", item)}
                  onSelect={(ite) => {
                    updateItemObject(index, {
                      ficha: ite,
                      cliente: {
                        id: ite.idCliente,
                        nome: ite.nomeCliente
                      },
                      local: ite.enderecoCliente ?? ''
                    });
                    }
                  }
                  formatResult={(ite) => `${ite.id} - ${ite.orcamento} - ${ite.nomeCliente} - ${ite.enderecoCliente ?? 'Endereço não cadastrado'} - ${formatDateToBackend(ite?.dataSolicitacaoCliente || '')}`}
                  placeholder="Digite"
                />
              </div>
              : item.data.tipo === 'pedido' ?
              <div className="columns">
                <AutoCompleteGenerico
                  id={`tarefas.${index}.pedido`}
                  name={`tarefas.${index}.pedido`}
                  label="Pedido de Orçamento: *"
                  autoComplete='off'
                  value={item.data.pedido?.id || ''} // Usa o valor formatado corretamente
                  onSearch={(query) => {
                    const trimmedQuery = query.trim();
                    return handleSearchPedido(trimmedQuery); // 🔹 Retorna a Promise
                  }}
                  //onSelect={(item) => updateItem(index, "pedido", item)}
                  onClear={() => updateItemObject(index, {
                    pedido: null,
                    cliente: null,
                    local: ''
                  })} 
                  onSelect={(ite) => {
                    updateItemObject(index, {
                      pedido: ite,
                      cliente: {
                        id: ite.idCliente,
                        nome: ite.nomeCliente
                      },
                      local: ite.enderecoCliente ?? ''
                    });
                    }
                  }
                  formatResult={(item) => `${item.id} - ${item.identificador} - ${item.nomeCliente} - ${item.enderecoCliente ?? 'Endereço não cadastrado'} - ${formatDateToBackend(item?.dataPedido || '')}`}
                  placeholder="Digite"
                />
              </div>
              : item.data.tipo === 'ordemsm' ?
              <div className="columns">
                <AutoCompleteGenerico
                  id={`tarefas.${index}.ordemManutencao`}
                  name={`tarefas.${index}.ordemManutencao`}
                  label="Ordem de Serviço Manutenção: *"
                  autoComplete='off'
                  value={item.data.ordemManutencao?.id || ''} // Usa o valor formatado corretamente
                  onClear={() => updateItemObject(index, {
                    ordemManutencao: null,
                    cliente: null,
                    local: null
                  })} 
                  onSearch={(query) => {
                    const trimmedQuery = query.trim();
                    return handleSearchOrdemManutencao(trimmedQuery); // 🔹 Retorna a Promise
                  }}
                  //onSelect={(item) => updateItem(index, "ordemManutencao", item)}
                  onSelect={(ite) => {
                    updateItemObject(index, {
                      ordemManutencao: ite,
                      cliente: {
                        id: ite.idCliente,
                        nome: ite.nomeCliente
                      },
                      local: ite.enderecoCliente ?? ''
                    });
                    }
                  }
                  formatResult={(item) => `${item.id} - ${item.numero} - ${item.nomeCliente} - ${item.enderecoCliente} - ${formatDateToBackend(item?.dataSolicitacaoManutencao || '')}`}
                  placeholder="Digite"
                />
              </div>
              :
              undefined
            }
            <div className="columns">
              { item.data.tipo === 'avulsa' ?
                <AutoCompleteGenerico
                  id="clienteSelecionado"
                  name="clienteSelecionado"
                  label="Cliente: *"
                  autoComplete='off'
                  onClear={() => {
                    updateItemObject(index, {
                      ordemManutencao: null,
                      cliente: null,
                      local: null
                    });
                  
                    setEnderecosPorLinha(prev => ({
                      ...prev,
                      [index]: [] // limpa os endereços da linha atual
                    }));
                  }}                  
                  value={
                      clienteSelecionado
                        ? `${clienteSelecionado.id ?? ''} - ${clienteSelecionado.nome ?? ''}`
                        : ''
                  } // Usa o valor formatado corretamente
                  onSearch={(query) => {
                      const trimmedQuery = query.trim();
                      return handleSearchCliente(trimmedQuery);
                  }}                    
                    // Chama a busca ao digitar
                  onSelect={(item) => { handleSelectCliente(item);}} // Atualiza o formulário ao selecionar
                  formatResult={(item) =>
                      `${item.id} - ${item.nome}`
                  }
                  placeholder="Digite Nome, CPF ou CNPJ do Cliente"
                />
              :
                <Input
                  label="Cliente:"
                  id={`tarefas.${index}.cliente`}
                  name={`tarefas.${index}.cliente`}
                  className="input"
                  columnClasses="column is-full"
                  autoComplete="off"
                  value={
                    item.data.cliente?.id && item.data.cliente?.nome
                      ? `${item.data.cliente.id} - ${item.data.cliente.nome}`
                      : ''
                  }
                  type="text"
                  disabled
                />
              }
            </div>
            <div className="columns">
              { item.data.tipo === 'avulsa' ?
                <div className="column">
                  <label htmlFor={`tarefas.${index}.local`} className="label">
                    Endereço:* 
                  </label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        id={`tarefas.${index}.local`}
                        name={`tarefas.${index}.local`}
                        value={item.data?.local || ""}
                        //onChange={(e) => formik.setFieldValue(`tarefas.${index}.local`, e.target.value)}
                        onChange={(e) => updateItem(index, 'local', e.target.value)}
                        //disabled={loading}
                        //aria-disabled={loading}
                      >
                        <option value="" disabled>
                          {"Selecione um endereço"}
                        </option>
                        {listaEnderecos.map((item, i) => (
                          <option key={i} value={`${item.endereco}, ${item.numero}, ${item.bairro}, ${item.complemento}, ${item.cidade}`}>
                            {item.endereco}, {item.numero}, {item.bairro}, {item.complemento}, {item.cidade}
                          </option>
                        ))}
                      </select>
                      {erroBuscarEnderecos && (
                        <p className="help is-danger" style={{
                          marginTop: "4px",
                          position: "absolute",
                          bottom: "-20px",
                        }}>
                          {erroBuscarEnderecos}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              :
                <Input
                  label="Local:"
                  id={`tarefas.${index}.local`}
                  name={`tarefas.${index}.local`}
                  className="input"
                  columnClasses="column is-full"
                  autoComplete="off"
                  value={ item.data.local || ''}
                  type="text"
                  disabled
                />
              }
            </div>
            <div className="columns">
              <Input
                  label="Data: *"
                  id={`tarefas.${index}.dataHoraAtividade`}
                  name={`tarefas.${index}.dataHoraAtividade`}
                  placeholder="Digite a Data da Tarefa"
                  className="input"
                  columnClasses="column is-half"
                  autoComplete="off"
                  value={item.data.dataHoraAtividade || ""}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value.length === 16) { // formato: yyyy-MM-ddTHH:mm
                      value += ":00";
                    }
                    updateItem(index, "dataHoraAtividade", value);
                  }}                  
                  type="datetime-local"
                  //erro={formik.errors.nome}
                  //disabled={!podeCadastrar}
              />
              <div className="column is-half">
                  <label htmlFor={`tarefas.${index}.prioridade`} className="label">Prioridade: *</label>
                  <div className={`control dropdown-${item.data.prioridade || 'default'}`}> 
                      <Dropdown
                          id={`tarefas.${index}.prioridade`}
                          name={`tarefas.${index}.prioridade`}
                          autoComplete="off"
                          value={item.data.prioridade}
                          options={pioridadeOptions}
                          optionLabel="label"
                          optionValue="value"
                          onChange={(e) =>
                            updateItem(index, "prioridade", e.target.value)
                          }
                          placeholder="Selecione a Prioridade"
                          className="w-full custom-dropdown-height"
                      />
                  </div>
              </div>
            </div>
            <div className="columns">
              <div className="column is-full">
                <label htmlFor={`${item.data.funcionarios}`} className="label">Funcionários: *</label>
                <div className="control"> 
                    <GenericMultiSelect<FuncionariosTarefa>
                      selecionados={item.data.funcionarios || []}
                      setSelecionados={(novos) =>
                        updateItem(index, "funcionarios", novos)
                      }
                      labelRender={(f) => f.funcNome || ""}
                      onBuscar={(e) =>
                        serviceUserFunc
                          .findUsuarioFuncionario(e)
                          .then((res) => res.data)
                      }
                    />
                </div>
              </div>
            </div>
            <div className="columns">
              <Input
                  label="Título: *"
                  id={`tarefas.${index}.titulo`}
                  name={`tarefas.${index}.titulo`}
                  placeholder="Digite o Título"
                  className="input"
                  columnClasses="column is-full"
                  autoComplete="off"
                  value={item.data.titulo || ""}
                  onChange={(e) =>
                    updateItem(index, "titulo", e.target.value)
                  }
                  type="text"
                  //erro={formik.errors.nome}
                  //disabled={!podeCadastrar}
              />
            </div>
            <div className="field">
                <label htmlFor="observacao" className="label">
                Descrição:
                </label>
                <textarea
                  id={`tarefas.${index}.descricao`}
                  name={`tarefas.${index}.descricao`}
                  className="textarea"
                  autoComplete="off"
                  value={item.data.descricao ?? ""}
                  placeholder="Digite aqui a Descrição da Tarefa/Serviço"
                  onChange={(e) =>
                    updateItem(index, "descricao", e.target.value)
                  }
                  rows={5}
                  maxLength={950}
                  style={{ resize: "none", minHeight: "120px" }}
                ></textarea>
            </div>
            <div className="field">
                <label htmlFor="observacao" className="label">
                Observações:
                </label>
                <textarea
                  id={`tarefas.${index}.observacoes`}
                  name={`tarefas.${index}.observacoes`}
                  className="textarea"
                  autoComplete="off"
                  value={item.data.observacoes ?? ""}
                  placeholder="Digite aqui a Observação da Tarefa/Serviço"
                  onChange={(e) =>
                    updateItem(index, "observacoes", e.target.value)
                  }
                  rows={5}
                  maxLength={950}
                  style={{ resize: "none", minHeight: "120px" }}
                ></textarea>
            </div>
          </>
          )
        }}
      />
      <div className="field is-grouped">
        <ButtonType
          label={"Salvar"}
          className="button is-link"
          type="submit"
          disabled={!formik.dirty || !formik.isValid} // Botão habilitado apenas se houver alterações e a validação estiver ok
        />
      </div>
    </form>
  );
};
