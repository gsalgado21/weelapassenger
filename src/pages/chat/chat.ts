import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavParams, Content, ViewController } from 'ionic-angular';
import { ApiService } from '../../services/api-service';
import { Utils } from '../../services/utils';
import { ServerSocket } from '../../services/server-socket';
import { NativeAudio } from '@ionic-native/native-audio';

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
  trip_id: number;
  messages: Array<any>;
  message: string;
  websocketMessages: any;
  current_user = localStorage.getItem('current_user');

  @ViewChild(Content) content: Content;

  constructor(public view: ViewController, public navParams: NavParams, private audio: NativeAudio, private utils: Utils, private api: ApiService, private socket: ServerSocket) {
    this.audio.preloadSimple('message_created', 'assets/message_created.mp3').then(a => {
      console.log(a);
    }).catch(e => {
      console.log('preload error ', e);
    });

    this.audio.preloadSimple('message_received', 'assets/message_received.mp3').then(a => {
      console.log(a);
    }).catch(e => {
      console.log('preload error ', e);
    });

  }

  ionViewDidLoad() {
    this.trip_id = this.navParams.get('trip_id');
    this.api.getMessages(this.trip_id).subscribe(data => {
      if (data && data.result == 'success') {
        this.messages = data.messages;
        this.scrollBottom();
        this.watchMessages();
        this.api.readMessage(this.messagesUnreaded()).subscribe(data => { });
      }
    })
  }

  ionViewDidLeave() {
    if (this.websocketMessages) this.websocketMessages.unsubscribe();
  }

  sendMessage() {
    this.message = this.message.trim();
    if (this.message != '') {
      this.utils.showLoading();
      this.api.createMessage({ trip_id: this.trip_id, content: this.message }).subscribe(() => {
        this.message = '';
        this.scrollBottom();
        this.utils.hideLoading();
      });
    } else {
      this.utils.showToast('A mensagem não pode estar vazia');
    }
  }

  private scrollBottom() {
    setTimeout(() => {
      this.content.scrollToBottom(100);
    }, 200);
  }

  private messagesUnreaded() {
    return this.messages.filter((v) => { return v.receiver_id == this.current_user && !v.readed }).map((v) => { return v.id });
  }

  private watchMessages() {
    if (!this.websocketMessages) {
      this.websocketMessages = this.socket.connect2('MessagesChannel', this.trip_id).subscribe((data) => {
        let resp = JSON.parse(data);
        if (typeof resp.message == 'object') {
          if (resp.message.action == 'new') {
            this.api.getMessage(resp.message.message_id).subscribe(msg => {
              this.messages.push(msg);
              if (this.current_user == msg.sender_id) {
                this.audio.play('message_created');
              } else {
                this.audio.play('message_received');
                this.api.readMessage([resp.message.message_id]).subscribe(x => { });
              }
              this.scrollBottom();
            });
          } else if (resp.message.action == 'read') {
            for (let i in this.messages)
              if (this.messages[i]['id'] == resp.message.message_id)
                this.messages[i]['readed'] = new Date();
          }
        }
      }, err => {
        if (this.websocketMessages) this.websocketMessages.unsubscribe();
        this.websocketMessages = null;
        setTimeout(() => { this.watchMessages() }, 5000);
      });
    }
  }
}