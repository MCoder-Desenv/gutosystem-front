import { Suspense } from 'react';
import { ListagemFuncionarios } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ListagemFuncionarios />
    </Suspense>
  );
}