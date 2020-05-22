import { Component, OnInit } from '@angular/core';
import { WsService } from '../../services/ws.service';
import { iCardData, iWsMsg } from '../../types';
import { Router } from '@angular/router';
import { CardsService } from 'src/app/services/cards.service';
import { MatDialog } from '@angular/material/dialog';
import { PlayerService } from 'src/app/services/player.service';
import { PlayerNameDialogComponent } from 'src/app/subcomponents/player-name-dialog/player-name-dialog.component';
import { v4 as uuidv4 } from 'uuid';
import { ModalService } from 'src/app/services/modal.service';
import { CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {

  readonly _shelfHeight = 40;

  constructor(
    private ws: WsService,
    public cardService: CardsService,
    public dialog: MatDialog,
    public playerService: PlayerService,
    private router: Router,
    private modalService: ModalService,
  ) {
    this.ws.getSubscription(this.parseMsgFromWs.bind(this));

    const gameId = this.router.url.substring(1);
    this.ws.setGameId(gameId);
    this.ws.sendToWs('initialize', {});

    const storedPlayerId = window.localStorage.getItem(gameId);
    console.log(storedPlayerId)
    if (typeof storedPlayerId === 'string') {
      this.playerService.playerId = storedPlayerId;
      this.ws.sendToWs('get-player', { playerId: this.playerService.playerId });
    }
    else {
      // Player not yet set up for this user in this room.
      const playerId = uuidv4();
      this.playerService.playerId = playerId;
      window.localStorage.setItem(gameId, playerId);
      this.promptNameModal();

    }

  }

  ngOnInit() {

  }



  clickShuffleRecall() {
    this.cardService.doShuffle(false);
  }

  clickShuffleSpread() {
    this.cardService.doShuffle(true);
  }

  clickPlayerName() {
    this.promptNameModal();

  }

  getCards() {
    return this.cardService.getCards();
  }

  parseMsgFromWs(data: iWsMsg) {
    if (typeof data.message === 'string') {
      //TODO: handle this
      console.error(data);
    }
    else if (data.action === 'get-player') {
      const playerName = data.message['playerName'];
      if (playerName.length === 0) {
        this.promptNameModal();
      } else {
        this.playerService.playerName = playerName;
      }
    }
    else if (data.action === 'initialize-connection-id') {

    }
  }

  getShelfHeight() {
    return `${this._shelfHeight}%`;
  }

  getTableHeight() {
    return `${100 - this._shelfHeight}%`;
  }
  promptNameModal() {

    const dialogRef = this.dialog.open(PlayerNameDialogComponent, {
      width: '250px',
      //data: {name: this.name, animal: this.animal}
    });
    this.modalService.setModalRef(dialogRef);
  }



  isActive(cardRef: iCardData) {
    const ret = this.cardService.getActiveCard() === cardRef;
    return ret;
  }


  getPosition(cardRef: iCardData) {
    return {
      x: cardRef.x,
      y: cardRef.y
    }
  }

  getZ(cardRef: iCardData) {
    return cardRef.z;
  }

  getFaceUp(cardRef: iCardData) {
    return cardRef.faceUp;
  }



  // boxBeingDragged is used for styling
  dragMoveStarted(cardRef: iCardData, dragStart: CdkDragStart) {
    this.cardService.setActiveCard(cardRef.cardValue);
    const z = this.cardService.getMaxZ() + 1;
    this.updateCard(cardRef, { z: z });

  }

  dragMoveEnded(cardRef: iCardData, dragEnd: CdkDragEnd<any>) {
    const newPosition: { x: number, y: number } = dragEnd.source.getFreeDragPosition();
    console.log(newPosition);
    const z = this.cardService.getMaxZ() + 1;
    newPosition['z'] = z;
    this.updateCard(cardRef, newPosition);
    this.cardService.setActiveCard(null);
  }

  flipCard(cardRef: iCardData) {
    const faceUp = cardRef.faceUp;
    const z = this.cardService.getMaxZ() + 1;
    this.updateCard(cardRef, {
      faceUp: !faceUp,
      z: z
    });
  }

  // Update card in both cardService 
  // and in backend via ws.
  updateCard(cardRef: iCardData, objIn: iCardData) {
    const toSend = {};
    console.log(objIn);
    Object.assign(toSend, cardRef); //copy
    objIn['cardValue'] = cardRef.cardValue;
    // if ('y' in objIn) {
    //   const newY = objIn['y'];
    //   if (newY > 400) {
    //     objIn['x'] = 0;
    //     objIn['ownerId'] = this.playerService.playerId;
    //   } else {
    //     objIn['ownerId'] = '';
    //   }

    // }
    Object.assign(toSend, objIn)
    this.cardService.updateCard(toSend);
    this.ws.sendToWs('card-move-end-bulk', { cards: [toSend] });
  }

  getFrontImgSrc(cardRef: iCardData) {
    return `assets/cards/${cardRef.cardValue}.svg`;
  }

  // getCard(): iCardData {
  //   return this.cardService.getCard(this.cardValue);
  // }

  isVisible(cardRef: iCardData) {
    return cardRef.ownerId === '' || cardRef.ownerId === this.playerService.playerId;
  }


}
