import { Injectable } from "@angular/core";

@Injectable()
export class DriverService {

  constructor() { }

  // return icon suffix by angle
  getIconWithAngle(oldLat, oldLng, lat, lng) {
    let angle = (Math.atan2(lat - oldLat, lng - oldLng)) * (180 / Math.PI);

    if (angle >= -180 && angle <= -160) {
      return '_left';
    }

    if (angle > -160 && angle <= -110) {
      return '_bottom_left';
    }

    if (angle > -110 && angle <= -70) {
      return '_bottom';
    }

    if (angle > -70 && angle <= -20) {
      return '_bottom_right';
    }

    if (angle >= -20 && angle <= 20) {
      return '_right';
    }

    if (angle > 20 && angle <= 70) {
      return '_top_right';
    }

    if (angle > 70 && angle <= 110) {
      return '_top';
    }

    if (angle > 110 && angle <= 160) {
      return '_top_left';
    }

    if (angle > 160 && angle <= 180) {
      return '_left';
    }
  }
}