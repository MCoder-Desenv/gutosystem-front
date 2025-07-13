import { Suspense } from 'react';
import { CadastroTarefa } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroTarefa />
    </Suspense>
  );
}