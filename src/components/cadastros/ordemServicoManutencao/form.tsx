'use client';
import { usePermissao } from '../../../app/hooks/usePermissoes';
import { OrdemServicoManutencao } from '../../../app/models/ordemServicoManutencao';
import { usePedidoOrcamentoService, useOrdemServicoManutencaoService } from '../../../app/services';
import { Input } from '../../../components';
import { AutoCompleteGenerico } from '../../../components/common/autoCompleteGenerico';
import { ButtonType } from '../../../components/common/button';
import { ModalCard } from '../../../components/common/modal';
import { useManutencaoContext } from '../../../contexts/ManutencaoContext';
import { useOrcamentoContext } from '../../../contexts/OrcamentoContext';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useMemo, useState } from 'react';
import * as Yup from 'yup';

interface OrdemServicoManutencaoFormProps {
    ordemServicoManutencao: OrdemServicoManutencao;
    onSubmit: (ordem: OrdemServicoManutencao) => void;
}

interface OrcamentoContextType {
    id: string | null;
    nomeCliente: string | null;
    enderecoCliente: string | null;
    telefoneCliente: string | null;
    setOrcamentoData: (data: OrcamentoContextType) => void;
}

const campoObrigatorio = 'Campo Obrigatório';

const validationScheme = Yup.object().shape({
    status: Yup.string().trim().required(campoObrigatorio),
    //dataSolicitacaoManutencao: Yup.string().trim().required(campoObrigatorio),
    dataSolicitacaoManutencao: Yup.string()
            .trim()
            .required(campoObrigatorio)
            .test(
                'data-nao-futura',
                'A data de solicitação não pode ser maior que a data atual',
                (value) => {
                    if (!value) return false; // Se for nulo, falha automaticamente
    
                    let dataInserida;
    
                    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                        // 📌 Se já está no formato YYYY-MM-DD, cria a data diretamente
                        dataInserida = new Date(value + 'T00:00:00'); // Evita problemas de fuso
                    } else {
                        // 📌 Se estiver no formato DD/MM/YYYY, converte corretamente
                        const regexData = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                        const match = value.match(regexData);
                        
                        if (!match) {
                            return false;
                        }
    
                        const [, dia, mes, ano] = match;
                        dataInserida = new Date(`${ano}-${mes}-${dia}T00:00:00`);
                    }
    
                    // Verifica se a conversão deu certo
                    if (isNaN(dataInserida.getTime())) {
                        return false;
                    }
    
                    // Pegamos a data atual zerando horas para comparação correta
                    const dataAtual = new Date();
                    dataAtual.setHours(0, 0, 0, 0);
                    dataInserida.setHours(0, 0, 0, 0);
    
                    return dataInserida <= dataAtual;
                }
            )
});

