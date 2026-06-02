import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MyCounter, MyRange, SelectValueAccessor } from 'component-library-angular';

@Component({
  selector: 'app-range-tests',
  standalone: true,
  imports: [MyCounter, MyRange, SelectValueAccessor, FormsModule],
  templateUrl: './range-tests.html',
  styles: ``,
})
export class RangeTests {
  rangeValue: number = 0;
  min: number = 0;
  max: number = 100;
}
