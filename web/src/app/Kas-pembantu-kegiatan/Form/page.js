import { Suspense } from "react";
import FormPage from "./formPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormPage />
    </Suspense>
  );
}

