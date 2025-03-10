'use client'
import { Layout } from "../../layout"
import { CategoriaForm } from "./form"
import { useEffect, useRef, useState } from "react";
import { useCategoriaService } from "../../../app/services";
import { useSearchParams } from "next/navigation"
import { ModalCard } from "../../common/modal";
import { Categoria } from "../../../app/models/categorias";

export const CadastroCategorias: React.FC = () => {

    const [categorias, setCategorias] = useState<Categoria>({
        id: '',
        nome: '',
        dataCadastro: '',
        status: ''
    });
    const service = useCategoriaService();
    const serviceRef = useRef(service);
    const searchParams = useSearchParams();
    const queryId = searchParams.get('id'); // Obtém o ID da query

    //mensagem
    const [modalVisivel, setModalVisivel] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState<'success' | 'error' | 'loading'>('success');

    useEffect(() => {
        const id = queryId;
        if (id !== '' && id !== null && id !== undefined ) {
            serviceRef.current.carregarCategoria(id).then(catRetorna => {
    
                setCategorias((prevState) => ({
                    ...prevState,
                    ...catRetorna,
                    id: catRetorna.data.id || null,
                    nome: catRetorna.data.nome || null,
                    dataCadastro: catRetorna.data.dataCadastro || null,
                    status: catRetorna.data.status || null
                }));
            }).catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            });
        }
    }, [queryId]);

    const handleSubmit = (cat: Categoria) => {

        if (cat.id) {
            exibirMensagem("Categoria sendo atualizada, aguarde...", "loading");
            service.atualizar(cat).then(() => {
                service.carregarCategoria(cat.id || '').then((catAtualizada) => {
                    setCategorias(catAtualizada.data); // Atualiza o estado com a ficha atualizada
                });
                setModalVisivel(false);
                exibirMensagem('Categorias atualizada com sucesso!', 'success');
            })
            .catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            });
        }
        else {
            exibirMensagem("Categoria sendo salva, aguarde...", "loading");
            service.salvar(cat)
                .then(catSalva => {
                    setCategorias(catSalva.data);
                    setModalVisivel(false);
                    exibirMensagem('Categoria salva com sucesso!', 'success');
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
        <Layout titulo="Cadastro de Categorias">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <CategoriaForm categoria={categorias}  onSubmit={handleSubmit}/>
        </Layout>
    )
}