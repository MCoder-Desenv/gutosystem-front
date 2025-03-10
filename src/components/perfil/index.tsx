'use client'
import { Layout } from "../layout"
import { PerfilForm } from "./form"
import { useEffect, useRef, useState } from "react";
import { useUsuarioService } from "../../app/services";
import { ModalCard } from "../common/modal";
import { Perfil } from "../../app/models/usuarios";
import { useSession } from "next-auth/react";

export const VisualizaPerfil: React.FC = () => {

    const [perfil, setPerfil] = useState<Perfil>({
        id: '',
        email: '',
        name: ''
    });
    const service = useUsuarioService();
    const serviceRef = useRef(service);
    const searchParams = useSession();
    const queryId = searchParams.data?.user?.id; // Obtém o ID da query

    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error'>('success');

    useEffect(() => {
        const id = queryId;
        if (id !== '' && id !== null && id !== undefined ) {
            serviceRef.current.findPerfil(id).then(perRetorna => {
    
                setPerfil((prevState) => ({
                    ...prevState,
                    ...perRetorna,
                    id: perRetorna.data.id,
                    email: perRetorna.data.email || null,
                    name: perRetorna.data.name || null
                }));
            });
        }
    }, [queryId]);

    const handleSubmit = (perfil: Perfil) => {
        service.atualizarPerfil(perfil.id || '', perfil, perfil.senhaAnterior || '', perfil.senhaNova || '')
            .then(() => {
                service.findPerfil(perfil.id || '').then((perfAtualizado) => {
                    setPerfil({ ...perfAtualizado.data}); // Reseta os campos de senha
                });
                exibirMensagem('Perfil atualizado com sucesso!', 'success');
            })
            .catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            });
    };
    

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
        <Layout titulo="Perfil">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <PerfilForm perfil={perfil}  onSubmit={handleSubmit}/>
        </Layout>
    )
}