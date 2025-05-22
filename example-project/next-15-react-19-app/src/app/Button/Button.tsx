'use client';

import { useState } from 'react';

import { MyButton, MyComponent } from 'component-library-react';

function Button() {
  const [inputEvent, setInputEvent] = useState<number>(0);
  return (
    <>
      <MyButton href="#" onClick={() => setInputEvent(inputEvent + 1)}>
        Click me <b key={1}>now</b>!
        <MyComponent
          key={2}
          first="Stencil"
          last="'Don't call me a framework' JS"
          style={{ backgroundColor: 'red' }}
        >
          Hello
        </MyComponent>
      </MyButton>
      <div className="buttonResult">
        <p>Input Event: {inputEvent}</p>
      </div>
    </>
  );
}

export default Button;
