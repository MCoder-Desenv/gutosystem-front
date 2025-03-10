import { Suspense } from 'react';
import { CadastroFuncionarios } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroFuncionarios />
    </Suspense>
  );
}