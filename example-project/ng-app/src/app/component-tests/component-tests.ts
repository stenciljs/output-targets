import { Component } from '@angular/core';
import {
  MyButton,
  MyComplexProps,
  MyComponent,
  MyCounter,
  MyInput,
  MyList,
  MyRadio,
  MyRadioGroup,
  MyRange,
  MyToggle,
} from 'component-library-angular';
import { CheckboxTests } from './checkbox-tests/checkbox-tests';

@Component({
  selector: 'app-component-tests',
  imports: [
    MyComponent,
    MyButton,
    MyComplexProps,
    MyCounter,
    MyInput,
    MyList,
    MyRadio,
    MyRadioGroup,
    MyRange,
    MyToggle,
    CheckboxTests,
  ],
  templateUrl: './component-tests.html',
  styles: ``,
})
export class ComponentTests {}
