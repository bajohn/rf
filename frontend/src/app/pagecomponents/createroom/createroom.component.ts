import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WsService } from 'src/app/services/ws.service';
import { iWsMsg } from 'src/app/types';

@Component({
  selector: 'app-createroom',
  templateUrl: './createroom.component.html',
  styleUrls: ['./createroom.component.css']
})
export class CreateRoomComponent implements OnInit {

  constructor(
    private router: Router,
    private ws: WsService
  ) {
    this.ws.getSubscription(this.parseMsgFromWs.bind(this));
  }

  ngOnInit(): void {

  }

  getRandomString(length: number) {
    const charIdxs = [];
    let ret = '';
    for (let i = 48; i <= 122; i++) {
      if (
        (i <= 57) || // numbers
        //(i >= 65 && i <= 90) || // upper case  letters
        (i >= 97)) { // lower case letters
        charIdxs.push(i);
      }
    }
    const len = charIdxs.length;
    console.log(len);
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(len * Math.random());
      const letter = String.fromCharCode(charIdxs[idx]);
      ret += letter;
    }
    return ret;
  }
  click_create() {
    const x = this.getRandomString(6);
    console.log(x);
    this.ws.setGameId(x);
    this.ws.sendToWs('initialize', {});
  }

  parseMsgFromWs(data: iWsMsg) {
    console.log(data);
    if (data.action === 'initialize') {
      if (!data.message['game_exists']) {
        console.log('Create!');
        this.ws.sendToWs('create-room', {});
        console.log('redirect');
      } else {
        // random ID collision, try again
        // very unlikely!
        this.click_create();
      }
    }
  }


}