export const OrdemServicoManutencaoForm: React.FC<OrdemServicoManutencaoFormProps> = ({
    ordemServicoManutencao,
    onSubmit
}) => {

    //services
    const router = useRouter();
    const service = useOrdemServicoManutencaoService();
    const servicePedido = usePedidoOrcamentoService();
    const { setOrcamentoData } = useOrcamentoContext(); // Acessar a função para setar os dados

    const { idPedido } = useManutencaoContext(); // Acessar os dados do contexto

    const { podeCadastrar } = usePermissao("Ordem de Serviço Manutenção");
    const relatorio = usePermissao("Relatório Ordem de Serviço Manutenção");
    
    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');

    const statusOptions = [
        { label: 'Aberta', value: 'Aberta', className: 'status-Aberta' },
        { label: 'Em Andamento', value: 'Em-Andamento', className: 'status-Em-Andamento' },
        { label: 'Encerrada', value: 'Encerrada', className: 'status-Encerrada' },
        { label: 'Cancelada', value: 'Cancelada', className: 'status-Cancelada' },
    ];
    
    const formik = useFormik<OrdemServicoManutencao>({
        initialValues: {
            id: ordemServicoManutencao.id || null,
            telefoneCliente: ordemServicoManutencao.telefoneCliente || null,
            enderecoCliente: ordemServicoManutencao.enderecoCliente || null,
            dataSolicitacaoManutencao: ordemServicoManutencao.dataSolicitacaoManutencao || null,
            pedidoOrcamento: ordemServicoManutencao.pedidoOrcamento,
            numero: ordemServicoManutencao.numero || null,
            produto: ordemServicoManutencao.produto || null,
            serviceExecutados: ordemServicoManutencao.serviceExecutados || null,
            servicoExecutar: ordemServicoManutencao.servicoExecutar || null,
            cliente: ordemServicoManutencao.cliente,
            tipoManutencaoCheck: ordemServicoManutencao.tipoManutencaoCheck || null,
            cor: ordemServicoManutencao.cor || null,
            fotoAmbCheck: ordemServicoManutencao.fotoAmbCheck || null,
            fotoAmbObs: ordemServicoManutencao.fotoAmbObs || null,
            ilumAmbCheck: ordemServicoManutencao.ilumAmbCheck || null,
            ilumAmbObs: ordemServicoManutencao.ilumAmbObs || null,
            acessDifeCheck: ordemServicoManutencao.acessDifeCheck || null,
            acessDifeObs: ordemServicoManutencao.acessDifeObs || null,
            servExtrCheck: ordemServicoManutencao.servExtrCheck || null,
            servExtrObs: ordemServicoManutencao.servExtrObs || null,
            casaComCheck: ordemServicoManutencao.casaComCheck || null,
            casaComObs: ordemServicoManutencao.casaComObs || null,
            status: ordemServicoManutencao.status || null,
            altura: ordemServicoManutencao.altura || null,
            voltagem: ordemServicoManutencao.voltagem || null
        },
        onSubmit: (values) => {
            const formattedValues = {
                ...values,
                fotoAmbCheck: values.fotoAmbCheck || null,
                fotoAmbObs: values.fotoAmbObs || null,
                ilumAmbCheck: values.ilumAmbCheck || null,
                ilumAmbObs: values.ilumAmbObs || null,
                acessDifeCheck: values.acessDifeCheck || null,
                acessDifeObs: values.acessDifeObs || null,
                servExtrCheck: values.servExtrCheck || null,
                servExtrObs: values.servExtrObs || null,
                casaComCheck: values.casaComCheck || null,
                casaComObs: values.casaComObs || null,
                cliente: values.cliente,
                pedidoOrcamento: values.pedidoOrcamento,
                tipoManutencaoCheck: values.tipoManutencaoCheck || null,
                serviceExecutados: values.serviceExecutados || null,
                servicoExecutar: values.servicoExecutar || null
            };
            onSubmit(formattedValues);
        },
        enableReinitialize: true,
        validationSchema: validationScheme
    });

    //status
    const osmCancelada = formik.values.status === 'Cancelada' || ordemServicoManutencao.status === 'Cancelada';
    const osmEncerrada = formik.values.status === 'Encerrada' || ordemServicoManutencao.status === 'Encerrada';

    useEffect(() => {
        if (idPedido) {
          handleSearchFichaContext(idPedido)
            
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idPedido]);

    //FICHA CONTEXT - VEM DA TELA DE FICHA
      const handleSearchFichaContext = async (query: string) => {
        try {
          if (query !== '') {
        
              const resultsFicha = await servicePedido.findPedidoCodigo(query);
        
              if (resultsFicha.id !== '') {
                const formattedResult = resultsFicha; 
                handleSelectPedido(formattedResult);
              }
              else {
                handleSelectPedido({});
              }
          }
          else {
            alert('Não Existe o Pedido Orçamento informado');
            throw new Error('Não Existe o Pedido Orçamento informado');
          }
        } catch (error) {
            alert("Erro ao buscar Pedido Orçamento: " + error);
          console.error("Erro ao buscar Pedido Orçamento: ", error);
        }
      };

    const irParaPedidoOrcamento = () => {
        const contexto = {
            idFichaVsIdOrdemMnt: formik.values.id ?? null,
            cliente: formik.values.cliente ?? null,
            enderecoCliente: formik.values.enderecoCliente ?? null,
            telefoneCliente: formik.values.telefoneCliente ?? null,
            tela: 'ORDEMSERVMNT'
        };
        
        // Atualizar os dados no contexto, sem a necessidade de uma função de atualização completa
        setOrcamentoData(contexto);  // Passa o objeto direto, já que o setOrcamentoData agora aceita objetos parciais
        
        // Navegar para a tela de pedido de orçamento
        router.push('/cadastros/pedidoOrcamento');
    };

    //relatorio
    const imprimirOrdemServMnt = (idOrdem: string) => {
        if (idOrdem) {
            // Exibir modal de carregamento
            exibirMensagem("Relatório sendo gerado, aguarde...", "loading");
    
            service.gerarRelatorioOrdemServicoManutencao(idOrdem)
                .then(blob => {
                    const fileUrl = URL.createObjectURL(blob);
                    window.open(fileUrl);
    
                    // Fechar modal ao concluir com sucesso
                    setModalVisivel(false);
                })
                .catch(() => {
                    exibirMensagem("Erro ao gerar o relatório, entre em contato com o suporte", "error");
                });
        } else {
            exibirMensagem("Erro ao gerar o relatório, entre em contato com o suporte", "error");
        }
    };
    

    const idPedidoSelecionado = useMemo(() => {
        return formik.values.pedidoOrcamento && formik.values.pedidoOrcamento?.id
          ? formik.values.pedidoOrcamento?.identificador
          : null;
      }, [formik.values.pedidoOrcamento]);
    
      const handleSearchPedido = async (query: string) => {
        const results = await servicePedido.findPedidosAutoComplete(query);
        return results
          .filter((item) => item.id !== undefined && item.id !== null)
          .map((item) => ({
            ...item,
            id: item.id ?? '',
          }));
      };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelectPedido = (item: any) => {
    // Atualiza o formulário com os valores do item selecionado
        formik.setFieldValue('pedidoOrcamento.id', item.id);
        formik.setFieldValue('pedidoOrcamento.status', item.status);
        formik.setFieldValue('pedidoOrcamento.identificador', item.identificador);
        formik.setFieldTouched("pedidoOrcamento.identificador", true, false);
        formik.setFieldValue('cliente.id', item.idCliente);
        formik.setFieldValue('cliente.nome', item.nomeTerceiro);
        formik.setFieldValue('telefoneCliente', item.telefoneCliente);
        formik.setFieldValue('enderecoCliente', item.enderecoCliente);
    };

    const exibirMensagem = (texto: string, tipo: 'success' | 'error' | 'loading') => {
        setModalMensagem(texto);
        setModalTipo(tipo);
        setModalVisivel(true);

        // Fechar automaticamente apenas mensagens de sucesso (não fechar "loading")
        if (tipo === 'success') {
            setTimeout(() => {
                setModalVisivel(false);
            }, 1500);
        }
    };
    

    return (
        <form 
            onSubmit={(e) => {
                e.preventDefault();
                formik.handleSubmit();
            }} 
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Impede que o Enter acione algo indesejado
                }
            }}
        >
            <div className="columns">
                {formik.values.id && (
                    <Input
                        id="numero"
                        name="numero"
                        label="Número: *"
                        value={formik.values.numero || ''}
                        columnClasses="column is-half"
                        autoComplete="off"
                        disabled
                    />
                )}
                <div className="column is-half">
                    <label htmlFor="status" className="label">Status: *</label>
                    <div className={`control dropdown-${formik.values.status || 'default'}`} /* Adiciona classe dinâmica ao contêiner com um fallback */> 
                        <Dropdown
                            id="status"
                            name="status"
                            value={formik.values.status}
                            options={statusOptions}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => formik.setFieldValue('status', e.value)}
                            placeholder="Selecione o status"
                            className="w-full custom-dropdown-height"
                            disabled={!podeCadastrar}
                        />
                    </div>
                    {formik.errors.status && (
                        <p className="help is-danger">{formik.errors.status}</p>
                    )}
                </div>
            </div>

            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <div className="columns">
                <AutoCompleteGenerico
                    id="idPedidoSelecionado"
                    name="idPedidoSelecionado"
                    label="Pedido Original: *"
                    value={idPedidoSelecionado || ''} // Usa o valor computado pelo useMemo
                    onSearch={(query) => handleSearchPedido(query)} // Chama a busca ao digitar
                    onSelect={(item) => handleSelectPedido(item)} // Atualiza o formulário ao selecionar
                    formatResult={(item) =>
                        `${item.identificador} - ${item.nomeTerceiro} - ${item.dataPedido} - ${item.status}`
                    }
                    placeholder="Digite o número do Pedido"
                    erro={(
                        formik.values.pedidoOrcamento?.identificador === '' ||
                        formik.values.pedidoOrcamento?.identificador === null ||
                        formik.values.pedidoOrcamento?.identificador === undefined) ? 'Campo Obrigatório' : ''}
                    disabled={!podeCadastrar || osmCancelada}
                />
            </div>

            <div className="columns">
                <Input
                    id="cliente"
                    name="cliente"
                    label="Cliente: *"
                    value={formik.values?.cliente?.id ? `${formik.values.cliente?.id} - ` + `${formik.values.cliente?.nome || ''}` : '' }
                    columnClasses="column"
                    autoComplete="off"
                    disabled
                />
            </div>

            <div className="columns">
                <Input
                    id="telefoneCliente"
                    name="telefoneCliente"
                    label="Telefone Cliente:"
                    value={formik.values.telefoneCliente || ''}
                    columnClasses="column"
                    autoComplete="off"
                    disabled
                />
                <Input
                    id="dataSolicitacaoManutencao"
                    label="Data de Solicitação Manutenção: *"
                    value={formik.values.dataSolicitacaoManutencao || ''}
                    columnClasses="column is-half"
                    onChange={formik.handleChange}
                    placeholder="Digite a Data de Solicitação de Manutenção"
                    autoComplete="off"
                    type='date'
                    erro={formik.errors.dataSolicitacaoManutencao}
                    disabled={!podeCadastrar || osmCancelada}
                />
            </div>

            <div className="columns">
                <Input
                    id="enderecoCliente"
                    name="enderecoCliente"
                    label="Endereço:"
                    value={formik.values?.enderecoCliente || ''}
                    columnClasses="column"
                    autoComplete="off"
                    disabled
                />
            </div>

            <div className="columns">
                <Input
                    id="produto"
                    name='produto'
                    label="Produto:"
                    value={formik.values.produto || ''}
                    columnClasses="column"
                    onChange={formik.handleChange}
                    placeholder="Digite o Produto"
                    autoComplete="off"
                    erro={formik.errors.produto}
                    disabled={!podeCadastrar || osmCancelada}
                />

                <Input
                    id="cor"
                    name='cor'
                    label="Cor:"
                    value={formik.values.cor || ''}
                    columnClasses="column"
                    onChange={formik.handleChange}
                    placeholder="Digite a Cor"
                    autoComplete="off"
                    erro={formik.errors.cor}
                    disabled={!podeCadastrar || osmCancelada}
                />
                <div className="column">
                    <label htmlFor="tipoManutencaoCheck" className="label">
                    Tipo de Manutenção:
                    </label>
                    <div className="control">
                        <div className="select is-fullwidth">
                            <select
                                id="tipoManutencaoCheck"
                                name="tipoManutencaoCheck"
                                value={formik.values.tipoManutencaoCheck || ''}
                                onChange={formik.handleChange}
                                disabled={!podeCadastrar || osmCancelada}
                            >
                                <option value="">Selecione uma opção</option>
                                <option value="Garantia">Garantia</option>
                                <option value="Eventual">Eventual</option>
                            </select>
                        </div>
                    </div>
                    {formik.errors.tipoManutencaoCheck && (
                    <p className="help is-danger">{formik.errors.tipoManutencaoCheck}</p>
                    )}
                </div>
            </div> 

            <div className="field">
                <label htmlFor="servicoExecutar" className="label">
                    Serviços a serem executados:
                </label>
                <textarea
                    className="textarea"
                    id="servicoExecutar"
                    name="servicoExecutar"
                    value={formik.values.servicoExecutar || ''}
                    placeholder="Digite os Serviços a serem Executados"
                    onChange={formik.handleChange}
                    disabled={!podeCadastrar || osmCancelada}
                ></textarea>
                {formik.errors.servicoExecutar && (
                    <p className="help is-danger">{formik.errors.servicoExecutar}</p>
                )}
            </div>

            <div className="columns">
                <div className="column cccccis-full">
                    <table className="table is-bordered is-striped is-hoverable is-fullwidth">
                        <thead>
                            <tr>
                                <th>Conferência do lugar de instalação</th>
                                <th>Sim/Não</th>
                                <th>Observação</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Foto do Ambiente</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        name="fotoAmbCheck"
                                        checked={formik.values.fotoAmbCheck === 'Sim'}
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                'fotoAmbCheck',
                                                e.target.checked ? 'Sim' : 'Não'
                                            )
                                        }
                                        disabled={!podeCadastrar || osmCancelada}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        className="textarea"
                                        name="fotoAmbObs"
                                        value={formik.values.fotoAmbObs || ''}
                                        onChange={formik.handleChange}
                                        placeholder="Digite a observação aqui..."
                                        disabled={!podeCadastrar || osmCancelada}
                                    ></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td>Iluminação do Ambiente</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        name="ilumAmbCheck"
                                        checked={formik.values.ilumAmbCheck === 'Sim'}
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                'ilumAmbCheck',
                                                e.target.checked ? 'Sim' : 'Não'
                                            )
                                        }
                                        disabled={!podeCadastrar || osmCancelada}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        className="textarea"
                                        name="ilumAmbObs"
                                        value={formik.values.ilumAmbObs || ''}
                                        onChange={formik.handleChange}
                                        placeholder="Digite a observação aqui..."
                                        disabled={!podeCadastrar || osmCancelada}
                                    ></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td>Acessórios Diferentes</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        name="acessDifeCheck"
                                        checked={formik.values.acessDifeCheck === 'Sim'}
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                'acessDifeCheck',
                                                e.target.checked ? 'Sim' : 'Não'
                                            )
                                        }
                                        disabled={!podeCadastrar || osmCancelada}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        className="textarea"
                                        name="acessDifeObs"
                                        value={formik.values.acessDifeObs || undefined}
                                        onChange={formik.handleChange}
                                        placeholder="Digite a observação aqui..."
                                        disabled={!podeCadastrar || osmCancelada}
                                    ></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td>Serviços Extras</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        name="servExtrCheck"
                                        checked={formik.values.servExtrCheck === 'Sim'}
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                'servExtrCheck',
                                                e.target.checked ? 'Sim' : 'Não'
                                            )
                                        }
                                        disabled={!podeCadastrar || osmCancelada}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        className="textarea"
                                        name="servExtrObs"
                                        value={formik.values.servExtrObs || ''}
                                        onChange={formik.handleChange}
                                        placeholder="Digite a observação aqui..."
                                        disabled={!podeCadastrar || osmCancelada}
                                    ></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td>Casa-Comércio em Obra</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        name="casaComCheck"
                                        checked={formik.values.casaComCheck === 'Sim'}
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                'casaComCheck',
                                                e.target.checked ? 'Sim' : 'Não'
                                            )
                                        }
                                        disabled={!podeCadastrar || osmCancelada}
                                    />
                                </td>
                                <td>
                                    <textarea
                                        className="textarea"
                                        name="casaComObs"
                                        value={formik.values.casaComObs || ''}
                                        onChange={formik.handleChange}
                                        placeholder="Digite a observação aqui..."
                                        disabled={!podeCadastrar || osmCancelada}
                                    ></textarea>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="columns">
                <Input
                    id="voltagem"
                    label="Voltagem: "
                    value={formik.values.voltagem || ''}
                    columnClasses="column is-half"
                    type="text"
                    onChange={formik.handleChange}
                    placeholder="Digite a Voltagem"
                    autoComplete="off"
                    disabled={!podeCadastrar || osmCancelada}
                />
                <Input
                    id="altura"
                    label="Altura: "
                    value={formik.values.altura || ''}
                    columnClasses="column is-half"
                    onChange={formik.handleChange}
                    placeholder="Digite a Altura da Instalação"
                    autoComplete="off"
                    type='text'
                    disabled={!podeCadastrar || osmCancelada}
                />
            </div>

            <div className="field">
                <label htmlFor="serviceExecutados" className="label">
                    Serviços executados:
                </label>
                <textarea
                    className="textarea"
                    id="serviceExecutados"
                    name="serviceExecutados"
                    value={formik.values.serviceExecutados || ''}
                    placeholder="Digite os Serviços Executados"
                    onChange={formik.handleChange}
                    disabled={!podeCadastrar || osmCancelada}
                ></textarea>
                {formik.errors.serviceExecutados && (
                    <p className="help is-danger">{formik.errors.serviceExecutados}</p>
                )}
            </div>

            <div className="field is-grouped">
                <ButtonType 
                    label={formik.values.id ? 'Atualizar' : 'Salvar'}
                    className='button is-link'
                    type="submit"
                    disabled={!formik.dirty || !formik.isValid || !idPedidoSelecionado || !podeCadastrar}
                    />
                <ButtonType 
                    label={"Voltar"}
                    type="button"
                    className='button'
                    onClick={() => router.push("/consultas/ordemServicoManutencao")}
                />
                {formik.values.id &&
                    <>
                        <ButtonType 
                            label={"Ir para Pedido de Orçamento"}
                            type="button"
                            className='button'
                            onClick={irParaPedidoOrcamento}
                            disabled={!podeCadastrar || !osmEncerrada}
                        />
                        <ButtonType 
                            label={"Imprimir"}
                            type="button"
                            className='button'
                            disabled={!formik.values.id || !relatorio?.podeConsultar || osmCancelada}
                            style={{ 
                                padding: '10px 20px', 
                                fontSize: '1rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                transition: 'background 0.3s' 
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#ff3860'}
                            onMouseOut={(e) => e.currentTarget.style.background = ''}
                            onClick={() => imprimirOrdemServMnt(formik.values.id || ordemServicoManutencao.id || '')}
                        />
                    </>
                }
            </div>
        </form>
    );
};
