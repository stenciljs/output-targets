import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MyRadio, MyRadioGroup, SelectValueAccessor } from 'component-library-angular';

@Component({
  selector: 'app-radio-group-tests',
  imports: [MyRadio, MyRadioGroup, SelectValueAccessor, FormsModule],
  templateUrl: './radio-group-tests.html',
  styles: ``,
})
export class RadioGroupTests {
  selectedName = 'biff';
}
