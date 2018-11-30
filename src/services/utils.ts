import { Injectable, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Nav, LoadingController, Loading, AlertController, ToastController, PopoverController, ModalController, Events, Platform, ActionSheetController } from 'ionic-angular'
import 'rxjs/add/operator/map';

@Injectable()
export class Utils {

  @ViewChild(Nav) nav: Nav;
  loading: Loading;
  public today: string = new Date().toISOString();

  constructor(public http: Http, private loadingCtrl: LoadingController, private popoverCtrl: PopoverController,
    private alertCtrl: AlertController, public toastCtrl: ToastController,
    public modalCtrl: ModalController, public events: Events, public platform: Platform,
    public actionCtrl: ActionSheetController, private camera: Camera) {
  }

  showLoading(text?) {
    if (this.loading) this.loading.dismiss();
    if (text) {
      this.loading = this.loadingCtrl.create({
        content: '<div>' + (text || 'Carregando...') + '</div>'
      });
    } else {
      this.loading = this.loadingCtrl.create();
    }
    this.loading.present();
  }

  hideLoading() {
    if (this.loading) this.loading.dismiss();
  }

  showError(text?) {
    let alert = this.alertCtrl.create({
      title: 'Falha na execução',
      subTitle: text || 'Ops! Algo não saiu como o esperado',
      buttons: ['Fechar']
    });
    alert.present();

    this.hideLoading();
  }

  showToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 2000
    });
    toast.present();
    return toast;
  }

  showModal(page, params) {
    let modal = this.modalCtrl.create(page, params);
    modal.present();
    return modal;
  }

  showPopover(page, ev, params) {
    let popover = this.popoverCtrl.create(page, params, { enableBackdropDismiss: false });
    popover.present({
      ev: ev
    });
    return popover;
  }

  showAlert(title, text, buttons, with_cancel, inputs?) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: text,
      inputs: inputs,
      enableBackdropDismiss: false
    });
    if (with_cancel)
      buttons.unshift({ text: 'Cancelar', role: 'cancel' });
    for (let i in buttons) {
      buttons[i].text = (buttons[i].text);
      alert.addButton(buttons[i]);
    }
    alert.present();
    return alert;
  }
  showPictureOptions(width, height, source?) {
    let self = this;
    let cameraOptions: CameraOptions = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      allowEdit: true,
      targetWidth: width,
      targetHeight: height,
      quality: 80,
    };
    let galleryOptions: CameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      allowEdit: true,
      targetWidth: width,
      targetHeight: height,
      quality: 100
    };
    return Observable.create(observer => {
      if (!source) {
        let actionSheet = self.actionCtrl.create({
          title: 'Selecione a origem',
          buttons: [{
            text: 'Câmera',
            icon: 'camera',
            handler: () => {
              this.camera.getPicture(cameraOptions).then((imageData) => {
                observer.next(imageData);
                observer.complete();
              }).catch((error) => {
                observer.next(null);
                observer.complete();
              });
            }
          }, {
            text: 'Galeria',
            icon: 'images',
            handler: () => {
              this.camera.getPicture(galleryOptions).then((imageData) => {
                observer.next(imageData);
                observer.complete();
              }).catch((error) => {
                observer.next(null);
                observer.complete();
              });
            }
          }]
        });
        actionSheet.present();
      } else if (source == 'gallery') {
        this.camera.getPicture(galleryOptions).then((imageData) => {
          observer.next(imageData);
          observer.complete();
        }).catch((error) => {
          observer.next(null);
          observer.complete();
        });
      } else {
        this.camera.getPicture(cameraOptions).then((imageData) => {
          observer.next(imageData);
          observer.complete();
        }).catch((error) => {
          observer.next(null);
          observer.complete();
        });
      }
    });
  }
}