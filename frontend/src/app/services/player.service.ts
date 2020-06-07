import { Injectable } from '@angular/core';


import { WsService } from './ws.service';
import { iWsMsg } from '../types';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  playerName = '';
  playerId;
  lastSendTime = new Date();
  runningOffsets = []; // ms offsets for timing.
  calculatedOffset = 0;
  RUNNING_OFFSET_LENGTH = 10;
  RUNNING_OFFSET_INTERVAL_MS = 2000;
  constructor(
    private ws: WsService,

  ) {


    this.ws.getSubscription(this.parseMsgFromWs.bind(this));

    setInterval(this.sendHeartbeat.bind(this), this.RUNNING_OFFSET_INTERVAL_MS);
  }

  sendHeartbeat() {
    this.lastSendTime = new Date();
    this.ws.sendToWs('heartbeat', {
      playerId: this.playerId
    });
  }

  calculateOffset(msg) {

    const serverTime = new Date(msg['message'].serverTime);

    const curTime = new Date();
    curTime.toUTCString();

    const offset = (2 * serverTime.getTime() - this.lastSendTime.getTime() - curTime.getTime()) / 2;
    if (this.runningOffsets.length >= this.RUNNING_OFFSET_LENGTH) {
      this.runningOffsets.shift();
    }

    this.runningOffsets.push(offset);
    const total = this.runningOffsets.reduce((el, accum) => {
      return accum + el;
    })
    console.log(total, this.runningOffsets);
    return total / this.runningOffsets.length
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
      this.calculatedOffset = this.calculateOffset(data.message);
      console.log(this.calculatedOffset);
      console.log(this.getServerTime());
    }

  }

  // estimate cur utc time based on running offset
  getServerTime() {
    const curTime = new Date();
    const serverTime = curTime.getTime() + this.calculatedOffset;
    const ret = new Date(serverTime);
    console.log(ret);
    return ret;
  }







}
