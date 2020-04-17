import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { endpoint, iWsMsg } from './../types';

@Injectable({
  providedIn: 'root'
})
export class WsService {

  private ws: WebSocketSubject<any>;
  private apiId = '9owex9co2e';
  private game_id  = 'cccc';
  constructor() {
    const url = `wss://${this.apiId}.execute-api.us-east-1.amazonaws.com/dev_stage`;
    this.ws = webSocket(url);
    console.log('init')
    this.sendToWs('initialize', {});
  }

  sendToWs(endpoint: endpoint, msgIn: { [key: string]: number | string }) {
    const msgToSend = {
      action: endpoint,
      message: Object.assign({
        game_id: this.game_id,
      }, msgIn)
    };
    this.ws.next(msgToSend);
  }

  next(msg) {
    this.ws.next(msg);
  }

  getGameId() {
    return this.game_id;
  }

  getSubscription(callback: (data: any) => any) {
    this.ws.asObservable().subscribe(
      (data)=>{callback(data)});
  }

}
