import { Suspense } from 'react';
import { ListagemUnidadesMedida } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ListagemUnidadesMedida />
    </Suspense>
  );
}