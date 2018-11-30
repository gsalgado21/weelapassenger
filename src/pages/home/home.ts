import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform, IonicPage } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { PlaceService } from "../../services/place-service";
import { Utils } from "../../services/utils";
import { ApiService } from '../../services/api-service';

declare var google: any;


@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  categories: Array<any>;
  trip: any = { payment_method: 'CASH' };
  map: any;
  origin_marker: any;
  destination_marker: any;
  private directionsService: any;
  private directionsDisplay: any;

  constructor(public nav: NavController, public platform: Platform, public placeService: PlaceService,
    private geolocation: Geolocation, private chRef: ChangeDetectorRef, public utils: Utils, private api: ApiService) {
    this.api.getCategories().subscribe(data => {
      if (data && data.result == 'success') {
        this.categories = data.categories;
        if (data.categories.length == 1) this.trip.category_id = data.categories[0]['id'];
      }
    });
    this.directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: { strokeColor: "Teal", strokeOpacity: 0.5, strokeWeight: 6 }
    });
    this.directionsService = new google.maps.DirectionsService();
  }

  ionViewDidLoad() {
    this.api.getTripInProgress().subscribe(data => {
      if (data && data.result == 'success') {
        if (data.trip.status == 'DONE') this.nav.setRoot('SummaryPage');
        else this.nav.setRoot('TrackingPage');
      }
    });
    setTimeout(() => { this.loadMap(); }, 800);
  }

  ionViewWillLeave() { }

  choosePlace(attr) {
    this.utils.showModal('PlacesPage', { type: attr }).onWillDismiss(data => {
      console.log(data);
      if (data) {
        for (let a in data) {
          this.trip[a] = data[a];
        }
        this.updateMarkers();
      }
    })
  }

  private loadCurrentPosition(map) {
    this.geolocation.getCurrentPosition().then((resp) => {
      let lat_lng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'latLng': lat_lng, 'region': 'BR' }, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          let location: any = results[0];
          this.trip.origin_vicinity = location.formatted_address;
          this.trip.origin_latitude = location.geometry.location.lat();
          this.trip.origin_longitude = location.geometry.location.lng();
          map.setCenter(lat_lng);
          map.setZoom(15);
          this.updateMarkers();
        }
      });
    });
  }

  public hasOriginAndDestination() {
    return this.trip.origin_latitude && this.trip.origin_longitude && this.trip.destination_longitude && this.trip.destination_latitude;
  }

  private updateMarkers() {
    var bounds = new google.maps.LatLngBounds();
    if (this.trip.origin_latitude && this.trip.origin_longitude) {
      if (this.origin_marker) this.origin_marker.setMap(null);
      this.origin_marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(this.trip.origin_latitude, this.trip.origin_longitude),
        icon: 'assets/img/pin-green.png'
      });
      bounds.extend(new google.maps.LatLng(this.trip.origin_latitude, this.trip.origin_longitude));
    }

    if (this.trip.destination_latitude && this.trip.destination_longitude) {
      if (this.destination_marker) this.destination_marker.setMap(null);
      this.destination_marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(this.trip.destination_latitude, this.trip.destination_longitude),
        icon: 'assets/img/pin-red.png'
      });
      bounds.extend(new google.maps.LatLng(this.trip.destination_latitude, this.trip.destination_longitude));
    }
    this.map.fitBounds(bounds);
    if (this.hasOriginAndDestination()) {
      this.showDirections();
      this.simulate();
      this.map.setZoom(this.map.getZoom() - 6);
    } else {
      let zoom = this.map.getZoom();
      if (zoom > 14) this.map.setZoom(15);
    }
  }

  private loadMap() {
    this.map = new google.maps.Map(document.getElementById('map_home'), {
      zoom: 8,
      center: new google.maps.LatLng(-23.0269805, -45.5521864),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    });
    this.loadCurrentPosition(this.map);
  }

  private simulate() {
    this['loading'] = true;
    this.api.simulateTrip(this.trip).subscribe(data => {
      if (data && data.result == 'success') {
        this.trip.total_amount = data.trip_total;
      }
      this['loading'] = false;
    })
  }

  private showDirections() {
    console.log(this.directionsDisplay);
    this.directionsDisplay.setMap(this.map);
    let _self = this;
    this.directionsService.route({
      origin: new google.maps.LatLng(this.trip.origin_latitude, this.trip.origin_longitude),
      destination: new google.maps.LatLng(this.trip.destination_latitude, this.trip.destination_longitude),
      travelMode: google.maps.TravelMode.DRIVING
    }, function (response, status) {
      console.log(response);
      if (status == google.maps.DirectionsStatus.OK) {
        _self.directionsDisplay.setDirections(response);
      } else {
        console.log("error");
      }
    });
  }

  requestCar() {
    this.directionsDisplay.setMap(null);
    this.directionsDisplay = null;
    this.directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: { strokeColor: "Teal", strokeOpacity: 0.5, strokeWeight: 6 }
    });
    this.utils.showLoading();
    this.api.requestTrip(this.trip).subscribe(data => {
      if (data && data.result == 'success') {
        this.utils.showPopover('HomePopover', null, { trip_id: data.trip_id }).onWillDismiss(trip_status => {
          if (!trip_status) {
            this.api.cancelTrip(data.trip_id).subscribe(data_aux => {
              if (data_aux && data_aux.result == 'success') {
                this.nav.setRoot('HomePage');
              }
            })
          } else if (trip_status == 'WAITING') {
            this.nav.setRoot('TrackingPage');
          } else if (trip_status == 'CANCELED') {
            this.utils.showAlert('Que Pena', 'Infelizmente não encontramos nenhum motorista apto a realizar sua corrida. Tente Novamente mais tarde.', [{ text: 'Ok', handler: () => { this.nav.setRoot('HomePage') } }], false);
          }
        })
      } else {
        this.utils.showAlert('Que Pena', 'Infelizmente não encontramos nenhum motorista apto a realizar sua corrida. Tente Novamente mais tarde.', [{ text: 'Ok', handler: () => { this.nav.setRoot('HomePage') } }], false);
      }
      this.utils.hideLoading();
    });
  }

  showPromoPopup() {
    let alert = this.utils.showAlert('Código Promocional', null, [{
      text: 'Validar', handler: (resp) => {
        this.api.checkCoupon(resp.coupon).subscribe(data => {
          if (data && data.result == 'success') {
            alert.dismiss();
            this.trip.coupon_token = resp.coupon;
            if (data.coupon.value_type == 'PERCENT')
              this.trip.discount_amount = this.trip.total_amount * (parseFloat(data.coupon.value) * 0.01);
            else
              this.trip.discount_amount = parseFloat(data.coupon.value);
          } else {
            this.utils.showToast('Código Inválido ou Expirado');
          }
        }, err => { this.utils.showToast('Código Inválido ou Expirado') });
        return false;
      }
    }], true, [{ name: 'coupon', placeholder: 'Informe o código para validação' }])
  }
}
