import { Suspense } from 'react';
import { CadastroFuncoes } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroFuncoes />
    </Suspense>
  );
}