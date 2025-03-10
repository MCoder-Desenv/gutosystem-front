"use client"
import { RelatoriosForm } from "@/app/models/relatorios";
import { usePedidoOrcamentoService } from "@/app/services";
import { formatDateToBackend } from "@/app/util/formatData";
import { AutoCompleteGenerico } from "@/components/common";
import { ModalCard } from "@/components/common/modal";
import { Layout } from "@/components/layout";
import { useFormik } from "formik";
import { useMemo, useState } from "react";


export const RelatoriosPedidoOrcamento: React.FC = () => {

    //services
    const service = usePedidoOrcamentoService();

    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');

    const [tipoRelatorio, setTipoRelatorio] = useState<string>("");

    const handelSubmit = (formData: RelatoriosForm) =>{
        if (formData?.pedido?.id !== '' && formData?.pedido?.id !== null && formData?.pedido?.id !== undefined) {
            if (tipoRelatorio === 'informacoesRastreamento') {
                exibirMensagem("Relatório sendo gerado, aguarde...", "loading");
                service.gerarRelatorioInformacaoComplementar(formData?.pedido?.id).then(blob => {
                    const fileUrl = URL.createObjectURL(blob);
                    window.open(fileUrl);
                    setModalVisivel(false);
                    exibirMensagem("Relatório gerado com sucesso", "success");
                }).catch(error => {
                    exibirMensagem("Erro ao gerar o relatório, entre em contato com o suporte" + error, "error");
                });
            }
            else if (tipoRelatorio === 'pedidoOrcamento') {
                exibirMensagem("Relatório sendo gerado, aguarde...", "loading");
                service.gerarRelatorioPedidoOrcamento(formData?.pedido?.id).then(blob => {
                    const fileUrl = URL.createObjectURL(blob);
                    window.open(fileUrl);
                    setModalVisivel(false);
                    exibirMensagem("Relatório gerado com sucesso", "success");

                }).catch(error => {
                    exibirMensagem("Erro ao gerar o relatório, entre em contato com o suporte" + error, "error");
                });
            }
            else {
                exibirMensagem("Erro ao gerar o relatório, nenhum opção de relatório foi selecionada", "error");
            }
            
        }
        else {
            exibirMensagem("Erro: Pedido de Orçamento Inválido", "error");
        }
        
    }

    const formik = useFormik<RelatoriosForm>({
        onSubmit: handelSubmit,
        initialValues:{id: null}
    })

    const idPedidoSelecionado = useMemo(() => {
        return formik.values.pedido && formik.values.pedido?.id
        ? formik.values.pedido?.identificador
        : null;
    }, [formik.values.pedido]);
        
    const handleSearchPedido = async (query: string) => {
        const results = await service.findPedidosAutoComplete(query);
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
        formik.setFieldValue('pedido.id', item.id);
        formik.setFieldValue('pedido.identificador', item.identificador);
        formik.setFieldTouched("pedido.status", item.identificador);
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
        <Layout titulo="Relátorios de Pedido Orçamento">
            <form  onSubmit={formik.handleSubmit} >
                {modalVisivel && (
                    <ModalCard 
                        mensagem={modalMensagem} 
                        tipo={modalTipo} 
                        tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                        onClose={() => setModalVisivel(false)}
                    />
                )}
                <div className="columns">
                    <div className="column">
                        <div className="field">
                            <label htmlFor="tipoRelatorio" className="label">
                                Selecione o Tipo de Relatório: *
                            </label>
                            <div className="control">
                                <div className="select is-fullwidth">
                                    <select
                                        id="tipoRelatorio"
                                        name="tipoRelatorio"
                                        value={tipoRelatorio}
                                        onChange={(e) => {
                                            setTipoRelatorio(e.target.value);
                                            formik.setFieldValue("tipoRelatorio", e.target.value);
                                        }}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="pedidoOrcamento">Pedido Orçamento</option>
                                        <option value="informacoesRastreamento">Informações de Rastreamento</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="columns">
                    <AutoCompleteGenerico
                        id="idPedidoSelecionado"
                        name="idPedidoSelecionado"
                        label="Pedido Original: *"
                        value={idPedidoSelecionado || ''} // Usa o valor computado pelo useMemo
                        onSearch={(query) => handleSearchPedido(query)} // Chama a busca ao digitar
                        onSelect={(item) => handleSelectPedido(item)} // Atualiza o formulário ao selecionar
                        formatResult={(item) =>
                            `${item.identificador} - ${item.nomeTerceiro} - ${formatDateToBackend(item.dataPedido || '')} - ${item.status}`
                        }
                        placeholder="Digite o número do Pedido"
                    />
                </div>
                <div className="field is-grouped">
                <div className="control is-link">
                    <button
                        type="submit"
                        className="button is-link"
                        //onClick={() => formik.handleSubmit()}
                    >
                        Gerar Relatório
                    </button>
                </div>
            </div>
            </form>
        </Layout>
    );
}