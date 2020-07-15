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


  createInProgress = false;
  createAttempts = 0;
  errorMsg = '';

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
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(len * Math.random());
      const letter = String.fromCharCode(charIdxs[idx]);
      ret += letter;
    }
    return ret;
  }
  click_create() {
    if (this.createAttempts >= 3) {
      this.errorMsg = 'Error creating room. 3 attempts failed.';
    } else {
      this.createInProgress = true;
      this.createAttempts++;
      const newGameId = this.getRandomString(6);
      // Send newly generated game id to backend
      // in an initialize message. This should
      // return gameExists == false, because the
      // game has not been created yet.
      this.ws.setGameId(newGameId);
      this.ws.sendToWs('initialize', {});
    }
  }

  //TODO: this should probably unbind after create room.
  // In the meantime, createInProgress is used to turn off
  // subsequent room creatinos.

  parseMsgFromWs(data: iWsMsg) {
    console.log('there', data);
    try {
      if (data.action === 'initialize' && this.createInProgress) {
        if (!data.message['gameExists']) {
          console.log('Create!');
          this.ws.sendToWs('create-room', {});
          console.log('redirect');
        } else {
          // Probably due to random ID collision, try again.
          // Very unlikely!
          this.errorMsg = 'Still trying...';
          this.click_create();
        }
      } else if (data.action === 'create-room') {
        console.log('HII')
        if (data.message['success']) {
          this.createInProgress = false;
          const gameId = data.message['gameId'];
          this.router.navigateByUrl(gameId);
        } else {
          throw Error('Unsuccessful creating room.')
        }
      }
    }
    catch (error) {
      if ('message' in error) {
        this.errorMsg = error['message']
      } else {
        this.errorMsg = 'Unknown error';
      }

    }


  }


}
