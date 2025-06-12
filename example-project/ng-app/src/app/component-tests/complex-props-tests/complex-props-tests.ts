import { Component } from '@angular/core';
import { MyComplexProps } from 'component-library-angular';

@Component({
  selector: 'app-complex-props-tests',
  imports: [MyComplexProps],
  templateUrl: './complex-props-tests.html',
  styles: ``,
})
export class ComplexPropsTests {
  foo = {
    bar: "Bar",
    loo: [1,2,3,4,5,6,7,8,9,10],
    qux: { quux: Symbol('quux') }
  };
  baz = new Map([
    ["apple", { qux: Symbol('apple') }],
    ["banana", { qux: Symbol('banana') }],
    ["foo", { qux: Symbol('bar') }]
  ]);
  grault = Infinity;
  quux: Set<string> = new Set<string>(["a", "b", "c", 'foo']);
  waldo = null;

}
