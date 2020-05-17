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
      console.log(data.message);
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
}
