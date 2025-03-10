import { Suspense } from 'react';
import { ListagemClientes } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ListagemClientes />
    </Suspense>
  );
}