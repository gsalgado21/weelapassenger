import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationsPage } from './notifications';


@NgModule({
  declarations: [NotificationsPage],
  imports: [IonicPageModule.forChild(NotificationsPage)],
  entryComponents: [NotificationsPage],
})
export class NotificationsPageModule { }
