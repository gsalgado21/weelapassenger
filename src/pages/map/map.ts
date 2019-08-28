import { Component, ChangeDetectorRef } from '@angular/core';
import { ViewController, NavParams, IonicPage } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { PlaceService } from "../../services/place-service";
import { Utils } from '../../services/utils';
import { MAP_STYLE } from '../../services/constants';
declare var google: any;

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  map: any;
  address: any;
  marker: any;

  constructor(public view: ViewController, private geolocation: Geolocation, public chRef: ChangeDetectorRef,
    public navParams: NavParams, public placeService: PlaceService, private utils: Utils) {
  }

  ionViewDidLoad() {
    this.utils.showLoading();
    this.geolocation.getCurrentPosition({ timeout: 3000, maximumAge: Number.MAX_VALUE, enableHighAccuracy: true }).then(resp => {
      this.loadMap(resp.coords.latitude, resp.coords.longitude);
      this.utils.hideLoading();
    }).catch(reject => {
      this.utils.hideLoading();
      console.log(reject);
      this.loadMap(-23.0269805, -45.5521864)
    });
  }

  loadMap(lat, lng) {
    let latLng = new google.maps.LatLng(lat, lng);
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: latLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      styles: MAP_STYLE
    });

    this.findPlace(latLng);

    this.map.addListener('dragend', (event) => {
      this.utils.showLoading();
      setTimeout(() => {
        let center = this.map.getCenter();
        this.findPlace(center);
      }, 400);
    })
    this.map.addListener('dragstart', (event) => {
      this.address = null;
    });
  }

  findPlace(latLng) {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'latLng': latLng }, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        this.address = results[0];
        this.chRef.detectChanges();
        this.utils.hideLoading();
      }
    });
  }

  selectPlace() {
    let address = this.placeService.formatAddress(this.address);
    let attr = this.navParams.get('type');
    let obj = {};
    obj[attr + '_latitude'] = address.location.lat;
    obj[attr + '_longitude'] = address.location.lng;
    obj[attr + '_vicinity'] = address.vicinity;
    this.view.dismiss(obj);
  }

  dismiss() {
    this.view.dismiss();
  }
}