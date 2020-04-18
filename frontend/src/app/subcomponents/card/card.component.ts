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

  boxPosition: position;

  @Output()
  boxPositionChange = new EventEmitter<{ x: number, y: number }>();

  @Input()
  get position() {
    return this.boxPosition;
  }
  set position(val) {
    this.boxPosition = val;
    this.boxPositionChange.emit(this.boxPosition);
  }

  boxBeingDragged = false;

  constructor(
    private ws: WsService
  ) {

  }

  ngOnInit(): void {
    this.ws.getSubscription(this.parseMsgFromWs.bind(this));
  }

  isActive() {
    return this.boxBeingDragged;
  }


  moveStarted(dragStart: CdkDragStart) {
    this.boxBeingDragged = true;
    console.log(dragStart);
    const xyPos = dragStart.source.getFreeDragPosition()
    const startMsg = {
      x: xyPos.x,
      y: xyPos.y,
      cardValue: this.cardValue
    };
    this.ws.sendToWs('card-move-start', startMsg);
  }

  moveEnded(dragEnd: CdkDragEnd<any>) {
    const xyPos = dragEnd.source.getFreeDragPosition()

    const endMsg = {
      x: xyPos.x,
      y: xyPos.y,
      cardValue: this.cardValue
    };
    console.log('Sending move msg');
    this.ws.sendToWs('card-move-end', endMsg);
    this.boxBeingDragged = false;
  }



  parseMsgFromWs(data: iWsMsg) {
    console.log('Move msg received', data);
    if (data.action === 'card-move-end' && data.message['cardValue'] ===this.cardValue) {
      this.boxPosition = { x: Number(data.message['x']), y: Number(data.message['y']) }
    }
  }

}
