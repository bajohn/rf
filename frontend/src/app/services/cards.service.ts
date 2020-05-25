import { Injectable } from '@angular/core';
import { WsService } from './ws.service';

import { iCardData, iWsMsg } from '../types';
import { RoomService } from './room.service';
import { PlayerService } from './player.service';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  _cards: iCardData[] = [];
  _cardIdxLookup: { [key: string]: number };
  _maxZ = 51;
  _shelfCardSpacing = 10;

  shelfCards: string[] = [];

  constructor(
    private ws: WsService,
    private roomService: RoomService,
    private playerService: PlayerService
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

  updateCard(updateObj: iCardData) {
    const cardValue = updateObj.cardValue;
    const curCard = this.getCard(cardValue);
    let cardsToWs = [];
    if ('z' in updateObj) {
      const newZ = updateObj['z']
      if (newZ > this._maxZ) {
        this._maxZ = newZ;
      }
    }

    let placedInShelf = false;
    //TODO: DRY this up!!!
    if ('ownerId' in updateObj) {
      if (this.playerService.playerId === updateObj.ownerId) {
        this.placeInShelf(cardValue);
        cardsToWs = cardsToWs.concat(this._getShelfCards());
        placedInShelf = true;
      }
      else if ('' === updateObj.ownerId) {
        if (curCard.ownerId === this.playerService.playerId) {
          this.removeFromShelf(cardValue)
          cardsToWs = cardsToWs.concat(this._getShelfCards());
        }
      }
    }
    if (!placedInShelf) {
      Object.assign(this.getCard(cardValue), updateObj);
      cardsToWs.push(this.getCard(cardValue));
    }


    console.log(cardsToWs);


    this.ws.sendToWs('card-move-end-bulk', { cards: cardsToWs });
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
      for (const card of newCards) {
        const cardValue = card.cardValue;
        const idx = this._cardIdxLookup[cardValue];
        Object.assign(this._cards[idx], card);
      }
    }
  }

  placeInShelf(cardValue: string) {
    console.log('place in shelf')
    const cardData = this.getCard(cardValue);
    const cardPlace = Math.ceil(cardData.x / this._shelfCardSpacing)
    if (this.shelfCards.indexOf(cardValue) === -1) {
      if (this.shelfCards.length < cardPlace) {
        this.shelfCards.push(cardData.cardValue);
      } else {
        this.shelfCards.splice(cardPlace, 0, cardData.cardValue);
      }
    }
    this._updateShelfCards();
  }

  removeFromShelf(cardValue: string) {
    console.log('remove from shelf')
    const cardData = this.getCard(cardValue)
    const idx = this.shelfCards.indexOf(cardData.cardValue);
    if (idx >= 0) {
      this.shelfCards.splice(idx, 1);
    }

    this._updateShelfCards();
  }

  _updateShelfCards() {
    for (let i = 0; i < this.shelfCards.length; i++) {
      const cardVal = this.shelfCards[i];
      const curCard = this.getCard(cardVal);
      curCard.x = Math.round(i * this._shelfCardSpacing);
      curCard.y = Math.round(this.roomService.getPlayTableNum() + 100);
      curCard.ownerId = this.playerService.playerId;
      Object.assign(this.getCard(cardVal), curCard);
    }
    console.log(this.shelfCards);

  }

  _getShelfCards(): iCardData[] {
    return this.shelfCards.map(el => {
      return this.getCard(el);
    })
  }


}
