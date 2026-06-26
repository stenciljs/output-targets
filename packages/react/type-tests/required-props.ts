/**
 * Compile-time type assertions for the required props (R) generic.
 * This file is checked by `tsc --noEmit` via the `test.types` script.
 * It does NOT emit any runtime code.
 */

import type { StencilReactComponent } from '../src/runtime/create-component.js';
import { createComponent } from '../src/runtime/create-component.js';

type Assert<T extends true> = T;
type IsExact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

/** Extract the props type accepted by a StencilReactComponent */
type PropsOf<T> = T extends React.FunctionComponent<infer P> ? P : never;

/** True if key K is required (non-optional) in object T */
type IsRequired<T, K extends keyof T> = {} extends Pick<T, K> ? false : true;

interface MyTimerElement extends HTMLElement {
  hours: boolean;
  label: string;
}

// EventNames = Record<string, EventName | string>; use compatible empty record
type MyTimerEvents = Record<string, never>;

interface MyTimerComponentProps {
  hours: boolean;
  label: string;
}

// Test: R = 'hours' makes `hours` required, `label` optional
type TimerWithRequired = StencilReactComponent<MyTimerElement, MyTimerEvents, MyTimerComponentProps, 'hours'>;
type TimerProps = PropsOf<TimerWithRequired>;

type _1 = Assert<IsRequired<TimerProps, 'hours'>>;
type _2 = Assert<IsExact<IsRequired<TimerProps, 'label'>, false>>;

// Test: R = never (default) makes all props optional
type TimerAllOptional = StencilReactComponent<MyTimerElement, MyTimerEvents, MyTimerComponentProps>;
type TimerOptionalProps = PropsOf<TimerAllOptional>;

type _3 = Assert<IsExact<IsRequired<TimerOptionalProps, 'hours'>, false>>;
type _4 = Assert<IsExact<IsRequired<TimerOptionalProps, 'label'>, false>>;

// Test: createComponent return type carries R
const MyTimer = createComponent<MyTimerElement, MyTimerEvents, MyTimerComponentProps, 'hours'>({
  tagName: 'my-timer',
  elementClass: undefined as any,
  react: undefined as any,
  events: {} as MyTimerEvents,
  defineCustomElement: () => {},
});

type CreateReturnProps = PropsOf<typeof MyTimer>;
type _5 = Assert<IsRequired<CreateReturnProps, 'hours'>>;
type _6 = Assert<IsExact<IsRequired<CreateReturnProps, 'label'>, false>>;

// Test: multiple required props
interface MyFormComponentProps {
  action: string;
  method: string;
  target: string;
}

type FormWithRequired = StencilReactComponent<HTMLElement, {}, MyFormComponentProps, 'action' | 'method'>;
type FormProps = PropsOf<FormWithRequired>;

type _7 = Assert<IsRequired<FormProps, 'action'>>;
type _8 = Assert<IsRequired<FormProps, 'method'>>;
type _9 = Assert<IsExact<IsRequired<FormProps, 'target'>, false>>;
