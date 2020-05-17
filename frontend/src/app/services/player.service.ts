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
  constructor(
    private ws: WsService,

  ) {


    this.ws.getSubscription(this.parseMsgFromWs.bind(this));


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

  }





}
