import { Suspense } from 'react';
import { CadastroOrdemServicoManutencao } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroOrdemServicoManutencao />
    </Suspense>
  );
}