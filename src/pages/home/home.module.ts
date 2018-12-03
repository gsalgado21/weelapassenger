import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import { Diagnostic } from '@ionic-native/diagnostic';

@NgModule({
  declarations: [HomePage],
  imports: [IonicPageModule.forChild(HomePage)],
  entryComponents: [HomePage],
  providers: [Diagnostic]
})
export class HomePageModule { }
