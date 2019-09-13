import { Component, ChangeDetectorRef } from '@angular/core';
import { ViewController, NavParams, IonicPage } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { PlaceService } from "../../services/place-service";
import { Utils } from '../../services/utils';
import { HERE_MAP_API_KEY } from '../../services/constants'

declare var H: any;

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  map: any;
  here_api: any;
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
    let latLng = new H.geo.Point(lat, lng);

    this.here_api = new H.service.Platform({
      'apikey': HERE_MAP_API_KEY
    });

    let maptypes = this.here_api.createDefaultLayers();

    this.map = new H.Map(
      document.getElementById('map'),
      maptypes.raster.normal.map,
      {
        zoom: 16,
        center: latLng
      });

    new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));

    window.addEventListener('resize', () => this.map.getViewPort().resize());

    this.findPlace(latLng);

    this.map.addEventListener('dragend', (event) => {
      this.utils.showLoading();
      setTimeout(() => {
        let center = this.map.getCenter();
        this.findPlace(center);
      }, 400);
    })
    this.map.addEventListener('dragstart', (event) => {
      this.address = null;
    });
  }

  findPlace(latLng) {
    let _self = this;
    let reverseGeocodingParameters = {
      prox: latLng.lat + ',' + latLng.lng + ',10',
      mode: 'retrieveAddresses',
      maxresults: 1
    };

    function onSuccess(result) {
      let location = result.Response.View[0].Result[0];

      _self.address = location;
      _self.chRef.detectChanges();
      _self.utils.hideLoading();
    }

    let geocoder = this.here_api.getGeocodingService();

    geocoder.reverseGeocode(
      reverseGeocodingParameters,
      onSuccess,
      function (e) { alert(e); });
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