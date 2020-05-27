import { Injectable } from '@angular/core';
import { WsService } from './ws.service';

import { iCardData, iWsMsg, iGroupData } from '../types';
import { RoomService } from './room.service';
import { PlayerService } from './player.service';
import { ParamsService } from './params.service';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  _cards: iCardData[] = [];
  _cardIdxLookup: { [key: string]: number };
  _groupIdxLookup: { [key: string]: number };
  _maxZ = 51;


  shelfCards: string[] = [];

  _groups: iGroupData[] = [];

  constructor(
    private ws: WsService,
    private roomService: RoomService,
    private playerService: PlayerService,
    private paramsService: ParamsService
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
      card.x = faceUp ? this.paramsService.spreadCardSpacing * zMap[card.cardValue] : shuffledLocation;
      card.y = shuffledLocation;
      card.z = zMap[card.cardValue];
      card.faceUp = faceUp;
      card.ownerId = '';
      counter++;
    }
    this.shelfCards = [];
    this.ws.sendToWs('card-move-end-bulk', { cards: this._cards });
  }

  getCards() {
    return this._cards;
  }

  getGroups() {
    return this._groups;
  }

  getCard(cardValue: string): iCardData {
    const idx = this._cardIdxLookup[cardValue];
    return this._cards[idx];
  }

  getGroup(groupId: string): iGroupData {
    const idx = this._groupIdxLookup[groupId];
    return this._groups[idx];
  }

  getMaxZ() {
    return this._maxZ;
  }

  updateCard(updateObj: iCardData) {

    if ('z' in updateObj) {
      const newZ = updateObj['z']
      if (newZ > this._maxZ) {
        this._maxZ = newZ;
      }
    }

    const cardsToWs = this._updateLocalCards(updateObj);
    this.ws.sendToWs('card-move-end-bulk', { cards: cardsToWs });

  }

  updateGroup(updateObj: iGroupData) {
    this.ws.sendToWs('group-move-end', { group: updateObj });
  }

  _updateLocalCards(updateObj: iCardData) {
    let updatedCards = [];
    const cardValue = updateObj.cardValue;
    const curCard = this.getCard(cardValue);
    console.log(updateObj, curCard);
    let placedInShelf = false;
    if ('ownerId' in updateObj) {
      if (this._isMyCard(updateObj)) {
        this.placeInShelf(cardValue);
        updatedCards = updatedCards.concat(this._getShelfCards());
        placedInShelf = true;
      }
      else if (updateObj.ownerId === '') {
        if (this._isMyCard(curCard)) {
          // Was formerly my card, but no longer
          this.removeFromShelf(cardValue)
          updatedCards = updatedCards.concat(this._getShelfCards());
        }
      }
    }
    if (!placedInShelf) {
      // Update to given position, unless placed in shelf
      Object.assign(this.getCard(cardValue), updateObj);
      updatedCards.push(this.getCard(cardValue));
    }

    return updatedCards;
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

  _getInitCardIdxs() {
    const ret: { [key: string]: number } = {};
    for (let i = 0; i < this._cards.length; i++) {
      const curCard = this._cards[i];
      ret[curCard.cardValue] = i;
    }
    return ret;
  }

  _getInitGroupIdxs() {
    const ret: { [key: string]: number } = {};
    for (let i = 0; i < this._groups.length; i++) {
      const curGroup = this._groups[i];
      ret[curGroup.groupId] = i;
    }
    return ret;
  }



  _parseMsgFromWs(data: iWsMsg) {
    if (typeof data.message === 'string') {
      //TODO: handle this
      console.error(data);
    }
    else if (data.action === 'initialize-cards') {
      this._groups = data.message['groups']
      this._cards = data.message['cards'];
      this._cardIdxLookup = this._getInitCardIdxs();
      this._groupIdxLookup = this._getInitGroupIdxs();

      this._maxZ = this._getInitZ();
      for (const card of this._cards) {
        if (this._isMyCard(card)) {
          this.placeInShelf(card.cardValue)
        }
      }
    }
    else if (data.action === 'card-move-end-bulk') {
      const newCards = data.message['cards'] as iCardData[];
      for (const newCard of newCards) {
        const cardValue = newCard.cardValue;
        const card = this.getCard(cardValue);
        Object.assign(card, newCard);
      }

    } else if (data.action === 'group-move-end') {
      const groupObj: iGroupData = data.message['group']
      const groupId = groupObj.groupId;
      const group = this.getGroup(groupId);
      Object.assign(group, groupObj);
    }
  }

  placeInShelf(cardValue: string) {
    console.log('place in shelf')
    const cardData = this.getCard(cardValue);
    const shiftedX = cardData.x - this.paramsService.shelfCardShift
    let cardPlace = 0;
    if (shiftedX > 0) {
      cardPlace = Math.ceil(shiftedX / this.paramsService.shelfCardSpacing);
    }


    // temporarily remove card if already in array
    const curIdx = this.shelfCards.indexOf(cardValue);
    if (curIdx > -1) {
      this.shelfCards.splice(curIdx, 1);
    }

    // insert into correct position
    if (this.shelfCards.length < cardPlace) {
      this.shelfCards.push(cardData.cardValue);
    } else {
      this.shelfCards.splice(cardPlace, 0, cardData.cardValue);
    }

    this._orderShelfCards();
  }

  removeFromShelf(cardValue: string) {
    console.log('remove from shelf')
    const cardData = this.getCard(cardValue)
    const idx = this.shelfCards.indexOf(cardData.cardValue);
    if (idx >= 0) {
      this.shelfCards.splice(idx, 1);
    }

    this._orderShelfCards();
  }

  _orderShelfCards() {
    for (let i = 0; i < this.shelfCards.length; i++) {
      const cardVal = this.shelfCards[i];
      const curCard = this.getCard(cardVal);
      curCard.x = Math.round(this.paramsService.shelfCardShift + i * this.paramsService.shelfCardSpacing);
      curCard.y = Math.round(this.roomService.getPlayTableNum() + 100);
      curCard.z = i + 1;
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

  _isMyCard(cardData: iCardData) {
    return this.playerService.playerId === cardData.ownerId
  }


}
