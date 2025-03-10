"use client"
import { RelatoriosForm } from "../../../app/models/relatorios";
import { useOrdemServicoManutencaoService } from "../../../app/services";
import { formatDateToBackend } from "../../../app/util/formatData";
import { AutoCompleteGenerico } from "../../common";
import { ModalCard } from "../../common/modal";
import { Layout } from "../../layout";
import { useFormik } from "formik";
import { useMemo, useState } from "react";

export const RelatoriosOrdemServicoManutencao: React.FC = () => {

    //services
    const service = useOrdemServicoManutencaoService();
    
    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');

    const handelSubmit = (formData: RelatoriosForm) => {
        if (formData?.ordemMnt?.id !== '' && formData?.ordemMnt?.id !== null && formData?.ordemMnt?.id !== undefined) {
            exibirMensagem("Relatório sendo gerado, aguarde...", "loading");
            service.gerarRelatorioOrdemServicoManutencao(formData.ordemMnt.id).then(blob => {
                if (blob) {  // Verifica se blob não é null
                    const fileUrl = URL.createObjectURL(blob);
                    window.open(fileUrl);
                    setModalVisivel(false);
                    exibirMensagem("Relatório gerado com sucesso", "success");
                } else {
                    exibirMensagem("Erro: O serviço retornou um blob inválido, entre em contato com o suporte", "error");
                }
            }).catch(error => {
                exibirMensagem("Erro ao gerar o relatório, entre em contato com o suporte" + error, "error");
            });
        } else {
            exibirMensagem("Erro: Ordem de Serviço Manutenção Inválida", "error");
        }
    };

    const formik = useFormik<RelatoriosForm>({
        onSubmit: handelSubmit,
        initialValues:{id: null}
    })

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

    //ORDEM SERVIÇO ORÇAMENTO
    const ordemServicoSelecionado = useMemo(() => {
    return formik.values.ordemMnt && formik.values.ordemMnt?.id
        ? formik.values.ordemMnt
        : null;
    }, [formik.values.ordemMnt]);

    const handleSearchOrdemServMnt = async (query: string) => {
        const results = await service.findOrdemServMntPedido(query); // Substitua com sua função de busca
        return results
          .filter((item) => item.id !== undefined && item.id !== null)
          .map((item) => ({
          ...item,
          id: item.id ?? '',
        }));
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelectOrdem = (item: any) => {
      // Atualiza o formulário com os valores do item selecionado
      formik.setFieldValue("ordemMnt.id", item?.id);
      formik.setFieldValue("ordemMnt.numero", item?.numero);
      formik.setFieldValue("ordemMnt.idCliente", item?.idCliente);
      formik.setFieldValue("ordemMnt.nomeCliente", item?.nomeCliente);
      formik.setFieldValue("ordemMnt.dataSolicitacaoManutencao", item?.dataSolicitacaoManutencao);
      formik.setFieldValue("ordemMnt.status", item?.status);
    };

    return (
        <Layout titulo="Relátorios de Ficha Orçamento">
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
                    <AutoCompleteGenerico
                    id="ordemServicoSelecionado"
                    name="ordemServicoSelecionado"
                    label="Ordem Serviço Manutenção: *"
                    value={
                        ordemServicoSelecionado
                        ? `${ordemServicoSelecionado.numero} - ${ordemServicoSelecionado.idCliente} - ${ordemServicoSelecionado?.nomeCliente}`
                        : ''
                    } // Usa o valor formatado corretamente
                    onSearch={(query) => {
                        const trimmedQuery = query.trim();
                        return handleSearchOrdemServMnt(trimmedQuery); // 🔹 Retorna a Promise
                    }}
                    onSelect={(item) => handleSelectOrdem(item)}
                    formatResult={(item) => `${item.numero} - ${item.idCliente} - ${item.nomeCliente} - ${formatDateToBackend(item?.dataSolicitacaoManutencao || '')}`}
                    placeholder="Digite"
                    />
                </div>
                <div className="field is-grouped">
                <div className="control is-link">
                    <button
                        type="submit"
                        className="button is-link"
                    >
                        Gerar Relatório
                    </button>
                </div>
            </div>
            </form>
        </Layout>
    );
}