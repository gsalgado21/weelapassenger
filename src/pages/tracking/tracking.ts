import { Component, OnInit } from '@angular/core';
import { NavController, Platform, ModalController, AlertController, IonicPage } from 'ionic-angular';
import { POSITION_INTERVAL, MAP_STYLE } from "../../services/constants";
import { PlaceService } from "../../services/place-service";
import { ApiService } from '../../services/api-service';
import { ServerSocket } from '../../services/server-socket';
import { Utils } from '../../services/utils';
import { DriverService } from '../../services/driver-service';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-tracking',
  templateUrl: 'tracking.html'
})
export class TrackingPage implements OnInit {
  driver: any;
  map: any;
  trip: any = {};
  driverTracking: any;
  tripStatus: any;
  alertCnt: any = 0;

  driver_marker: any;
  origin_marker: any;
  destination_marker: any;
  private websocketSubscription: any;

  infowindow:any;

  last_lat_lng: any;

  constructor(public nav: NavController, private api: ApiService, private utils: Utils, public platform: Platform, private socket: ServerSocket, public placeService: PlaceService,
    private driverService: DriverService) {
  }


  ngOnInit() {
    let divMap = (<HTMLInputElement>document.getElementById('map_tracking'));
    this.map = new google.maps.Map(divMap, {
      zoom: 18,
      center: new google.maps.LatLng(-23.0269805, -45.5521864),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      styles: MAP_STYLE
    });
  }

  ionViewDidLoad() {
    this.utils.showLoading();
    this.api.getTripInProgress().subscribe(data => {
      this.utils.hideLoading();
      if (data && data.result == 'success') {
        this.trip = data.trip;
        this.driver = data.trip.driver;
        this.watchTrip(data.trip.id);
        this.updateMarkers();
        this.trackDriver();
      }
    }, err => {
      this.utils.showError();
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
            this.trip.origin_latitude = this.trip.origin_longitude = null;
            this.updateMarkers();
            this.trip.status = 'GOING';
          } else if (resp.message.status == 'DONE') {
            this.nav.setRoot('SummaryPage');
          }
        }
      }, err => {
        if (this.websocketSubscription) this.websocketSubscription.unsubscribe();
        this.websocketSubscription = null;
        setTimeout(() => { this.watchTrip(tripId) }, 5000);
      });
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
        if (!this.last_lat_lng) this.last_lat_lng = latLng;

        if (!this.driver_marker) {
          this.map.setCenter(latLng);
          this.driver_marker = new google.maps.Marker({
            map: this.map,
            position: latLng,
            icon: {
              url: 'assets/img/car_right.png',
              size: new google.maps.Size(40, 40),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(20, 20),
              scaledSize: new google.maps.Size(40, 40)
            }
          });
           this.infowindow = new google.maps.InfoWindow({
            content: this.calcCrow(data.latitude,data.longitude, this.trip.origin_latitude, this.trip.origin_longitude) + ' MIN',
          });
        } else {
          this.driver_marker.setPosition(latLng);
          let angle = this.driverService.getIconWithAngle(this.last_lat_lng.lat(), this.last_lat_lng.lng(), latLng.lat(), latLng.lng());
          this.driver_marker.setIcon({
            url: 'assets/img/car' + angle + '.png',
            size: new google.maps.Size(40, 40),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(20, 20),
            scaledSize: new google.maps.Size(40, 40)
          });
          this.infowindow.setContent(this.calcCrow(data.latitude,data.longitude, this.trip.origin_latitude, this.trip.origin_longitude) + ' MIN');
          this.map.panTo(latLng);
          this.last_lat_lng = latLng;
        }
        this.infowindow.open(this.map,this.driver_marker);
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

  // retorna distancia em minutos carro à 40km/h
  private calcCrow(lat1, lon1, lat2, lon2) {
    let R = 6371; // km
    let dLat = this.toRad(lat2 - lat1);
    let dLon = this.toRad(lon2 - lon1);
    lat1 = this.toRad(lat1);
    lat2 = this.toRad(lat2);
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return (d*2.5).toFixed(0);
  }

  private toRad(value) {
    return value * Math.PI / 180;
  }
}
