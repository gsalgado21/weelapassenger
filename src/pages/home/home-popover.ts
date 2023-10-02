import { Component } from '@angular/core';
import { ViewController, IonicPage } from 'ionic-angular';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { ServerSocket } from '../../services/server-socket';

@IonicPage()
@Component({
  selector: 'popover-home',
  templateUrl: 'home-popover.html'
})

export class HomePopover {
  trip_id: any;
  private websocketSubscription: any;

  constructor(public viewCtrl: ViewController, private params: NavParams, private socket: ServerSocket) { }

  ionViewDidLoad() {
    this.trip_id = this.params.get('trip_id');

    if (!this.websocketSubscription)
      this.websocketSubscription = this.socket.connect().subscribe((data) => {
        let resp = JSON.parse(data);
        console.log("resposta websocket", resp);
        if (typeof resp.message == 'object' && resp.message.trip_id.toString() == this.trip_id.toString()) {
          this.viewCtrl.dismiss(resp.message.status);
        }
      });
  }

  ionViewWillLeave(){
    this.websocketSubscription.unsubscribe();
  }

  dismiss(){
    this.viewCtrl.dismiss(false);
  }
}