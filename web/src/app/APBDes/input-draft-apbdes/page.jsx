import { Suspense } from 'react';
import InputDraftAPBDes from './formPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InputDraftAPBDes />
    </Suspense>
  );
}
