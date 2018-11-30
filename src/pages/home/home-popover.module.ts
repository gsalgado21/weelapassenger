import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePopover } from './home-popover';
import { ServerSocket } from '../../services/server-socket';

@NgModule({
  declarations: [HomePopover],
  imports: [IonicPageModule.forChild(HomePopover)],
  entryComponents: [HomePopover],
  providers: [ServerSocket]
})
export class HomePopoverModule { }
