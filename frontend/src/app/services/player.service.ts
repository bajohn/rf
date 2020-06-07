import { Injectable } from '@angular/core';


import { WsService } from './ws.service';
import { iWsMsg } from '../types';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PlayerNameDialogComponent } from 'src/app/subcomponents/player-name-dialog/player-name-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  playerName = '';
  playerId;
  lastSendTime = new Date();
  constructor(
    private ws: WsService,

  ) {


    this.ws.getSubscription(this.parseMsgFromWs.bind(this));

    setInterval(this.sendHeartbeat.bind(this), 1000);
  }

  sendHeartbeat() {
    this.lastSendTime = new Date();
    this.ws.sendToWs('heartbeat', {
      playerId: this.playerId
    });
  }

  calculateOffset(msg) {

    const serverTime = new Date(msg['message'].serverTime);
    console.log(msg);
    const curTime = new Date();
    curTime.toUTCString()
    console.log('server time', serverTime);
    console.log('last send time', this.lastSendTime);
    console.log('cur time', curTime);
    const offset = (2*serverTime.getTime() - this.lastSendTime.getTime() - curTime.getTime()) / 2;
    console.log('offset', offset);
  }

  parseMsgFromWs(data: iWsMsg) {
    if (typeof data.message === 'string') {
      //TODO: handle this
      console.error(data);
    }
    else if (data.action === 'initialize') {
      if (data.message['gameExists']) {
        console.log('found!');
      } else {
        console.log('No game found. Ask to create');
      }
    }
    else if (data.action === 'heartbeat') {
      console.log('heart');
      console.log(data.message);
      this.calculateOffset(data.message);
    }

  }





}
