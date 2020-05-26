import { Component, EventEmitter, OnInit, Input, Output, HostListener } from '@angular/core';
import { WsService } from 'src/app/services/ws.service';
import { CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { endpoint, iWsMsg, iCardData } from './../../types'
import { CardsService } from 'src/app/services/cards.service';
import { PlayerService } from 'src/app/services/player.service';
import { RoomService } from 'src/app/services/room.service';


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
  dragStartTime = Infinity;

  constructor(
    private ws: WsService,
    private cardService: CardsService,
    private playerService: PlayerService,
    private roomService: RoomService
  ) {

  }

  @HostListener('window:mousemove', ['$event'])
  onMove(event: MouseEvent) {
    this.renderDrag(event);
  }

  renderDrag(event, updateXY = true) {
    if (this.boxBeingDragged) {
      const cardData = this.getCard();
      const newX = event.clientX - 25;
      const headerY = this.roomService.getHeaderNum();
      const mainTableY = this.roomService.getPlayTableNum();
      const newY = Math.round(event.clientY - headerY - 75 / 2);

      this.roomService.shelfDrag = mainTableY < newY + 75 / 2;

      if (updateXY) {
        cardData.x = newX;
        cardData.y = newY;
      }

    }
  }

  mouseUp(event: MouseEvent) {
    const curTime = (new Date()).getTime();
    if (this.boxBeingDragged && curTime > this.dragStartTime + this.cardService.cardClickTime) {
      // drag end
      const z = this.cardService.getMaxZ() + 1;
      const cardData = this.getCard();
      const newPosition = { x: cardData.x, y: cardData.y };
      newPosition['z'] = z;
      if (this.roomService.shelfDrag) {
        newPosition['ownerId'] = this.playerService.playerId;
      }
      else {
        newPosition['ownerId'] = '';
      }
      this.updateCard(newPosition);

      this.roomService.shelfDrag = false;
    } else {
      // click and release 
      this.flipCard();
    }


    this.boxBeingDragged = false;
    this.dragStartTime = Infinity;
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
  dragMoveStarted(event: MouseEvent) {
    this.boxBeingDragged = true;
    this.dragStartTime = (new Date()).getTime();
    const z = this.cardService.getMaxZ() + 1;
    this.renderDrag(event, false);
    this.updateCard({ z: z });
  }


  flipCard() {
    const faceUp = this.getCard().faceUp;
    const z = this.cardService.getMaxZ() + 1;
    this.renderDrag(event, false);
    this.updateCard({
      faceUp: !faceUp,
      z: z
    });

  }

  // Update card in both cardService 
  // and in backend via ws.
  updateCard(objIn: iCardData) {
    objIn['cardValue'] = this.cardValue;
    this.cardService.updateCard(objIn);

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


  getTransform() {
    const position = this.getPosition();
    return `translate3d(${position.x}px, ${position.y}px, 0px)` //`translateX(${position.x}px) translateY(${position.y}px)`,

  }

  // height/width should be 3.5/2.5,
  // or 1.4
  // default is 105px/75px
  getHeight(){
    if(this.isVisible()){
      return `${105 * this.cardService.cardSizeFactor}px`;
    } else {
      return `0px`;
    }

  }
  getWidth(){
    if(this.isVisible()){
    return `${75 * this.cardService.cardSizeFactor}px`;
    } else{
      return `0px`;
    }
  }


}
