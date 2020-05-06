import { Component, OnInit } from '@angular/core';
import { WsService } from '../../services/ws.service';
import { iCardData, iWsMsg } from '../../types';
import { Router } from '@angular/router';


@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {





  cardTypes: string[] = [];
  initCards = [];

  constructor(
    private ws: WsService,
    private router: Router
  ) {
    this.initCards = this.getDefaultCards();
    this.ws.getSubscription(this.parseMsgFromWs.bind(this));
    const gameId = this.router.url.substring(1);
    this.ws.setGameId(gameId);
    this.ws.sendToWs('initialize', {});
  }

  ngOnInit() {
  }

  getDefaultCards() {
    const cardData = [];
    let i = 0;
    for (const suit of ['H', 'D', 'S', 'C']) {
      for (let value of ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']) {
        const cardValue = `${value}${suit}`
        const toPush = {
          cardValue: cardValue,
          //cardPosition: { x: 60 * (i % 10), y: 80 * Math.floor(i / 10) }
        };
        cardData.push(toPush);
        i++;
      }
    }
    return cardData;
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
  }

  click_shuffle() {
    this.ws.sendToWs('card-shuffle', {});
  }


  parseMsgFromWs(data: iWsMsg) {
    console.log(data);
    if (data.action === 'initialize') {
      if (data.message['gameExists']) {
        console.log('found!');
      } else {
        console.log('No game found. Ask to create');
      }
    }
  }




}
