import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MyComponent, MyCounter, MyToggle, MyTransformTest, MyRadio, MyRadioGroup, SelectValueAccessor } from 'component-library-angular';
import { ButtonTests } from './button-tests/button-tests';
import { CheckboxTests } from './checkbox-tests/checkbox-tests';
import { ComplexPropsTests } from './complex-props-tests/complex-props-tests';
import { InputFormTests } from './input-form-tests/input-form-tests';
import { RangeTests } from './range-tests/range-tests';

@Component({
  selector: 'app-component-tests',
  standalone: true,
  imports: [
    MyComponent,
    MyCounter,
    MyToggle,
    MyTransformTest,
    MyRadio,
    MyRadioGroup,
    CheckboxTests,
    InputFormTests,
    ButtonTests,
    ComplexPropsTests,
    RangeTests,
    FormsModule,
    SelectValueAccessor
  ],
  templateUrl: './component-tests.html',
  styles: ``,
})
export class ComponentTests {
  selectedColor = 'Red';
  myCustomEventFired = false;
  middleName = 'William';

  onMyCustomEvent() {
    this.myCustomEventFired = true;
  }

  changeMiddleName() {
    this.middleName = 'Test';
  }
}
