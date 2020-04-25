import { Component, OnInit } from '@angular/core';
import { WsService } from '../../services/ws.service';
import { position, iWsMsg } from '../../types';
import { Router } from '@angular/router';


@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {





  cardTypes: string[] = []

  cardData: { cardPosition: position, cardValue: string }[] = [];


  constructor(
    private ws: WsService,
    private router: Router
  ) {
    this.ws.getSubscription(this.parseMsgFromWs.bind(this));
    const gameId = this.router.url.substring(1);
    this.ws.setGameId(gameId);
    this.ws.sendToWs('initialize', {});
  }

  ngOnInit() {
    console.log(this.cardData);
  }

  setDefaultCards() {
    let i = 0;
    for (const suit of ['H', 'D', 'S', 'C']) {
      for (let value of ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']) {
        const cardValue = `${value}${suit}`
        const toPush = { cardValue: cardValue, cardPosition: { x: 60 * (i % 10), y: 80 * Math.floor(i / 10) } };
        this.cardData.push(toPush);
        i++;
      }
    }
  }

  click_broadcast() {
    console.log('broadcast');
    this.ws.next({
      action: 'send-message', message: {
        broadcast_message: { x: 123 }
      }
    });
  }

  click_clear() {
    console.log('delete');
    this.ws.next({ action: 'clear-connections', message: {} });

  }

  click_check() {
    console.log(this.cardData);
  }

  click_recall() {
    for (let data of this.cardData) {



      data.cardPosition = { x: 0, y: 0 }

    }
    const posMsg = {
      x: 0,
      y: 0,
      cardValue: 'all'
    };
    this.ws.sendToWs('card-move-end', posMsg);
  }

  click_dynamo() {
    //this.ws.sendToWs('test', {});
    this.ws.sendToWsRaw({ action: 'test', message: {} });
  }


  parseMsgFromWs(data: iWsMsg) {
    console.log(data);
    if (data.action === 'initialize') {
      if (data.message['game_exists']) {
        console.log('found!'); 
      } else {
        console.log('No game found. Ask to create');
      }
    }
  }




}
