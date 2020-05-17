import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import { PlayerService } from 'src/app/services/player.service';
import { WsService } from 'src/app/services/ws.service';

@Component({
  selector: 'app-player-name-dialog',
  templateUrl: './player-name-dialog.component.html',
  styleUrls: ['./player-name-dialog.component.css']
})
export class PlayerNameDialogComponent implements OnInit {

  constructor(
    private modalService: ModalService,
    public playerService: PlayerService,
    private ws: WsService
  ) {

  }

  ngOnInit(): void {
  }


  clickEnter() {
    //this.playerService.setPlayerName(this.playerName)
    this.completeModal();
  }
  keyPress(keyEvent: KeyboardEvent) {
    if (keyEvent.key === 'Enter' && this.canClose()) {
      this.completeModal();
    }
  }

  completeModal() {
    this.modalService.getModalRef().close();
    this.ws.sendToWs('update-player', { 
      playerId: this.playerService.playerId, 
      playerName: this.playerService.playerName
    });
  }

  canClose() {
    return this.playerService.playerName.length > 0;
  }

}
