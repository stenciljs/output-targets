import { Component } from '@angular/core';
import { MyButton } from 'component-library-angular';

@Component({
  selector: 'app-button-tests',
  standalone: true,
  imports: [MyButton],
  templateUrl: './button-tests.html',
  styles: ``,
})
export class ButtonTests {
  clicked: number = 0;
  isDisabled: boolean = true;
  /**
   * `null` reaches inputs routinely from the `async` pipe and form control values, so the
   * transform has to accept it rather than only `boolean`.
   */
  maybeDisabled: boolean | null = null;

  handleClick() {
    this.clicked++;
  }
}
