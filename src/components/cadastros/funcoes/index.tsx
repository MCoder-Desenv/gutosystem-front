'use client'
import { Layout } from "@/components/layout"
import { FuncoesForm } from "./form"
import { useEffect, useState } from "react";
import { useFuncoesService } from "@/app/services";
import { ModalCard } from "@/components/common/modal";
import { Funcao } from "@/app/models/funcoes";

export const CadastroFuncoes: React.FC = () => {
    const service = useFuncoesService();
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState("");
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');
    const [funcoes, setFuncoes] = useState<Funcao[]>([]);

    useEffect(() => {
        const carregarFuncoes = async () => {
          try {
            const result = await service.findAllFuncoes();
            // Ajustar os dados para garantir que os filhos sejam incluídos corretamente
            const funcoesFormatadas = result.map((item: Funcao) => ({
              ...item
            }));
      
            setFuncoes(funcoesFormatadas);
          } catch (error) {
            exibirMensagem('Erro ao carregar Funções: ' + error, 'error');
          }
        };
      
        carregarFuncoes();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

    const handleSubmit = (funcoes: Funcao[]) => {
        exibirMensagem("Funções sendo atualizada, aguarde...", "loading");
        service.salvar(funcoes).then(() => {
            
            service.findAllFuncoes().then((func) => {
                setFuncoes(func);
                setModalVisivel(false);
                exibirMensagem('Funções atualizadas com sucesso!', 'success');
            });
        })
        .catch((error) => {
            exibirMensagem(error?.data, 'error'); // Exibindo a mensagem para o usuário
        });
        
    }

    const exibirMensagem = (texto: string, tipo: 'success' | 'error' | 'loading') => {
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
        <Layout titulo="Funções">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <FuncoesForm funcoes={funcoes}  onSubmit={handleSubmit}/>
        </Layout>
    )
}