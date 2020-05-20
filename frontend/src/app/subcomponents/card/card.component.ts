import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { WsService } from 'src/app/services/ws.service';
import { CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { endpoint, iWsMsg, iCardData } from './../../types'
import { CardsService } from 'src/app/services/cards.service';
import { PlayerService } from 'src/app/services/player.service';


@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {


  // @Input() data: iCardData;
  // @Output() dataChange = new EventEmitter<iCardData>();

  @Input() cardValue: string;


  boxBeingDragged = false;

  constructor(
    private ws: WsService,
    private cardService: CardsService,
    private playerService: PlayerService
  ) {

  }

  getPosition() {
    const cardData = this.getCard();
    return {
      x: cardData.x,
      y: cardData.y
    }
  }

  getZ() {
    const cardData = this.getCard();
    return cardData.z;
  }

  getFaceUp() {
    const cardData = this.getCard();
    return cardData.faceUp;
  }

  ngOnInit(): void {
    this.ws.getSubscription(this.parseMsgFromWs.bind(this));
  }

  isActive() {
    return this.boxBeingDragged;
  }

  // boxBeingDragged is used for styling
  dragMoveStarted(dragStart: CdkDragStart) {
    this.boxBeingDragged = true;
    const z = this.cardService.getMaxZ() + 1;

    this.updateCard({ z: z });
  }

  // ...this was iffy
  streamUpdate(dragStart: CdkDragStart) {

    if (this.boxBeingDragged) {
      const xyPos: { x: number, y: number } = dragStart.source.getFreeDragPosition()

      this.updateCard(xyPos);
      setTimeout(() => {
        this.streamUpdate(dragStart);
      }, 100)
    }
  }

  dragMoveEnded(dragEnd: CdkDragEnd<any>) {
    const newPosition: { x: number, y: number } = dragEnd.source.getFreeDragPosition();
    const z = this.cardService.getMaxZ() + 1;
    newPosition['z'] = z;
    this.updateCard(newPosition);
    this.boxBeingDragged = false;
  }

  flipCard() {
    const faceUp = this.getCard().faceUp;
    const z = this.cardService.getMaxZ() + 1;
    this.updateCard({
      faceUp: !faceUp,
      z: z
    });
  }

  // Update card in both cardService 
  // and in backend via ws.
  updateCard(objIn: iCardData) {
    const toSend = {};
    Object.assign(toSend, this.getCard()); //copy
    objIn['cardValue'] = this.cardValue;
    if ('y' in objIn) {
      const newY = objIn['y'];
      if (newY > 400) {
        objIn['x'] = 0;
        objIn['ownerId'] = this.playerService.playerId;
      } else {
        objIn['ownerId'] = '';
      }

    }
    console.log(objIn);
    Object.assign(toSend, objIn)
    this.cardService.updateCard(toSend);
    console.log(toSend);
    this.ws.sendToWs('card-move-end-bulk', { cards: [toSend] });
  }



  parseMsgFromWs(data: iWsMsg) {
    if (typeof data.message === 'string') {
      //TODO: handle this
      console.error(data);
    }


  }

  getFrontImgSrc() {
    return `assets/cards/${this.cardValue}.svg`;
  }

  getCard(): iCardData {
    return this.cardService.getCard(this.cardValue);
  }

  isVisible() {
    const thisCard = this.getCard();
    return thisCard.ownerId === '' || thisCard.ownerId === this.playerService.playerId;
  }



}
