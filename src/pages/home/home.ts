import { Component } from '@angular/core';
import { NavController, Platform, IonicPage } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { PlaceService } from "../../services/place-service";
import { Utils } from "../../services/utils";
import { Diagnostic } from '@ionic-native/diagnostic';
import { ApiService } from '../../services/api-service';
import { HERE_MAP_API_KEY} from '../../services/constants';

declare var H: any;
var currentVersion = 5.0;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  categories: Array<any>;
  trip: any = { payment_method: 'CASH' };
  map: any;
  here_api: any;
  routeLine: any;
  origin_marker: any;
  destination_marker: any;
  selected_category: any = 0;
  confirmed_category: any;

  constructor(public nav: NavController, public platform: Platform, public placeService: PlaceService, private diagnostic: Diagnostic,
    private geolocation: Geolocation, public utils: Utils, private api: ApiService) {}

  ionViewDidLoad() {
    this.api.getAppVersion().subscribe(data =>{
      if(data.version > currentVersion) {
        let buttons: Array<any> = [];
        buttons.push({ text: data.button, handler: () => { window.open(data.link, '_system', 'location=yes') } })
        this.utils.showAlert(data.title, data.message, buttons, false);
      }
    });

    this.api.getTripInProgress().subscribe(data => {
      if (data && data.result == 'success') {
        if (data.trip.status == 'DONE') this.nav.setRoot('SummaryPage');
        else this.nav.setRoot('TrackingPage');
      }
    });
    this.checkGPS();
    this.platform.resume.subscribe(() => this.checkGPS());
    
    this['loading_map'] = true;

    setTimeout(() => {
      this['loading_map'] = false;

      this.here_api = new H.service.Platform({
        'apikey': HERE_MAP_API_KEY
      });

      let maptypes = this.here_api.createDefaultLayers();

      this.map = new H.Map(
        document.getElementById('map_home'),
        maptypes.raster.normal.map,
        {
          zoom: 10,
          center: { lng: -45.5521864, lat: -23.0269805 }
        });

      new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));

      window.addEventListener('resize', () => this.map.getViewPort().resize());
      
      this.loadCurrentPosition(this.map);

      const removeHereLogo = setInterval(() => {
        const hereLogo = document.getElementsByClassName('H_logo')[0];
        const hereCopyright = document.getElementsByClassName('H_copyright')[0];
        if(document.body.contains(hereLogo)) {
          hereLogo.parentNode.removeChild(hereLogo);
          hereCopyright.parentNode.removeChild(hereCopyright);
          clearInterval(removeHereLogo);
        }
      }, 500);
    }, 500);
  }

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
    this.geolocation.getCurrentPosition({ timeout: 5000, enableHighAccuracy: true, maximumAge: Number.MAX_SAFE_INTEGER }).then((resp) => {
      let lat_lng = new H.geo.Point(resp.coords.latitude, resp.coords.longitude);

      let _self = this;
      let reverseGeocodingParameters = {
        prox: lat_lng.lat + ',' + lat_lng.lng + ',10',
        mode: 'retrieveAddresses',
        maxresults: 1
      };

      function onSuccess(result) {
        let location = result.Response.View[0].Result[0];

        _self.trip.origin_vicinity = location.Location.Address.Label;
        _self.trip.origin_latitude = location.Location.DisplayPosition.Latitude;
        _self.trip.origin_longitude = location.Location.DisplayPosition.Longitude;
        map.setCenter(lat_lng);
        map.setZoom(16);
        _self.updateMarkers();
      }

      let geocoder = this.here_api.getGeocodingService();

      geocoder.reverseGeocode(
        reverseGeocodingParameters,
        onSuccess,
        function (e) { alert(e); });
    });
  }

  public hasOriginAndDestination() {
    return this.trip.origin_latitude && this.trip.origin_longitude && this.trip.destination_longitude && this.trip.destination_latitude;
  }

  private async loadCategories() {
    return new Promise((resolve, reject) => {
      this.api.getCategories().subscribe(data => {
        if (data && data.result == 'success') {
          this.categories = data.categories;
          resolve(data);
        }
      }, error => { reject(error) });
    });
  }

  private async updateMarkers() {
    if (this.trip.origin_latitude && this.trip.origin_longitude) {
      let green_icon = new H.map.Icon('assets/img/pin-green.png');

      if (this.origin_marker)
        this.map.removeObject(this.origin_marker);

      this.origin_marker = new H.map.Marker(new H.geo.Point(this.trip.origin_latitude, this.trip.origin_longitude), { icon: green_icon });
      this.map.addObject(this.origin_marker);
    }

    if (this.trip.destination_latitude && this.trip.destination_longitude) {
      let red_icon = new H.map.Icon('assets/img/pin-red.png');

      if (this.destination_marker)
        this.map.removeObject(this.destination_marker);

      this.destination_marker = new H.map.Marker(new H.geo.Point(this.trip.destination_latitude, this.trip.destination_longitude), { icon: red_icon });
      this.map.addObject(this.destination_marker);
    }

    if (this.hasOriginAndDestination()) {
      this.showDirections();
      this.map.setZoom(this.map.getZoom() - 6);
      this['loading'] = true;
      this.confirmed_category = false;
      this.selected_category = 0;
      this.trip.discount_amount = undefined;
      this.trip.coupon_token = undefined;
      this.trip.total_amount = undefined;

      try { 
        await this.loadCategories() 
      } catch(e) {
        this.throwSimulationError();
        return;
      }
      
      const simulations = this.categories.map(async(category, index) => {
        await this.simulate(category.id, index);
      });

      try {
        await Promise.all(simulations);
        this['loading'] = false;
      } catch(e) {
        this.throwSimulationError();
      }
    } else {
      let zoom = this.map.getZoom();
      if (zoom > 14) this.map.setZoom(15);
    }
  }

  private async simulate(category_id, index) {
    return new Promise((resolve, reject) => {
      this.trip.category_id = category_id
      this.api.simulateTrip(this.trip).subscribe(data => {
        if (data && data.result == 'success') {
          if(typeof data.disabled !== 'undefined')
            this.categories[index].disabled = data.disabled;
          this.categories[index].price = data.trip_total;
          this.trip.category_id = undefined;
          resolve();
        } else
          reject();
      }, error => reject(error));
    });
  }

  private throwSimulationError() {
    this.utils.showAlert('Que Pena', 'Ocorreu um erro ao simular esta corrida. Tente Novamente mais tarde.', [{ text: 'Ok', handler: () => { this.nav.setRoot('HomePage') } }], false);
  }

  private showDirections() {
    let _self = this;
    let routingParameters = {
      'mode': 'fastest;car',
      'waypoint0': 'geo!' + this.trip.origin_latitude + ',' + this.trip.origin_longitude,
      'waypoint1': 'geo!' + this.trip.destination_latitude + ',' + this.trip.destination_longitude,
      'representation': 'display'
    };

    let onResult = function (result) {
      let route, routeShape, linestring;

      if (result.response.route) {
        route = result.response.route[0];
        routeShape = route.shape;

        linestring = new H.geo.LineString();

        routeShape.forEach(function (point) {
          let parts = point.split(',');
          linestring.pushLatLngAlt(parts[0], parts[1]);
        });

        if (_self.routeLine)
          _self.map.removeObject(_self.routeLine);

        _self.routeLine = new H.map.Polyline(linestring, {
          style: { strokeColor: 'Tomato', lineWidth: 5 }
        });

        _self.map.addObject(_self.routeLine);

        _self.map.getViewModel().setLookAtData({ bounds: _self.routeLine.getBoundingBox() });
      }
    };

    let router = this.here_api.getRoutingService();

    router.calculateRoute(routingParameters, onResult,
      function (error) {
        alert(error.message);
      });
  }

  public confirmCategory() {
    this.trip.category_id = this.categories[this.selected_category].id;
    this.trip.total_amount = this.categories[this.selected_category].price;
    this.confirmed_category = true;
  }

  requestCar() {
    this.utils.showLoading();
    console.log(this.trip)
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

  private checkGPS() {
    if (this.platform.is('cordova')) {
      this.diagnostic.getLocationMode().then(mode => {
        if (mode != 'high_accuracy' && mode != 'device_only') {
          this['gps_alert'] = true;
        } else {
          this['gps_alert'] = false;
        }
      });
    }
  }
}
