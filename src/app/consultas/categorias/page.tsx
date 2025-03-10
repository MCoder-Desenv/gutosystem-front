import { Suspense } from 'react';
import { ListagemCategorias } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ListagemCategorias />
    </Suspense>
  );
}