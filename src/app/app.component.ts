import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { ViewChild } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HeaderColor } from '@ionic-native/header-color';
import { AuthService2 } from "../services/auth2-service";
import { Utils } from "../services/utils";
import { FCM } from '@ionic-native/fcm';
import { ApiService } from '../services/api-service';

@Component({
  templateUrl: 'app.html',
  queries: {
    nav: new ViewChild('content'),
    menu: new ViewChild('menu')
  }
})

export class MyApp {
  rootPage: any = 'SplashPage';
  nav: any;
  menu: any;
  user = {};

  constructor(private platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, api: ApiService, private fcm: FCM,
    public authService: AuthService2, headerColor: HeaderColor, public utils: Utils) {

    platform.ready().then(() => {
      this.initFCM();
      this.authService.getUser().subscribe(data => {
        if (data) {
          this.user = data;
          this.menu.enable(true);
          this.nav.setRoot('HomePage');
        } else {
          this.menu.enable(false);
          this.nav.setRoot('LoginPage');
        }
      }, err => {
        console.log(err);
        this.menu.enable(false);
        this.nav.setRoot('LoginPage');
      });
      statusBar.overlaysWebView(false);
      statusBar.backgroundColorByHexString("#268790");
      headerColor.tint('#268790');
      splashScreen.hide();
      this.utils.events.subscribe('menu:user', (user) => {
        this.user = user;
      });
    });
  }

  goTo(page) {
    this.menu.close().then(() => {
      this.nav.push(page);
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.menu.close().then(() => {
        this.nav.setRoot('LoginPage');
        this.menu.enable(false);
      });
    });
  }


  private initFCM() {
    if (this.platform.is('cordova')) {
      this.fcm.getToken().then(token => {
        console.log(token);
        localStorage.setItem('device_token', token);
      });
      this.fcm.onTokenRefresh().subscribe(token => {
        console.log(token);
        localStorage.setItem('device_token', token);
      });
      let _self = this;
      this.fcm.onNotification().subscribe((data) => {
        console.log('notificação', data)
        if (data.wasTapped) { //backgroudn
          console.log('chegou background');
        } else { //foreground
          console.log('chegou foregroud');
        }
      });
    }
  }
}