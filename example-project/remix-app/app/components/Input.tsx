import { useState } from 'react';

import { MyInput } from 'component-library-react';

function Input() {
  const [inputEvent, setInputEvent] = useState<string>('');
  const [changeEvent, setChangeEvent] = useState<string>('');
  return (
    <>
      <MyInput
        onMyInput={(ev: CustomEvent) => setInputEvent(`${ev.detail.data}`)}
        onMyChange={(ev: CustomEvent) => setChangeEvent(`${ev.detail.value}`)}
      />
      <div>
        <p>Input Event: {inputEvent}</p>
        <p>Change Event: {changeEvent}</p>
      </div>
    </>
  );
}

export default Input;
