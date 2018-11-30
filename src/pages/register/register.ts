import { Component } from '@angular/core';
import { AuthService2 } from "../../services/auth2-service";
import { ApiService } from "../../services/api-service";
import { Utils } from "../../services/utils";
import { IonicPage, NavController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})

export class RegisterPage {
  user: any = {};
  constructor(public authService: AuthService2, public utils: Utils, private api: ApiService, private nav: NavController) { }

  signup() {
    this.checkInfo().then(resp => {
      this.utils.showLoading();
      this.authService.create({ user: this.user }).subscribe(data => {
        if(data && data.result == 'success'){
          this.api.uploadImageToUsers(this.user.image_path, { attribute: 'avatar' }).subscribe(() => {
            this.utils.hideLoading();
            this.utils.events.publish('menu:user', this.user);
            this.utils.showAlert('Seja Bem-Vindo ao Weela', '', [{ text: 'Vamos lá!', handler: () => { this.nav.setRoot('HomePage') } }], false);
          });
        }else{
          this.utils.showError();
        }
      }, error => {
        this.utils.showAlert('Erro', error.message, ['OK'], false);
      });
    }).catch(err => {
      this.utils.showAlert(null, err.message, [{ role: 'cancel', text: 'OK' }], false);
      return false;
    })
  }

  selectImage() {
    this.utils.showPictureOptions(400, 400).subscribe(path => {
      this.user.image_path = path;
    }, error => {
      console.error(error);
    })
  }

  checkInfo() {
    return new Promise((resolve, reject) => {
      if (!this.isCPFValid(this.user.federal_tax_id.replace(/[^0-9]/g, ''))) {
        reject({ message: 'CPF inválido' });
      } else if (!this.validateEmail(this.user.email)) {
        reject({ message: 'Email inválido' });
      } else {
        this.api.checkEmail(this.user.email).subscribe(data => {
          if (data && typeof data['result'] != 'undefined' && data.result == 'success') {
            this.api.checkFederalTaxId(this.user.federal_tax_id).subscribe(data2 => {
              if (data2 && typeof data2['result'] != 'undefined' && data2.result == 'success') {
                resolve(true);
              } else {
                reject({ message: 'CPF já existe na nossa base de dados' });
              }
            });
          } else {
            reject({ message: 'Email já existe na nossa base de dados' });
          }
        });
      }
    });
  }

  private isCPFValid(cpf: string): boolean {
    if (cpf == null) {
      return false;
    }
    if (cpf.length != 11) {
      return false;
    }
    if ((cpf == '00000000000') || (cpf == '11111111111') || (cpf == '22222222222') || (cpf == '33333333333') || (cpf == '44444444444') || (cpf == '55555555555') || (cpf == '66666666666') || (cpf == '77777777777') || (cpf == '88888888888') || (cpf == '99999999999')) {
      return false;
    }
    let numero: number = 0;
    let caracter: string = '';
    let numeros: string = '0123456789';
    let j: number = 10;
    let somatorio: number = 0;
    let resto: number = 0;
    let digito1: number = 0;
    let digito2: number = 0;
    let cpfAux: string = '';
    cpfAux = cpf.substring(0, 9);
    for (let i: number = 0; i < 9; i++) {
      caracter = cpfAux.charAt(i);
      if (numeros.search(caracter) == -1) {
        return false;
      }
      numero = Number(caracter);
      somatorio = somatorio + (numero * j);
      j--;
    }
    resto = somatorio % 11;
    digito1 = 11 - resto;
    if (digito1 > 9) {
      digito1 = 0;
    }
    j = 11;
    somatorio = 0;
    cpfAux = cpfAux + digito1;
    for (let i: number = 0; i < 10; i++) {
      caracter = cpfAux.charAt(i);
      numero = Number(caracter);
      somatorio = somatorio + (numero * j);
      j--;
    }
    resto = somatorio % 11;
    digito2 = 11 - resto;
    if (digito2 > 9) {
      digito2 = 0;
    }
    cpfAux = cpfAux + digito2;
    if (cpf != cpfAux) {
      return false;
    }
    else {
      return true;
    }
  }

  private validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

}