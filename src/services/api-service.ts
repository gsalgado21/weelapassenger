import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {

  constructor(public http: HttpService) { }

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
}
