import { Suspense } from 'react';
import { RecuperacaoPedido } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RecuperacaoPedido />
    </Suspense>
  );
}