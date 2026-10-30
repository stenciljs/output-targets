import { NgModule } from '@angular/core';
import { MyPopover, MyInputScoped } from 'component-library-angular';

/** Reproduction probe: an app NgModule listing wrappers that no template uses. */
@NgModule({
  imports: [MyPopover, MyInputScoped],
  exports: [MyPopover, MyInputScoped],
})
export class ProbeModule {}
