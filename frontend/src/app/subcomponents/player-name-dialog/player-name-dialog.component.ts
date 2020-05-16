import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-player-name-dialog',
  templateUrl: './player-name-dialog.component.html',
  styleUrls: ['./player-name-dialog.component.css']
})
export class PlayerNameDialogComponent implements OnInit {

  constructor(
    private modalService: ModalService,
    public playerService: PlayerService
  ) {

  }

  ngOnInit(): void {
  }


  clickEnter() {
    //this.playerService.setPlayerName(this.playerName)
    this.modalService.getModalRef().close();
  }
  keyPress(keyEvent: KeyboardEvent) {
    if (keyEvent.key === 'Enter' && this.canClose()) {
      this.modalService.getModalRef().close();
    }
  }

  canClose() {
    return this.playerService.playerName.length > 0;
  }

}
