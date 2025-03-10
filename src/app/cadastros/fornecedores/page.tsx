import { Suspense } from 'react';
import { CadastroFornecedores } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroFornecedores />
    </Suspense>
  );
}