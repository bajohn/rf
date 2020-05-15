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

  constructor(private ws: WsService) {
    this.ws.getSubscription(this.parseMsgFromWs.bind(this));
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
      this._cardIdxLookup = this.getInitIdxs();
      this._maxZ = this.getInitZ();
    } else {
      if ('cardValue' in data.message) {

        const cardValue = data.message['cardValue'];

        if (data.action === 'card-move-end') {

          const updateObj: iCardData = {
            cardValue: cardValue
          };

          if ('x' in data.message) {
            updateObj['x'] = Number(data.message['x']);
          }
          if ('y' in data.message) {
            updateObj['y'] = Number(data.message['y']);
          }
          if ('z' in data.message) {
            updateObj['z'] = Number(data.message['z']);
          }
          if ('groupId' in data.message) {
            updateObj['groupID'] = Number(data.message['groupId']);
          }
          if ('faceUp' in data.message) {
            updateObj['faceUp'] = Boolean(data.message['faceUp']);
          }
          if ('ownerId' in data.message) {
            updateObj['ownerID'] = String(data.message['ownerId']);
          }

          this.updateCard(updateObj);

        }
      }
    }

  }

  getInitIdxs() {
    const ret: { [key: string]: number } = {};
    for (let i = 0; i < this._cards.length; i++) {
      const curCard = this._cards[i];
      ret[curCard.cardValue] = i;
    }
    return ret;
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

  updateCard(updateObj: iCardData) {
    const cardValue = updateObj.cardValue;
    if ('z' in updateObj) {
      const newZ = updateObj['z']
      if (newZ > this._maxZ) {
        this._maxZ = newZ;
      }
    }
    Object.assign(this.getCard(cardValue), updateObj);
  }

  getInitZ() {
    let ret = 0;
    for (const card of this._cards) {
      const curZ = card.z;
      if (curZ > ret) {
        ret = curZ;
      }
    }
    return ret;
  }


}
