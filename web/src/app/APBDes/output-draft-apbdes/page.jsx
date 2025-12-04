
import { Suspense } from 'react';
import OutputAPBDes from './formPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OutputAPBDes />
    </Suspense>
  );
}
