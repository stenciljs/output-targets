import { Component } from '@angular/core';
import { MyButton } from 'component-library-angular';

@Component({
  selector: 'app-button-tests',
  imports: [MyButton],
  templateUrl: './button-tests.html',
  styles: ``,
})
export class ButtonTests {
  clicked: number = 0;

  handleClick() {
    this.clicked++;
  }
}
