import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Utils } from '../../services/utils';
import { ApiService } from '../../services/api-service';

@IonicPage()
@Component({
  selector: 'page-contact-us',
  templateUrl: 'contact-us.html',
})
export class ContactUsPage {
  issue: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams, private utils: Utils, private api: ApiService) { }

  ionViewDidLoad() { }

  selectImage() {
    this.utils.showPictureOptions(800, 800).subscribe(path => {
      this.issue['image'] = path;
    }, error => {
      console.error(error);
    });
  }

  confirm() {
    this.utils.showLoading('Enviando dados...');
    this.api.createIssue({ issue: this.issue }).subscribe(data => {
      if (data && data['result'] == 'success') {
        if (this.issue.image) {
          this.api.uploadImageToIssue(this.issue.image, { id: data.issue_id }).subscribe((resp) => {
            this.utils.hideLoading();
            this.utils.showAlert('Dados enviados com sucesso!', null, [{ text: 'Ok', handler: () => this.navCtrl.popToRoot() }], false);
          });
        } else {
          this.utils.hideLoading();
          this.utils.showAlert('Dados enviados com sucesso!', null, [{ text: 'Ok', handler: () => this.navCtrl.popToRoot() }], false);
        }
      } else {
        this.utils.showError();
      }
    }, err => {
      console.error(err);
      this.utils.showError();
    });
  }
}
