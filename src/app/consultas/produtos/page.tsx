import { Suspense } from 'react';
import { ListagemProdutos } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ListagemProdutos />
    </Suspense>
  );
}