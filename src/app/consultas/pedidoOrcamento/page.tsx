import { Suspense } from 'react';
import { ListagemPedidoOrcamento } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ListagemPedidoOrcamento />
    </Suspense>
  );
}