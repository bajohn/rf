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
  cards: iCardData[] = [];

  

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

  click_shuffle_recall() {
    this.do_shuffle(false);
  }

  click_shuffle_spread() {
    this.do_shuffle(true);
  }

  do_shuffle(faceUp: boolean) {
    const cards: iCardData[] = [].concat(this.cards);
    const zMap = {};

    let counter = 0;
    while (cards.length > 0) {
      const len = cards.length;
      const idx = Math.floor(len * Math.random());
      const curEl = cards.splice(idx, 1)[0];
      zMap[curEl.cardValue] = counter;
      counter++;
    }
    counter = 0;
    for (const card of this.cards) {
      card.x = faceUp ? 10 * zMap[card.cardValue] : 10;
      card.y = 10;
      card.z = zMap[card.cardValue];
      card.faceUp = faceUp;
      this.ws.sendToWs('card-move-end', card);
      counter++;
    }
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
      this.cards = data.message['cards'];
    }

  }




}
