import { Component } from '@angular/core';
import { NavController, IonicPage, MenuController } from 'ionic-angular';
import { Utils } from "../../services/utils";
import { AuthService2 } from "../../services/auth2-service";
import { ApiService } from '../../services/api-service';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  user: any = {};

  constructor(public nav: NavController, private menu: MenuController, public authService: AuthService2, private utils: Utils, private api: ApiService) { }


  signin() {
    this.utils.showLoading('Autenticando..');
    this.authService.login({ email: this.user.email, password: this.user.password }).subscribe(data => {
      this.utils.hideLoading();
      if (data && data.result == 'success') {
        this.nav.setRoot('HomePage');
        this.menu.enable(true);
        this.authService.getUser().subscribe(user => {
          this.utils.events.publish('menu:user', user);
        })
      } else {
        this.utils.showAlert(null, 'Usuário e/ou senha inválidos', [{ text: 'Ok', role: 'cancel' }], false);
      }
    }, error => {
      this.utils.showError(error.message);
    });
  }

  reset() {
    if (!this.user.email) {
      this.utils.showAlert('Email Inválido', 'Informe o email no campo de login', [], true);
    } else {
      this.api.forgetPassword(this.user.email).subscribe(data => {
        if (data && data.result == 'success') {
          this.utils.showAlert('Email de Redefinição Enviado', 'Verifique sua caixa de entrada', [{ text: 'Ok', role: 'cancel' }], false);
        } else {
          this.utils.showAlert('Email Inválido', 'O email informado não consta na base de dados', [], true);
        }
      }, err => {
        this.utils.showAlert('Email Inválido', 'O email informado não consta na base de dados', [], true);
      })
    }
  }
}