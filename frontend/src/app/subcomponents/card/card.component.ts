import { Component, EventEmitter, OnInit, Input, Output, HostListener } from '@angular/core';
import { WsService } from 'src/app/services/ws.service';
import { CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { endpoint, iWsMsg, iCardData, iGroupData } from './../../types'
import { CardsService } from 'src/app/services/cards.service';
import { PlayerService } from 'src/app/services/player.service';
import { RoomService } from 'src/app/services/room.service';
import { ParamsService } from 'src/app/services/params.service';


@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {


  // @Input() data: iCardData;
  // @Output() dataChange = new EventEmitter<iCardData>();

  @Input() cardValue: string;

  cardBeingDragged = false; // for styling
  dragStartTime = Infinity;

  constructor(
    private cardService: CardsService,
    private playerService: PlayerService,
    private roomService: RoomService,
    private paramsService: ParamsService
  ) {

  }
  ngOnInit(): void {
  }

  @HostListener('window:mousemove', ['$event'])
  onMove(event: MouseEvent) {
    event.preventDefault();
    this.renderDrag(event);
  }

  dragMoveStarted(event: MouseEvent) {
    this.cardBeingDragged = true;
    this.dragStartTime = (new Date()).getTime();
    const z = this.cardService.getMaxZ() + 1;
    this.renderDrag(event, false);
    this.updateCard({ z: z });
  }

  mouseUp(event: MouseEvent) {
    if (this.cardBeingDragged) {
      const curDateObj = new Date();
      const curTime = (curDateObj).getTime();
      if (curTime > this.dragStartTime + this.paramsService.cardClickTime) {
        // drag end
        const z = this.cardService.getMaxZ() + 1;
        const cardData = this.getCard();
        const newPosition = {
          x: cardData.x,
          y: cardData.y,
          z: z
        };
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
    }

    this.cardBeingDragged = false;
    this.dragStartTime = Infinity;
  }

  renderDrag(event, updateXY = true) {
    if (this.cardBeingDragged) {
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
      this.checkGroupDrag(cardData)
    }
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
    objIn['date'] = (new Date()).toISOString();
    this.cardService.updateCard(objIn);
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

  checkGroupDrag(card: iCardData) {
    this.cardService.checkGroupDrag(card);
  }

  // height/width should be 3.5/2.5,
  // or 1.4
  // default is 105px/75px
  getHeight() {
    if (this.isVisible()) {
      return `${105 * this.paramsService.cardSizeFactor}px`;
    } else {
      return `0px`;
    }

  }
  getWidth() {
    if (this.isVisible()) {
      return `${75 * this.paramsService.cardSizeFactor}px`;
    } else {
      return `0px`;
    }
  }


}
