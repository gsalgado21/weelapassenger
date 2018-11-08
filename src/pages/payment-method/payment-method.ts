import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { AuthService } from "../../services/auth-service";
import { TripService } from "../../services/trip-service";

@Component({
  selector: 'page-payment-method',
  templateUrl: 'payment-method.html'
})
export class PaymentMethodPage {
  carNumber: any = null;

  constructor(public nav: NavController, public authService: AuthService, public tripService: TripService,
    public loadingCtrl: LoadingController) {
    const loading = loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    authService.getCardSetting().take(1).subscribe((snapshot: any) => {
      loading.dismiss();
      if (snapshot) {
        this.carNumber = snapshot.number;
      }
    });
  }

  // apply change method
  changeMethod(method) {
    this.tripService.setPaymentMethod(method);
    // go back
    this.nav.pop();
  }

  // add card
  // addCard() {
  //   this.nav.push(CardSettingPage, {back: true});
  // }
}
