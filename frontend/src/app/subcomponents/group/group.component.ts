import { Component, OnInit, Input, HostListener } from '@angular/core';
import { CardsService } from 'src/app/services/cards.service';
import { iGroupData } from 'src/app/types';
import { RoomService } from 'src/app/services/room.service';
import { ParamsService } from 'src/app/services/params.service';


@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {


  @Input() groupId: string;
  //groupBeingDragged = false; // for styling
  dragStartTime = Infinity;

  constructor(
    private cardService: CardsService,
    private roomService: RoomService,
    private paramsService: ParamsService
  ) { }

  ngOnInit(): void {
  }

  @HostListener('window:mousemove', ['$event'])
  onMove(event: MouseEvent) {
    this.renderDrag(event);
  }

  dragMoveStarted(event: MouseEvent) {
    // TODO: should probably move this to max z while dragging
    this._setIsActive(true);
    this.dragStartTime = (new Date()).getTime();

    this.renderDrag(event);
  }
  mouseUp(event: MouseEvent) {
    const curTime = (new Date()).getTime();
    if (this.isActive() && curTime > this.dragStartTime + this.paramsService.cardClickTime) {
      // drag end
      const groupData = this.getGroup();
      const newPosition = { x: groupData.x, y: groupData.y };

      this.updateGroup(newPosition);

    }
    this._setIsActive(false);
    this.dragStartTime = Infinity;
  }

  renderDrag(event) {
    if (this.isActive()) {
      const groupData = this.getGroup();
      const newX = event.clientX - 25;

      const headerY = this.roomService.getHeaderNum();
      const newY = Math.round(event.clientY - headerY - 75 / 2);

      groupData.x = newX;
      groupData.y = newY;

      this.cardService.moveGroup(groupData);
    }
  }

  getGroup(): iGroupData {
    return this.cardService.getGroup(this.groupId);
  }

  updateGroup(objIn: iGroupData) {
    objIn['groupId'] = this.groupId;
    this.cardService.updateGroup(objIn);
  }

  getWidth() {
    return `${this.paramsService.groupWidth * this.paramsService.cardSizeFactor}px`;
  }

  getHeight() {
    return `${this.paramsService.groupHeight * this.paramsService.cardSizeFactor}px`;
  }

  getPosition() {
    const groupData = this.getGroup();
    return {
      x: groupData.x,
      y: groupData.y
    }
  }

  getTransform() {
    const position = this.getPosition();
    return `translate3d(${position.x}px, ${position.y}px, 0px)` //`translateX(${position.x}px) translateY(${position.y}px)`,
  }

  getZ() {
    if (this.isActive()) {
      return 100000;
    } else {
      return 1;
    }
  }

  isActive() {
    return this.cardService.getLclGroup(this.groupId).highlight;
  }

  _setIsActive(highlight: boolean) {
    this.cardService.getLclGroup(this.groupId).highlight = highlight;
  }



}
