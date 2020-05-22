import { Injectable } from '@angular/core';
import { WsService } from './ws.service';

import { iCardData, iWsMsg } from '../types';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  _cards: iCardData[] = [];
  _cardIdxLookup: { [key: string]: number };
  _maxZ = 51;
  _activeCard: iCardData | null = null; //not yet used
  mouseOverShelf = false;

  constructor(
    private ws: WsService
  ) {
    this.ws.getSubscription(this._parseMsgFromWs.bind(this));
  }

  // If faceUp- spread out to view cards
  // otherwise, place in a stack.
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
    const shuffledLocation = 10;
    for (const card of this._cards) {
      card.x = faceUp ? 10 * zMap[card.cardValue] : shuffledLocation;
      card.y = shuffledLocation;
      card.z = zMap[card.cardValue];
      card.faceUp = faceUp;
      card.ownerId = '';
      counter++;
    }
    console.log(this._cards);
    this.ws.sendToWs('card-move-end-bulk', { cards: this._cards });
  }

  getCards() {
    return this._cards
  }

  getCard(cardValue: string): iCardData {
    const idx = this._cardIdxLookup[cardValue];
    return this._cards[idx];
  }

  getMaxZ() {
    return this._maxZ;
  }

  setActiveCard(cardValue: string | null) {
    if (typeof cardValue === 'string') {
      this._activeCard = this.getCard(cardValue)
    } else {
      this._activeCard = null;
    }

  }
  getActiveCard(): iCardData | null {
    return this._activeCard;
  }

  updateCard(updateObj: iCardData) {
    const cardValue = updateObj.cardValue;
    if ('z' in updateObj) {
      const newZ = updateObj['z']
      if (newZ > this._maxZ) {
        this._maxZ = newZ;
      }
    }
    console.log(updateObj);
    Object.assign(this.getCard(cardValue), updateObj);
  }

  _getInitZ() {
    let ret = 0;
    for (const card of this._cards) {
      const curZ = card.z;
      if (curZ > ret) {
        ret = curZ;
      }
    }
    return ret;
  }

  _getInitIdxs() {
    const ret: { [key: string]: number } = {};
    for (let i = 0; i < this._cards.length; i++) {
      const curCard = this._cards[i];
      ret[curCard.cardValue] = i;
    }
    return ret;
  }



  _parseMsgFromWs(data: iWsMsg) {
    if (typeof data.message === 'string') {
      //TODO: handle this
      console.error(data);
    }
    else if (data.action === 'initialize-cards') {
      this._cards = data.message['cards'];
      this._cardIdxLookup = this._getInitIdxs();
      this._maxZ = this._getInitZ();
    }
    else if (data.action === 'card-move-end-bulk') {
      const newCards = data.message['cards'] as iCardData[];
      // this._maxZ = this._getInitZ();
      for (const card of newCards) {
        console.log('update', card);
        const cardValue = card.cardValue;
        const idx = this._cardIdxLookup[cardValue];
        Object.assign(this._cards[idx], card);
      }
    }
  }


}
