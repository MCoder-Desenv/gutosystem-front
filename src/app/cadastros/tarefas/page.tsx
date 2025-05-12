import { Suspense } from 'react';
import { CadastroTarefas } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroTarefas />
    </Suspense>
  );
}