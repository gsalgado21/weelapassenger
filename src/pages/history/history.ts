import { Component } from '@angular/core';
import 'rxjs/add/operator/map';
import { ApiService } from '../../services/api-service';
import { Utils } from '../../services/utils';
import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-history',
  templateUrl: 'history.html',
})
export class HistoryPage {
  trips: Array<any>;

  constructor(public api: ApiService, public utils: Utils) {
    this.getTrips();
  }

  getTrips() {
    this.utils.showLoading();
    this.api.getMyTrips().subscribe(data => {
      if (data && data.result == 'success') {
        this.trips = data.trips;
      }
      this.utils.hideLoading();
    });
  }
}