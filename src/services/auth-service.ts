import { Injectable } from "@angular/core";
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take'
import { DEFAULT_AVATAR, EMAIL_VERIFICATION_ENABLED } from "./constants";

@Injectable()
export class AuthService {
  user: any;

  constructor(public afAuth: AngularFireAuth, public db: AngularFireDatabase, public storage: Storage) { }

  // get current user data from firebase
  getUserData() {
    return this.afAuth.auth.currentUser;
  }

  // get passenger by id
  getUser(id) {
    return this.db.object('passengers/' + id).valueChanges();
  }

  // login by email and password
  login(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }


  logout() {
    return this.afAuth.auth.signOut();
  }

  // register new account
  register(email, password, name, phoneNumber) {
    return Observable.create(observer => {
      this.afAuth.auth.createUserWithEmailAndPassword(email, password).then((authData: any) => {
        authData.name = name;
        authData.phoneNumber = phoneNumber;
        authData.isPhoneVerified = false;
        if (EMAIL_VERIFICATION_ENABLED === true)
          this.getUserData().sendEmailVerification();
        // update passenger object
        this.updateUserProfile(authData);
        observer.next();
      }).catch((error: any) => {
        if (error) {
          observer.error(error);
        }
      });
    });
  }

  // update user display name and photo
  updateUserProfile(user) {
    console.log(user);
    let name = user.name ? user.name : user.email;
    let photoUrl = user.photoURL ? user.photoURL : DEFAULT_AVATAR;

    this.getUserData().updateProfile({
      displayName: name,
      photoURL: photoUrl
    });

    // create or update passenger
    this.db.object('passengers/' + user.uid).update({
      name: name,
      photoURL: photoUrl,
      email: user.email,
      phoneNumber: user.phoneNumber ? user.phoneNumber : '',
      isPhoneVerified: user.isPhoneVerified
    })
  }

  // create new user if not exist
  createUserIfNotExist(user) {
    // check if user does not exist
    this.getUser(user.uid).subscribe(snapshot => {
      if (snapshot === null) {
        // update passenger object
        this.updateUserProfile(user);
      }
    });
  }

  // update card setting
  updateCardSetting(number, exp, cvv, token) {
    const user = this.getUserData();
    this.db.object('passengers/' + user.uid + '/card').update({
      number: number,
      exp: exp,
      cvv: cvv,
      token: token
    })
  }

  // get card setting
  getCardSetting() {
    const user = this.getUserData();
    return this.db.object('passengers/' + user.uid + '/card');
  }
}
