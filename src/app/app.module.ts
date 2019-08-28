import { NgModule, LOCALE_ID, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';
registerLocaleData(localePtBr);
import { MyApp } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpModule } from '@angular/http';
import { Geolocation } from '@ionic-native/geolocation';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { IonicStorageModule } from '@ionic/storage';
import { HeaderColor } from '@ionic-native/header-color';
import { MomentModule } from 'angular2-moment';
import { AuthService2 } from "../services/auth2-service";
import { ApiService } from "../services/api-service";
import { HttpService } from "../services/http-service";
import { Utils } from "../services/utils";
import { HttpClientModule } from '@angular/common/http';
import { Camera } from '@ionic-native/camera';
import { FCM } from '@ionic-native/fcm';
import { Device } from '@ionic-native/device';
import { PlaceService } from '../services/place-service';

@NgModule({
  declarations: [MyApp],
  imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    HttpClientModule,
    MomentModule,
    IonicModule.forRoot(MyApp, {
      mode: 'md',
      monthNames: ['janeiro', 'fevereiro', 'mar\u00e7o', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
      monthShortNames: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
      dayNames: ['domingo', 'segunda-feira', 'ter\u00e7a-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado'],
      dayShortNames: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
      backButtonText: ''
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    HeaderColor,
    Utils,
    HttpService,
    AuthService2,
    ApiService,
    PlaceService,
    File,
    FileTransfer,
    Camera,
    FCM,
    Device,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
})
export class AppModule {
}