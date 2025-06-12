import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MyRange, SelectValueAccessor } from 'component-library-angular';

@Component({
  selector: 'app-range-tests',
  imports: [MyRange, SelectValueAccessor, FormsModule],
  templateUrl: './range-tests.html',
  styles: ``,
})
export class RangeTests {
  testText: any;
}
