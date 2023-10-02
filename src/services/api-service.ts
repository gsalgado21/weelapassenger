import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {
  dados_transacao:any ;
  constructor(public http: HttpService, private http2: HttpClient,) { }

  //USERS
  public checkEmail(email) {
    return this.http.get('users/check_email', { email });
  }
  public checkFederalTaxId(params) {
    return this.http.get('users/check_federal_tax_id', { federal_tax_id: params });
  }
  public createUser(params) {
    return this.http.post('users', params);
  }
  public updateUser(params) {
    return this.http.post('users/update_info', params);
  }
  public updateLocation(lat, lng, city) {
    return this.http.post('users/update_location', { latitude: lat.toFixed(6), longitude: lng.toFixed(6), active_city: city });
  }
  public getUser() {
    return this.http.get('users/info', null);
  }
  public getPayments() {
    return this.http.post('users/payment_methods', null);
  }
  public forgetPassword(email) {
    return this.http.post('users/forget_password', { email, profile: 'PASSENGER' });
  }
  public getUserCities() {
    return this.http.get('users/cities', null);
  }
  public removeCreditCard(params) {
    return this.http.get('users/remove_credit_card', params);
  }
  public changePassword(params) {
    return this.http.post('users/change_password', params);
  }
  public uploadImageToUsers(file_path, params) {
    return this.http.uploadImage('users/image_upload', file_path, params);
  }

  public getBanks() {
    return this.http.get('banks', null);
  }

  public getBrands() {
    return this.http.get('brands', null);
  }

  public getCitiesByState(state_id) {
    return this.http.get('cities', { state_id });
  }

  public getStates() {
    return this.http.get('states', null);
  }

  public rejectDeal(deal_id) {
    return this.http.post('deals/' + deal_id + '/reject', null);
  }

  public acceptDeal(deal_id) {
    return this.http.post('deals/' + deal_id + '/accept', null);
  }

  public getDeal(deal_id) {
    return this.http.get('deals/' + deal_id, null);
  }

  public getTripInProgress() {
    return this.http.get('trips/in_progress', { profile: 'PASSENGER' });
  }

  public getCategories() {
    return this.http.get('categories/all', null);
  }

  public getMyTrips() {
    return this.http.get('trips', null);
  }

  public simulateTrip(trip) {
    return this.http.post('trips/simulate', { trip });
  }

  public requestTrip(trip) {
    return this.http.post('trips', { trip });
  }

  public pickupPassenger(trip_id) {
    return this.http.get('trips/' + trip_id + '/pickup', null);
  }

  public cancelTrip(trip_id) {
    return this.http.get('trips/' + trip_id + '/cancel', null);
  }

  public getDriverLocation(driver_id) {
    return this.http.get('drivers/' + driver_id + '/location', null);
  }

  public confirmTrip(trip_id) {
    return this.http.post('trips/' + trip_id + '/complete', null);
  }

  public rateTrip(trip_id, rating) {
    return this.http.post('trips/' + trip_id + '/rate', { rating: rating, profile: 'PASSENGER' });
  }

  public checkCoupon(coupon) {
    return this.http.get('coupons/check', { coupon });
  }

  public getNotifications() {
    return this.http.get('notifications', null);
  }

  public readNotifications(id) {
    return this.http.get('notifications/' + id, null);
  }

  public uploadImageToIssue(file_path, params) {
    return this.http.uploadImage('issues/image_upload', file_path, params);
  }

  public createIssue(params) {
    return this.http.post('issues', params);
  }

  public getMessages(trip_id) {
    return this.http.get('messages', { trip_id });
  }

  public getMessage(message_id) {
    return this.http.get('messages/' + message_id, null);
  }

  public createMessage(params) {
    return this.http.post('messages', params);
  }
  
  public readMessage(messages_ids) {
    return this.http.post('messages/read', { messages_ids });
  }

  public getAppVersion() {
    return this.http.get('versions/passanger', null);
  }

  lastHash() {

    return new Promise((resolve, reject) => {
      //Request to API
      let httpOptions = {
          headers: new HttpHeaders({
              'Content-type': 'application/json',
              'Accept':'application/json',
          })
      }

      let wallet = JSON.parse(localStorage.getItem('wallet'));
      let body = wallet;

      this.http2.get('https://api.valipag.com.br/c/hashant?publickey=' + body.publickey, httpOptions).subscribe((res: any) => {
          console.log('last hash', res[0].wallet.transant);
          // localStorage.setItem(')
          resolve(res[0].wallet.transant);
      }, (err) => {
          console.log('erro api', err)
          reject(err);
      });
    })
  }

  getCards() {
    return new Promise((resolve, reject) => {
      //Request to API
      let httpOptions = {
          headers: new HttpHeaders({
              'Content-type': 'application/json',
              'Accept':'application/json',
          })
      };

      let user = JSON.parse(localStorage.getItem('user'));
      let body = user;

      console.log('init request cartões');
      this.http2.get('https://api.valipag.com.br/c/ccrdtc?passageiro=' + body.id, httpOptions).subscribe((res: any) => {
          let array = [];
          res.forEach((r) => {
              array.push(r);
          })
          console.log('cartão de crédito', res);
          console.log('array getcards', array);
          resolve(array)
      }, (err) => {
      });
    })
  }

  getWallet() {
    return new Promise((resolve, reject) => {
      let user = JSON.parse(localStorage.getItem('user'));
      let data = {
          id: user.id
      };

      //Request to API
      let httpOptions = {
          headers: new HttpHeaders({
              'Content-type': 'application/json',
              'Accept':'application/json',
          })
      }
      this.http2.get('https://api.valipag.com.br/c/wallet?idm=' + data.id, httpOptions).subscribe((res: any) => {
          let wallet = res[0].wallet;
          localStorage.setItem('wallet', JSON.stringify(wallet));
          resolve(res);
          console.log('getwallet wallet',wallet);
      }, (err) => {
          reject(err);
      });
    })
  }

  getWalletExtrato() {
    return new Promise((resolve, reject) => {
        //Request to API
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-type': 'application/json',
                'Accept':'application/json',
            })
        }
        let wallet = JSON.parse(localStorage.getItem('wallet'));
        let body = wallet;
        console.log('WALLET PUBLIC', body);

        //REMOVER
        // body.publickey = 'd6c64c0604bb1793557d4238adf54abc0f93a275d5ea7180132ef998fd4de20d';

        console.log('init request ddddd');

        this.http2.get('https://api.valipag.com.br/c/extrato?publickey=' + body.publickey, httpOptions).subscribe((res: any) => {
            let array = [];
            res.forEach((r) => {
                array.push(r);
            })
            console.log('transações', res);
            console.log('transações', array);
            resolve(array)
        }, (err) => {
            console.log('erro do extrato', err);
            reject(err);
        });
    })
  }

  editCard(data) {
    return new Promise((resolve, reject) => {
        //Request to API
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-type': 'application/json',
                'Accept':'application/json',
            })
        }
        this.http2.put('https://api.valipag.com.br/ccrdts/' + data.id + '.json', data, httpOptions).subscribe((res: any) => {
            console.log('card created', res);
            resolve(res);
        }, (err) => {
            console.log('erro api', err)
            reject(err);
        });
    })
  }

  newCard(data) {
    return new Promise((resolve, reject) => {
        //Request to API
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-type': 'application/json',
                'Accept':'application/json',
            })
        }
        this.http2.post('https://api.valipag.com.br/ccrdts.json', data, httpOptions).subscribe((res: any) => {
            console.log('card created', res);
            resolve(res);
        }, (err) => {
            console.log('erro api', err)
            reject(err);
        });
    })
  }

  recarga1(data) {
    return new Promise((resolve, reject) => {
        //Request to API
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-type': 'application/json',
                'Accept':'application/json',
            })
        }
        // let url = 'https://api.valipag.com.br/c/rcrg?'
        this.http2.get(data.url, httpOptions).subscribe((res: any) => {
            // console.log('recarga1', res);
            resolve(res);
        }, (err) => {
            console.log('erro api', err)
            reject(err);
        });
    })
  }

  recarga2(transacao) {
    console.log('transacao', transacao);
    this.dados_transacao = new Object();
    this.dados_transacao.transacao = transacao;
    console.log('dados trans', this.dados_transacao);
    let data = this.dados_transacao;
    

    return new Promise((resolve, reject) => {
        //Request to API
        let httpOptions = {
            headers: new HttpHeaders({
                'Content-type': 'application/json',
                'enctype': 'multipart/form-data;',
            })
        }


        this.http2.post('https://api.valipag.com.br/transacaos.json', data, httpOptions).subscribe((res: any) => {
            // console.log('recarga1', res);
            resolve(res);
        }, (err) => {
            console.log('erro api', err)
            reject(err);
        });
    })
  }



}
