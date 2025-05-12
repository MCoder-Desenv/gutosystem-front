'use client'
import { Layout } from "../../../components/layout"
import { TarefasForm } from "./form"
import { useState } from "react";
import { useTarefaService } from "../../../app/services";
import { ModalCard } from "../../../components/common/modal";
import { CadastroTarefa } from "../../../app/models/tarefa";

export const CadastroTarefas: React.FC = () => {
    const service = useTarefaService();
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState("");
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');
    const [tarefas, setTarefas] = useState<CadastroTarefa[]>([]);

    const handleSubmit = (tarefas: CadastroTarefa[]) => {
        exibirMensagem("Tarefas sendo salvas, aguarde...", "loading");
        console.log(tarefas)
        service.criarTarefas(tarefas).then(() => {
            setModalVisivel(false);
            //setTarefas([])
            exibirMensagem('Tarefas cadastradas com sucesso!', 'success');
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
        <Layout titulo="Tarefas" wide>
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <TarefasForm tarefas={tarefas} onSubmit={handleSubmit}/>
        </Layout>
    )
}