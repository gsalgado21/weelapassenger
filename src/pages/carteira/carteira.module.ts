import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CarteiraPage } from './carteira';
import { BrMaskerModule } from 'brmasker-ionic-3';

@NgModule({
  declarations: [
    CarteiraPage,
  ],
  imports: [
    BrMaskerModule,
    IonicPageModule.forChild(CarteiraPage),
  ],
})
export class CarteiraPageModule {}
