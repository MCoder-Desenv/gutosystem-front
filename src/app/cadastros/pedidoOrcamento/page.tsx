import { Suspense } from 'react';
import { CadastroPedidoOrcamento } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroPedidoOrcamento />
    </Suspense>
  );
}