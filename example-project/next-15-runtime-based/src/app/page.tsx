import {
  MyComponent,
  MyRange,
  MyCounter,
  MyRadioGroup,
  MyRadio,
  MyTransformTest,
} from 'component-library-react/next';
import Input from './Input/Input';
import Button from './Button/Button';
import { ToggleableContent } from './ToggleableContent/ToggleableContent';

function getStuff() {
  return 'I am random value!';
}

export default function Home() {
  return (
    <>
      <Input />
      <hr />
      <Button />
      <hr />
      <MyComponent
        first="Stencil"
        middleName={getStuff()}
        last="'Don't call me a framework' JS"
        className="my-8"
      />
      <hr />
      <MyRange name="myRange">Hello World</MyRange>
      <ToggleableContent />
      <hr />
      <MyCounter />
      <hr />
      <MyRadioGroup name="myRadio" value="foo">
        <MyRadio value="foo">Foo</MyRadio>
        <MyRadio value="bar">Bar</MyRadio>
        <MyRadio value="baz">Baz</MyRadio>
      </MyRadioGroup>
      <MyTransformTest message="Tag transformation test: should render as v1-my-transform-test" />
    </>
  );
}
