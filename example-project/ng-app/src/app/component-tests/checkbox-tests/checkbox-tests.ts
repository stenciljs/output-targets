import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MyCheckbox, BooleanValueAccessor } from 'component-library-angular';

@Component({
  selector: 'app-checkbox-tests',
  imports: [MyCheckbox, FormsModule, BooleanValueAccessor],
  templateUrl: './checkbox-tests.html',
  styles: ``,
})
export class CheckboxTests {
  startChecked: boolean = false;
  endChecked: boolean = false;
}
