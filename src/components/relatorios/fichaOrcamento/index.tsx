"use client"
import { RelatoriosForm } from "@/app/models/relatorios";
import { useFichaOrcamentoService } from "@/app/services";
import { formatDateToBackend } from "@/app/util/formatData";
import { AutoCompleteGenerico } from "@/components/common";
import { ModalCard } from "@/components/common/modal";
import { Layout } from "@/components/layout";
import { useFormik } from "formik";
import { useMemo, useState } from "react";


export const RelatoriosFichaOrcamento: React.FC = () => {

    //services
    const service = useFichaOrcamentoService();

    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');

    const handelSubmit = (formData: RelatoriosForm) => {
        if (formData?.ficha?.id) {
            exibirMensagem("Relatório sendo gerado, aguarde...", "loading");
            service.gerarRelatorioFichaOrcamento(formData.ficha.id).then(blob => {
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
            exibirMensagem("Erro: Ficha Inválida", "error");
        }
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
    

    const formik = useFormik<RelatoriosForm>({
        onSubmit: handelSubmit,
        initialValues:{id: null}
    })

    const fichaSelecionada = useMemo(() => {
        return formik.values.ficha && formik.values.ficha?.id
          ? formik.values.ficha
          : null;
      }, [formik.values.ficha]);

    const handleSearchFicha = async (query: string, tipo: "codigo" | "nome") => {
        let results
    
        if (tipo === 'codigo') {
            results = await service.findFichasPedido('', query);
        }
        else {
            results = await service.findFichasPedido(query, '');
        }
    
        return results
        .filter((item) => item.id !== undefined && item.id !== null)
        .map((item) => ({
        ...item,
        id: item.id ?? '',
        }));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelectFicha = (item: any) => {
        // Atualiza o formulário com os valores do item selecionado
        formik.setFieldValue("ficha", item);
        formik.setFieldValue("ficha.id", item?.id);
        formik.setFieldValue("ficha.idCliente", item?.idCliente);
        formik.setFieldValue("ficha.nomeCliente", item.nomeCliente);
        formik.setFieldValue("ficha.dataSolicitacaoCliente", item?.dataSolicitacaoCliente);
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
                    id="fichaSelecionada"
                    name="fichaSelecionada"
                    label="Ficha Orçamento: *"
                    value={
                        fichaSelecionada
                        ? `${fichaSelecionada.id} - ${fichaSelecionada.idCliente} - ${fichaSelecionada.nomeCliente} - ${formatDateToBackend(fichaSelecionada?.dataSolicitacaoCliente || '')}`
                        : ''
                    } // Usa o valor formatado corretamente
                    onSearch={(query) => {
                        const trimmedQuery = query.trim();
                    
                        if (/^\d+$/.test(trimmedQuery)) {
                        return handleSearchFicha(trimmedQuery, "codigo"); // 🔹 Retorna a Promise
                        } else {
                        return handleSearchFicha(trimmedQuery, "nome"); // 🔹 Retorna a Promise
                        }
                    }}
                    onSelect={(item) => handleSelectFicha(item)}
                    formatResult={(item) => `${item.id} - ${item.idCliente} - ${item.nomeCliente} - ${formatDateToBackend(item?.dataSolicitacaoCliente || '')}`}
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