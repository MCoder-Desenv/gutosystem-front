import { Suspense } from 'react';
import { CadastroFichaOrcamento } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroFichaOrcamento />
    </Suspense>
  );
}