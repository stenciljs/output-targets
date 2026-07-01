'use client';

import { useState } from 'react';

import { MyCheckbox } from 'component-library-react';

/**
 * Regression fixture: setting `className` on a wrapped Stencil component used to
 * wipe the classes the runtime manages on the host (`hydrated`, mode,
 * `interactive`). Form libraries drive Ionic's validation classes through
 * `className`, so the app's classes have to coexist with the runtime's.
 */
export function ClassNameMerge() {
  const [applied, setApplied] = useState(false);
  return (
    <>
      <MyCheckbox className={applied ? 'ion-invalid ion-touched' : ''}>Checkbox Label</MyCheckbox>
      <button className="apply-classes" onClick={() => setApplied(true)}>
        Apply validation classes
      </button>
      <button className="remove-classes" onClick={() => setApplied(false)}>
        Remove validation classes
      </button>
    </>
  );
}
