import { Injectable } from '@angular/core';
import { Http, Headers, Response, URLSearchParams } from '@angular/http';
import { File } from '@ionic-native/file';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class HttpService {

  public api_path: string;

  constructor(private http: Http, private file: File, private transfer: FileTransfer) {
    this.api_path = 'https://api.weela.com.br/api/v1/';
    //this.api_path = 'http://192.168.15.17:3000/api/v1/';
  }

  createAuthorizationHeader(headers: Headers) {
    headers.append('Authorization', localStorage.getItem('auth_token'));
  }

  get(url, data, avoid_auth?) {
    let headers = new Headers();
    console.log(url);
    if (!avoid_auth) this.createAuthorizationHeader(headers);
    let obj = { headers: headers, search: null };
    if (data != null) {
      obj.search = this.mountParams(data);
    }
    return this.http.get(this.api_path + url, obj).map(this.extractData);
  }

  post(url, data, avoid_auth?) {
    console.log(url);
    let headers = new Headers();
    if (!avoid_auth) this.createAuthorizationHeader(headers);
    return this.http.post(this.api_path + url, data, {
      headers: headers
    }).map(this.extractData);
  }

  put(url, data) {
    console.log(url);
    let headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.patch(this.api_path + url, data, {
      headers: headers
    }).map(this.extractData);
  }

  delete(url) {
    console.log(url);
    let headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.delete(this.api_path + url, {
      headers: headers
    }).map(this.extractData);
  }


  private extractData(res: Response) {
    let body = res.json();
    console.log(body);
    return body || {};
  }

  private mountParams(filter) {
    let params: URLSearchParams = new URLSearchParams();
    for (var x in filter) {
      params.set(x, filter[x]);
    }
    return params;
  }

  public uploadImage(url, path, params): Observable<any> {
    return Observable.create((observer) => {
      const fileTransfer: FileTransferObject = this.transfer.create();
      var picture_name = path.split('/')[path.split('/').length - 1];
      if (!params) params = {};
      var format;
      if (picture_name.indexOf('?') != -1) picture_name = picture_name.substring(0, picture_name.lastIndexOf('?'));
      format = picture_name.substring(picture_name.lastIndexOf('.') + 1)
      params['fileName'] = picture_name;
      let headers = new Headers();
      this.createAuthorizationHeader(headers);
      var options = {
        fileKey: "file",
        fileName: picture_name,
        chunkedMode: false,
        params: params,
        mimeType: 'image/' + format,
        headers: headers,
      };
      fileTransfer.upload(path, this.api_path + url, options).then(data => {
        console.log(data);
        observer.next(data);
        observer.complete();
      }, err => {
        console.log(err)
        observer.next(err);
        observer.complete();
      });
    });
  }
}
