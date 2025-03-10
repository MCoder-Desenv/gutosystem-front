import { Suspense } from 'react';
import { ListagemFichaOrcamento } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ListagemFichaOrcamento />
    </Suspense>
  );
}