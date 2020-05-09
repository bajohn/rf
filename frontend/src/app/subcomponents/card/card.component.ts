import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { WsService } from 'src/app/services/ws.service';
import { CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { endpoint, iWsMsg, iCardData } from './../../types'


@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {


  @Input() data: iCardData;
  @Output() dataChange = new EventEmitter<iCardData>();

  boxBeingDragged = false;

  constructor(
    private ws: WsService
  ) {

  }

  getPosition() {
    return {
      x: this.data.x,
      y: this.data.y
    }
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
  }

  // ...this was iffy
  streamUpdate(dragStart: CdkDragStart) {

    if (this.boxBeingDragged) {
      const xyPos: { x: number, y: number } = dragStart.source.getFreeDragPosition()

      this.sendCardUpdate(xyPos);
      setTimeout(() => {
        this.streamUpdate(dragStart);
      }, 100)
    }
  }

  dragMoveEnded(dragEnd: CdkDragEnd<any>) {
    const xyPos: { x: number, y: number } = dragEnd.source.getFreeDragPosition();
    this.data.x = xyPos.x;
    this.data.y = xyPos.y;
    this.sendCardUpdate(xyPos);
    this.boxBeingDragged = false;
  }

  flipCard() {
    this.data.faceUp = !this.data.faceUp;
    this.sendCardUpdate({
      faceUp: this.data.faceUp
    })
  }

  sendCardUpdate(objIn: iCardData) {
    objIn['cardValue'] = this.data.cardValue;

    this.ws.sendToWs('card-move-end', objIn);
  }



  parseMsgFromWs(data: iWsMsg) {
    if (typeof data.message === 'string') {
      //TODO: handle this
      console.error(data);
    } else {
      if ('cardValue' in data.message) {

        const cardValue = data.message['cardValue'];

        if (data.action === 'card-move-end' && (cardValue === this.data.cardValue || data.message['cardValue'] === 'all')) {
          if ('x' in data.message) {
            this.data.x = Number(data.message['x']);
          }
          if ('y' in data.message) {
            this.data.y = Number(data.message['y']);
          }
          if ('z' in data.message) {
            this.data.z = Number(data.message['z']);
          }
          if ('groupId' in data.message) {
            this.data.groupId = Number(data.message['groupId']);
          }
          if ('faceUp' in data.message) {
            this.data.faceUp = Boolean(data.message['faceUp']);
          }
          if ('ownerId' in data.message) {
            this.data.ownerId = String(data.message['ownerId']);
          }
        }
      }
    }


  }

  getFrontImgSrc() {
    return `assets/cards/${this.data.cardValue}.svg`;
  }

}
