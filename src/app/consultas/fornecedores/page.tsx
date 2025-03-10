import { Suspense } from 'react';
import { ListagemFornecedores } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ListagemFornecedores />
    </Suspense>
  );
}