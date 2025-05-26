import { Suspense } from 'react';
import { ListagemTarefa } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ListagemTarefa />
    </Suspense>
  );
}