'use client'
import { Produto } from "@/app/models/produtos"
import { Layout } from "@/components/layout"
import { ProdutosForm } from "./form"
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useProdutoService } from "@/app/services"
import { ModalCard } from "@/components/common/modal"

export const CadastroProdutos: React.FC = () => {

    const [produto, setProduto] = useState<Produto>({
        id: '',
        descricao: '',
        status: '',
        categoria:{}
    });
    const service = useProdutoService();
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
            serviceRef.current.carregarProduto(id).then(produtoRetorna => {
                setProduto({
                    ...produtoRetorna,
                    id: produtoRetorna.data.id || '',
                    categoria: produtoRetorna.data.categoria || {},
                    descricao: produtoRetorna.data.descricao || null,
                    status: produtoRetorna.data.status || null
                });
            })
            .catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            });
        }
    }, [queryId]);
    
    const handleSubmit = (produto: Produto) => {
        if (produto.id) {
            exibirMensagem("Produto sendo Atualizado, aguarde...", "loading");
            service.atualizar(produto).then(() => {
                setModalVisivel(false);
                exibirMensagem('Produto Atualizado com Sucesso!!', 'success');
            })
            .catch((error) => {
                exibirMensagem(error.message, 'error'); // Exibindo a mensagem para o usuário
            });
        }
        else {
            exibirMensagem("Produto sendo Salvo, aguarde...", "loading");
            service.salvar(produto)
                .then(prodSalvo => {
                    setProduto(prodSalvo.data);
                    setModalVisivel(false);
                    exibirMensagem('Produto Salvo com sucesso!', 'success');
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
        <Layout titulo="Produtos">
            {modalVisivel && (
                <ModalCard 
                    mensagem={modalMensagem} 
                    tipo={modalTipo} 
                    tempoAutoFechamento={modalTipo === 'success' ? 1500 : 0} 
                    onClose={() => setModalVisivel(false)}
                />
            )}
            <ProdutosForm produto={produto} onSubmit={handleSubmit}/>
        </Layout>
    )
}