import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { endpoint, iWsMsg } from './../types';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class WsService {

  private ws: WebSocketSubject<any>;
  private apiId = '9owex9co2e';
  private gameId = '';
  constructor(
  ) {
    const url = `wss://${this.apiId}.execute-api.us-east-1.amazonaws.com/dev_stage`;
    this.ws = webSocket(url);
  }

  sendToWs(endpoint: endpoint, msgIn: { [key: string]: number | string }) {
    if (this.gameId.length === 0) {
      throw (Error(`Invalid Game ID! ${this.gameId}`))
    } else {
      const msgToSend = {
        action: endpoint,
        message: Object.assign({
          game_id: this.gameId,
        }, msgIn)
      };
      this.ws.next(msgToSend);
    }

  }
  sendToWsRaw(msg: any) {
    this.ws.next(msg);
  }

  next(msg) {
    this.ws.next(msg);
  }

  getGameId() {
    return this.gameId;
  }

  setGameId(gameId: string) {
    this.gameId = gameId;
  }

  getSubscription(callback: (data: any) => any) {
    this.ws.asObservable().subscribe(
      (data) => { callback(data) });
  }

}

