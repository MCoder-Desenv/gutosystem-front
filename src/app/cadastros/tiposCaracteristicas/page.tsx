import { Suspense } from 'react';
import { CadastroTiposCaracteristicas } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroTiposCaracteristicas />
    </Suspense>
  );
}