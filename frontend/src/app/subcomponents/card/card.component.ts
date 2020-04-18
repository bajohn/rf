import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { WsService } from 'src/app/services/ws.service';
import { CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { endpoint, iWsMsg, position } from './../../types'


@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {


  @Input() cardValue: '';

  @Input() cardPosition: position;

  @Output() cardPositionChange = new EventEmitter<{ x: number, y: number }>();

  groups = ['all']

  boxBeingDragged = false;
  faceUp = true;
  constructor(
    private ws: WsService
  ) {

  }

  ngOnInit(): void {
    this.ws.getSubscription(this.parseMsgFromWs.bind(this));
    // this.sendMove(this.boxPosition, 'card-move-end');
  }

  isActive() {
    return this.boxBeingDragged;
  }

  // boxBeingDragged is used for styling
  dragMoveStarted(dragStart: CdkDragStart) {
    this.boxBeingDragged = true;
  }

  dragMoveEnded(dragEnd: CdkDragEnd<any>) {
    console.log('end')
    const xyPos: position = dragEnd.source.getFreeDragPosition()

    this.sendMove(xyPos, 'card-move-end');
    this.boxBeingDragged = false;
  }


  sendMove(xyPos: position, action: 'card-move-start' | 'card-move-end') {
    const posMsg = {
      x: xyPos.x,
      y: xyPos.y,
      cardValue: this.cardValue
    };
    this.cardPositionChange.emit(xyPos);
    this.ws.sendToWs(action, posMsg);
  }


  parseMsgFromWs(data: iWsMsg) {
    console.log('parse');
    if (data.action === 'card-move-end' && (data.message['cardValue'] === this.cardValue || data.message['cardValue'] === 'all')) {
      this.cardPositionChange.emit({ x: Number(data.message['x']), y: Number(data.message['y']) });
      this.cardPosition = { x: Number(data.message['x']), y: Number(data.message['y']) }
    }
  }

  flipCard() {
    this.faceUp = !this.faceUp;
  }

}
