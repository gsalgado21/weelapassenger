import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlacesPage } from './places';

@NgModule({
  declarations: [PlacesPage],
  imports: [IonicPageModule.forChild(PlacesPage)],
  entryComponents: [PlacesPage],
  providers: []
})
export class PlacesPageModule { }
