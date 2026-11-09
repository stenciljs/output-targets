import { Component } from '@angular/core';
import { MyComponentScoped } from 'component-library-angular';

@Component({
  selector: 'app-lazy-page',
  standalone: true,
  imports: [MyComponentScoped],
  template: `<my-component-scoped first="Lazy" [middleName]="middleName" last="Route"></my-component-scoped>`,
})
export class LazyPage {
  middleName = 'Loaded';
}
