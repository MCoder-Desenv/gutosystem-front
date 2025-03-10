import { Suspense } from 'react';
import { CadastroProdutos } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroProdutos />
    </Suspense>
  );
}