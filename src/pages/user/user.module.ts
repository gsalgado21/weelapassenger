import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserPage } from './user';
import { BrMaskerModule } from 'brmasker-ionic-3';

@NgModule({
  declarations: [UserPage],
  imports: [IonicPageModule.forChild(UserPage), BrMaskerModule],
  entryComponents: [UserPage]
})
export class UserPageModule { }
