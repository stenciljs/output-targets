import { Component } from '@angular/core';
import { MyList, MyListItem } from 'component-library-angular';

@Component({
  selector: 'app-defer-tests',
  standalone: true,
  imports: [MyList, MyListItem],
  template: `
    @defer (on interaction) {
      <my-list data-testid="deferred-list"><my-list-item>Deferred item</my-list-item></my-list>
    } @placeholder {
      <button data-testid="load-deferred">Load deferred list</button>
    }
  `,
})
export class DeferTests {}
