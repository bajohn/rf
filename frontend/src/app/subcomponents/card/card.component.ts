import { Component, OnInit, Input, HostListener } from '@angular/core';
import { iCardData, iLclCardData } from './../../types'
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
    this.dragStartTime = this.playerService.getServerTime().getTime();
    this.cardDragStart();
    const z = this.cardService.getMaxZ() + 1;
    this.renderDrag(event, false);
    this.updateCard({
      z: z
    });
  }

  mouseUp(event: MouseEvent) {
    if (this.getCardBeingDragged()) {
      const curTime = this.playerService.getServerTime().getTime();

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

    this.cardDragRelease();
    this.dragStartTime = Infinity;
  }

  renderDrag(event, updateXY = true) {
    if (this.getCardBeingDragged()) {
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

  getCardBeingDragged() {
    const cardData = this.getLocalCard();
    return cardData.cardBeingDragged;
  }

  cardDragStart() {
    this.getLocalCard().cardBeingDragged = true;
  }

  cardDragRelease() {
    this.getLocalCard().cardBeingDragged = false;
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
    objIn['date'] = this.playerService.getServerTime().toISOString();
    this.cardService.updateCard(objIn);
  }

  getFrontImgSrc() {
    return `assets/cards/${this.cardValue}.svg`;
  }

  getCard(): iCardData {
    return this.cardService.getCard(this.cardValue);
  }

  getLocalCard(): iLclCardData {
    return this.cardService.getLclCard(this.cardValue);
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
