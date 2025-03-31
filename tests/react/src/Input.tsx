'use client';

import { useState } from 'react';

import { MyInput, MyInputScoped } from 'component-library-react';

export function InputShadow() {
  const [inputEvent, setInputEvent] = useState<string>('');
  const [changeEvent, setChangeEvent] = useState<string>('');
  return (
    <>
      <MyInput
        onMyInput={(ev) => setInputEvent(`${ev.target.value}`)}
        onMyChange={(ev) => setChangeEvent(`${ev.detail.value}`)}
      >
        {' '}
      </MyInput>
      <div className="inputResult">
        <p>Shadow Input Event: {inputEvent}</p>
        <p>Shadow Change Event: {changeEvent}</p>
      </div>
    </>
  );
}

export function InputScoped() {
  const [inputEvent, setInputEvent] = useState<string>('');
  const [changeEvent, setChangeEvent] = useState<string>('');
  return (
    <>
      <MyInputScoped
        onMyInput={(ev) => setInputEvent(`${ev.target.value}`)}
        onMyChange={(ev) => setChangeEvent(`${ev.detail.value}`)}
      >
        {' '}
      </MyInputScoped>
      <div className="inputResult">
        <p>Scoped Input Event: {inputEvent}</p>
        <p>Scoped Change Event: {changeEvent}</p>
      </div>
    </>
  );
}
