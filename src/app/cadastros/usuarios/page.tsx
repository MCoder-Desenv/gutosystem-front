import { Suspense } from 'react';
import { CadastroUsuarios } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroUsuarios />
    </Suspense>
  );
}