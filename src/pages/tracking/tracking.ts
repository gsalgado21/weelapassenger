import { Component } from '@angular/core';
import { NavController, Platform, ModalController, AlertController, IonicPage } from 'ionic-angular';
import { POSITION_INTERVAL } from "../../services/constants";
import { PlaceService } from "../../services/place-service";
import { ApiService } from '../../services/api-service';
import { ServerSocket } from '../../services/server-socket';
import { Utils } from '../../services/utils';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-tracking',
  templateUrl: 'tracking.html'
})
export class TrackingPage {
  driver: any;
  map: any;
  trip: any = {};
  driverTracking: any;
  tripStatus: any;
  alertCnt: any = 0;

  driver_marker: any;
  passenger_marker: any;
  origin_marker: any;
  destination_marker: any;
  private websocketSubscription: any;

  constructor(public nav: NavController, private api: ApiService, private utils: Utils, public platform: Platform, private socket: ServerSocket, public placeService: PlaceService, public modalCtrl: ModalController, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    this.api.getTripInProgress().subscribe(data => {
      if (data && data.result == 'success') {
        this.trip = data.trip;
        this.driver = data.trip.driver;
        this.watchTrip(data.trip.id);
        this.loadMap();
      }
    })
  }

  ionViewWillLeave() {
    clearInterval(this.driverTracking);
    if (this.websocketSubscription) this.websocketSubscription.unsubscribe();
  }

  watchTrip(tripId) {
    if (!this.websocketSubscription)
      this.websocketSubscription = this.socket.connect().subscribe((data) => {
        let resp = JSON.parse(data);
        if (typeof resp.message == 'object' && resp.message.trip_id.toString() == tripId.toString()) {
          if (resp.message.status == 'CANCELED') {
            this.utils.showAlert('Corrida Cancelada', 'A corrida foi cancelada pelo motorista', [{ text: 'Ok', role: 'cancel' }], false);
            this.nav.setRoot('HomePage');
          } else if (resp.message.status == 'GOING') {
            this.passenger_marker.setMap(null);
            this.trip.origin_latitude = this.trip.origin_longitude = null;
            this.updateMarkers();
            this.trip.status = 'GOING';
          } else if (resp.message.status == 'DONE') {
            this.nav.setRoot('SummaryPage');
          }
        }
      });
  }

  loadMap() {
    let latLng = new google.maps.LatLng(this.trip.origin_latitude, this.trip.origin_longitude);

    let mapOptions = {
      center: latLng,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    }

    this.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    this.passenger_marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: 'teal',
        fillOpacity: 1,
        strokeColor: 'aqua',
        strokeWeight: 6,
        strokeOpacity: 0.6
      },

    });
    this.updateMarkers();
    this.trackDriver();
  }

  trackDriver() {
    this.showDriverOnMap();
    this.driverTracking = setInterval(() => {
      this.showDriverOnMap();
    }, POSITION_INTERVAL);
  }

  cancelTrip() {
    if (this.websocketSubscription) this.websocketSubscription.unsubscribe();
    this.api.cancelTrip(this.trip.id).subscribe(data => {
      if (data && data.result == 'success') {
        this.nav.setRoot('HomePage');
      }
    })
  }

  showDriverOnMap() {
    this.api.getDriverLocation(this.trip.driver_id).subscribe(data => {
      if (data && data.result == 'success') {
        let latLng = new google.maps.LatLng(data.latitude, data.longitude);
        if (!this.driver_marker) {
          this.map.setCenter(latLng);
          this.driver_marker = new google.maps.Marker({
            map: this.map,
            position: latLng,
            icon: {
              url: 'assets/img/map-suv.png',
              size: new google.maps.Size(32, 32),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(16, 16),
              scaledSize: new google.maps.Size(32, 32)
            }
          });
        } else {
          this.driver_marker.setPosition(latLng);
          this.map.panTo(latLng);
        }
      }
    })
  }

  private updateMarkers() {
    if (this.trip.origin_latitude && this.trip.origin_longitude) {
      if (this.origin_marker) this.origin_marker.setMap(null);
      this.origin_marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(this.trip.origin_latitude, this.trip.origin_longitude),
        icon: 'assets/img/pin-green.png'
      });
    } else {
      if (this.origin_marker) this.origin_marker.setMap(null);
    }

    if (this.trip.destination_latitude && this.trip.destination_longitude) {
      if (this.destination_marker) this.destination_marker.setMap(null);
      this.destination_marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(this.trip.destination_latitude, this.trip.destination_longitude),
        icon: 'assets/img/pin-red.png'
      });
    } else {
      if (this.destination_marker) this.destination_marker.setMap(null);
    }
  }
}