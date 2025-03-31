import { Suspense } from 'react';
import { CadastroUnidadesMedida } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroUnidadesMedida />
    </Suspense>
  );
}