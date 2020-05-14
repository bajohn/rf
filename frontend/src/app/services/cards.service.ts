import { Injectable } from '@angular/core';
import { WsService } from './ws.service';

import { iCardData, iWsMsg } from '../types';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  _cards: iCardData[] = [];
  _cardIdxLookup: { [key: string]: number };

  constructor(private ws: WsService) {
    this.ws.getSubscription(this.parseMsgFromWs.bind(this));
  }
  doShuffle(faceUp: boolean) {
    const cards: iCardData[] = [].concat(this._cards);
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
    for (const card of this._cards) {
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
    else if (data.action === 'initialize-cards') {
      this._cards = data.message['cards'];
    }

  }

  getCards() {
    return this._cards
  }
}
