import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Utils } from '../../services/utils';
import { ApiService } from '../../services/api-service';

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage {

  notifications: Array<any>;
  constructor(public navCtrl: NavController, private api: ApiService, private utils: Utils) { }

  ionViewDidLoad() {
    this.utils.showLoading();
    this.api.getNotifications().subscribe(data => {
      if (data && data.result == 'success') {
        this.notifications = data.notifications;
        this.utils.hideLoading();
      } else {
        this.utils.showError();
        this.navCtrl.pop();
      }
    }, err => {
      this.utils.showError();
      this.navCtrl.pop();
    })
  }

  show(n) {
    this.api.readNotifications(n.id).subscribe(data => {
      console.log(data);
      n.readed_at = new Date();
    });
    let buttons: Array<any> = [{ text: 'Fechar', role: 'cancel' }];
    if (n.url_link)
      buttons.push({ text: 'Abrir', handler: () => { window.open(n.url_link, '_system', 'location=yes') } })
    this.utils.showAlert(n.title, n.content, buttons, false);
  }

}
