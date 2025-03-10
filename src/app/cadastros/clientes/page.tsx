import { Suspense } from 'react';
import { CadastroClientes } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroClientes />
    </Suspense>
  );
}