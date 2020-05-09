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


  @Input() cardValue: '';
  // initial positions
  x = 10;
  y = 10
  z = 1;
  groupId = 0;
  ownerId = '';
  faceUp = true;

  boxBeingDragged = false;

  constructor(
    private ws: WsService
  ) {

  }

  getInitPosition() {
    return {
      x: this.x,
      y: this.y
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
    this.x = xyPos.x;
    this.y = xyPos.y;
    this.sendCardUpdate(xyPos);
    this.boxBeingDragged = false;
  }

  flipCard() {
    this.faceUp = !this.faceUp;
    this.sendCardUpdate({
      faceUp: this.faceUp
    })
  }

  sendCardUpdate(objIn: iCardData) {
    objIn['cardValue'] = this.cardValue;

    this.ws.sendToWs('card-move-end', objIn);
  }



  parseMsgFromWs(data: iWsMsg) {
    console.log('parse');
    if (typeof data.message === 'string') {
      //TODO: handle this
      console.error(data);
    } else {
      if ('cardValue' in data.message) {
        if (data.action === 'card-move-end' && (data.message['cardValue'] === this.cardValue || data.message['cardValue'] === 'all')) {
          if ('x' in data.message) {
            this.x = Number(data.message['x']);
          }
          if ('y' in data.message) {
            this.y = Number(data.message['y']);
          }
          if ('z' in data.message) {
            this.x = Number(data.message['z']);
          }
          if ('groupId' in data.message) {
            this.groupId = Number(data.message['groupId']);
          }
          if ('faceUp' in data.message) {
            this.faceUp = Boolean(data.message['faceUp']);
          }
          if ('ownerId' in data.message) {
            this.ownerId = String(data.message['ownerId']);
          }
        }
      }
    }


  }

  getFrontImgSrc() {
    return `assets/cards/${this.cardValue}.svg`;
  }

}
