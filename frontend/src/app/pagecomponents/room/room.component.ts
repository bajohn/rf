import { Component, OnInit } from '@angular/core';
import { WsService } from '../../services/ws.service';
import { iCardData, iWsMsg } from '../../types';
import { Router } from '@angular/router';
import { CardsService } from 'src/app/services/cards.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalService } from 'src/app/services/modal.service';
import { PlayerNameDialogComponent } from 'src/app/subcomponents/player-name-dialog/player-name-dialog.component';
import { PlayerService } from 'src/app/services/player.service';


@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {





  cardTypes: string[] = [];
  readonly _shelfHeight = 40;

  constructor(
    private ws: WsService,
    private router: Router,
    public cardService: CardsService,
    private modalService: ModalService,
    public dialog: MatDialog,
    public playerService: PlayerService
  ) {
    this.ws.getSubscription(this.parseMsgFromWs.bind(this));
    const gameId = this.router.url.substring(1);
    this.ws.setGameId(gameId);

    const storedPlayerName = window.localStorage.getItem(gameId);
    console.log(storedPlayerName)
    if (typeof storedPlayerName === 'string') {
      this.playerService.playerName = storedPlayerName;

    }
    else {
      this.promptNameModal();
    }
    this.ws.sendToWs('initialize', {});
  }

  ngOnInit() {

  }

  promptNameModal() {

    const dialogRef = this.dialog.open(PlayerNameDialogComponent, {
      width: '250px',
      //data: {name: this.name, animal: this.animal}
    });
    this.modalService.setModalRef(dialogRef);

    dialogRef.afterClosed().subscribe(result => {
      console.log('entering player name');
      const newName = this.playerService.playerName;
      window.localStorage.setItem(this.ws.getGameId(), newName);
    });


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
    else if (data.action === 'initialize') {
      if (data.message['gameExists']) {
        console.log('found!');
      } else {
        console.log('No game found. Ask to create');
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
}
