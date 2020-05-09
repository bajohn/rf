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
  cardIdxLookup: { [key: string]: number }; //
  cards = [];

  constructor(
    private ws: WsService,
    private router: Router
  ) {
    //this.initCards = this.getDefaultCards();
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
    else if (data.action === 'initialize-cards') {
      const cards = data.message['cards'];
      console.log(cards);
      this.cards = cards;
    }
    else if ('cardValue' in data.message) {

      // const cardValue = data.message['cardValue'];

      // if (data.action === 'card-move-end' && (cardValue === this.cardValue || data.message['cardValue'] === 'all')) {
      //   console.log(cardValue, data.message);
      //   if (data.message)
      //     if ('x' in data.message) {
      //       this.x = Number(data.message['x']);
      //     }
      //   if ('y' in data.message) {
      //     this.y = Number(data.message['y']);
      //   }
      //   if ('z' in data.message) {
      //     this.x = Number(data.message['z']);
      //   }
      //   if ('groupId' in data.message) {
      //     this.groupId = Number(data.message['groupId']);
      //   }
      //   if ('faceUp' in data.message) {
      //     this.faceUp = Boolean(data.message['faceUp']);
      //   }
      //   if ('ownerId' in data.message) {
      //     this.ownerId = String(data.message['ownerId']);
      //   }
      // }
    }
  }




}
