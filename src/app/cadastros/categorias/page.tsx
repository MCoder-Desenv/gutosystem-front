import { Suspense } from "react";
import { CadastroCategorias } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastroCategorias />
    </Suspense>
  );
}