import { Suspense } from 'react';
import { ListagemTiposCaracteristicas } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ListagemTiposCaracteristicas />
    </Suspense>
  );
}