import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MyInput, TextValueAccessor } from 'component-library-angular';

@Component({
  selector: 'app-input-form-tests',
  standalone: true,
  imports: [ReactiveFormsModule, MyInput, TextValueAccessor, JsonPipe],
  templateUrl: './input-form-tests.html',
  styles: ``,
})
export class InputFormTests {
  private readonly fb = inject(FormBuilder);
  formGroup: FormGroup = this.fb.group({
    firstname: [''],
    lastname: [''],
    disabled: this.fb.control({ value: 'I am disabled :)', disabled: true }),
  });
}
