import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TrackingPage } from './tracking';
import { ServerSocket } from '../../services/server-socket';
import { DriverService } from '../../services/driver-service';

@NgModule({
  declarations: [TrackingPage],
  imports: [IonicPageModule.forChild(TrackingPage)],
  entryComponents: [TrackingPage],
  providers: [ServerSocket, DriverService]
})
export class TrackingPageModule { }
