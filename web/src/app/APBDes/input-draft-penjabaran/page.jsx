import { Suspense } from 'react';
import InputDraftPenjabaran from './formPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InputDraftPenjabaran />
    </Suspense>
  );
}
