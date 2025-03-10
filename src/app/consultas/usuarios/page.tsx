import { Suspense } from 'react';
import { ListagemUsuarios } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ListagemUsuarios />
    </Suspense>
  );
}