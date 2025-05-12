import { Suspense } from 'react';
import { CalendarioView } from '../../../components';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CalendarioView />
    </Suspense>
  );
}