import { Injectable } from '@angular/core'
import { QueueingSubject } from 'queueing-subject'
import websocketConnect from 'rxjs-websockets'
import 'rxjs/add/operator/share'
const input = new QueueingSubject<string>();

@Injectable()
export class ServerSocket {
  public messages: any;
  public connectionStatus: any;

  constructor() { }

  public connect() {
    let url = 'wss://api.weela.com.br/wsc/' + localStorage.getItem('auth_token');
    //let url = 'ws://192.168.15.17:3000/wsc/' + localStorage.getItem('auth_token');

    if (this.messages) {
      this.messages = null;
      this.connectionStatus = null;
    }
    let conection = websocketConnect(url, input);
    this.messages = conection.messages;
    this.connectionStatus = conection.connectionStatus;
    setTimeout(() => {
      this.send(JSON.stringify({ "command": "subscribe", "identifier": "{\"channel\":\"TripChannel\"}" }));
    }, 800)
    return this.messages;
  }


  public connect2(channel, room?) {
    let input = new QueueingSubject<string>();
    let url = 'wss://api.weela.com.br/wsc/' + localStorage.getItem('auth_token');
    //let url = 'ws://192.168.15.27:3000/wsc/' + localStorage.getItem('auth_token');
    if (this.messages) {
      this.messages = null;
      this.connectionStatus = null;
    }
    let conection = websocketConnect(url, input);
    this.messages = conection.messages;
    this.connectionStatus = conection.connectionStatus;
    setTimeout(() => {
      if (room) {
        this.send2(input, JSON.stringify({ "command": "subscribe", "identifier": "{\"channel\":\"" + channel + "\", \"room\":\"" + room + "\"}" }));
      } else {
        this.send2(input, JSON.stringify({ "command": "subscribe", "identifier": "{\"channel\":\"" + channel + "\"}" }));
      }
    }, 800)
    return this.messages;
  }

  public send(message): void {
    input.next(message);
  }

  public send2(input, message): void {
    input.next(message);
  }
}