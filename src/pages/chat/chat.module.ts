import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatPage } from './chat';
import { ServerSocket } from '../../services/server-socket';
import { NativeAudio } from '@ionic-native/native-audio';

@NgModule({
  declarations: [ChatPage],
  imports: [IonicPageModule.forChild(ChatPage)],
  entryComponents: [ChatPage],
  providers: [ServerSocket, NativeAudio]
})
export class ChatPageModule { }
