import { Component, ViewChild } from '@angular/core';
import { ViewController, NavParams, IonicPage, Searchbar } from 'ionic-angular';
import { PlaceService } from '../../services/place-service';
import { Geolocation } from '@ionic-native/geolocation';
import { Utils } from "../../services/utils";

@IonicPage()
@Component({
  selector: 'page-places',
  templateUrl: 'places.html'
})
export class PlacesPage {
  places: any = [];
  keyword = '';
  lat: number;
  lon: number;
  pageLoaded = false;
  type: any;
  @ViewChild(Searchbar) searchbar: Searchbar;

  constructor(public view: ViewController, public placeService: PlaceService, public geolocation: Geolocation, private utils: Utils,
    public navParams: NavParams) {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lon = resp.coords.longitude;
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  ionViewDidLoad() {
    this.searchbar.initFocus();
    this.type = this.navParams.get('type');
  }

  ionViewDidEnter() {
    this.pageLoaded = true;
    setTimeout(() => {
      this.searchbar.setFocus();
    }, 300);
  }

  ionViewWillLeave() {
    this.pageLoaded = false;
  }

  selectPlace(place) {
    console.log(place);
    let attr = this.type;
    let obj = {};
    obj[attr + '_latitude'] = place.geometry.location.lat;
    obj[attr + '_longitude'] = place.geometry.location.lng;
    obj[attr + '_vicinity'] = place.formatted_address;
    this.view.dismiss(obj);
  }

  clear() {
    this.keyword = '';
    this.search();
  }

  streetName(place) {
    return place.formatted_address.substring(0, place.formatted_address.indexOf('-'));
  }

  addressName(place) {
    return place.formatted_address.substring(place.formatted_address.indexOf('-') + 2);
  }

  dismiss() {
    this.view.dismiss();
  }

  // search by address
  search() {
    if (this.keyword && this.keyword.length > 0) {
      this.placeService.searchByAddress(this.keyword, this.lat, this.lon).subscribe(result => {
        console.log('searchByAddress', result);
        this.places = result.results;
        this['loader'] = false;
      }, err => {
        this.utils.showError();
        this['loader'] = false;
      });
    } else {
      this.places = [];
      this['loader'] = false;
    }
  }

  calcDistance(place) {
    return this.placeService.calcCrow(place.geometry.location.lat, place.geometry.location.lng, this.lat, this.lon).toFixed(1);
  }

  openMap() {
    this.utils.showModal('MapPage', { type: this.type }).onWillDismiss(data => {
      if (data) this.view.dismiss(data);
    });
  }
}
