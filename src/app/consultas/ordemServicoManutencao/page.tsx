import { Suspense } from 'react';
import { ListagemOrdemServicoManutencao } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ListagemOrdemServicoManutencao />
    </Suspense>
  );
}