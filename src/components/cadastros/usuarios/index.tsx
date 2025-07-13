'use client'
import { Layout } from "../../../components/layout"
import { UsuariosForm } from "./form"
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useUsuarioService } from "../../../app/services"
import { ModalCard } from "../../../components/common/modal"
import { Usuarios } from "../../../app/models/usuarios"

export const CadastroUsuarios: React.FC = () => {

    const [usuarios, setUsuarios] = useState<Usuarios>({
        id: '',
        email: '',
        name: '',
        role: '',
        password: '',
    });
    
    const service = useUsuarioService();
    const searchParams = useSearchParams();
    const queryId = searchParams.get('id'); // Obtém o ID da query

    const serviceRef = useRef(service);

    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');

    useEffect(() => {
        const id = parseInt(queryId || '0', 10);
        if (id !== 0 && id !== null && id !== undefined ) {
            serviceRef.current.carregarUsuario(id).then(userRetorna => {
                setUsuarios({
                    ...userRetorna,
                    id: userRetorna.data.id || '',
                    email: userRetorna.data.email || null,
                    name: userRetorna.data.name || null,
                    role: userRetorna.data.role || null,
                    usuarioFuncionario: userRetorna.data.usuarioFuncionario ? {
                       ...userRetorna.data.usuarioFuncionario,
                        funcionario: userRetorna.data.usuarioFuncionario.funcionario || null
                    }
                    : { id: '', funcionario: null },
                    usuariosFuncoes: userRetorna.data.usuariosFuncoes || []
                });
            });
        }
    }, [queryId]);
    
    const handleSubmit = (user: Usuarios) => {
        console.log('teste user: ', user)
        if (user.id) {
            exibirMensagem("Usuário sendo Atualizado, aguarde...", "loading");
            service.atualizar(user).then(() => {
                service.carregarUsuario(parseInt(user.id || '0')).then((userAtualizado) => {
                    setUsuarios(userAtualizado.data); // Atualiza o estado com a ficha atualizada
                });
                setModalVisivel(false);
                exibirMensagem('Usuário Atualizado com Sucesso!!', 'success');
            })
            .catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            });
        }
        else {
            exibirMensagem("Usuário sendo Salvo, aguarde...", "loading");
            service.salvar(user)
                .then(userSalvo => {
                    setUsuarios(userSalvo.data);
                    setModalVisivel(false);
                    exibirMensagem('Usuário salvo com sucesso!', 'success');
                })
                .catch((error) => {
                    exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
                });
        }
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
        <Layout titulo="Usuarios">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <UsuariosForm usuarios={usuarios} onSubmit={handleSubmit}/>
        </Layout>
    )
}