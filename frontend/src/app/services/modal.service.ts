import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  _modalRef: MatDialogRef<any>;
  constructor() { }

  // Should work for storing data from one modal at a time.
  setModalRef(newModal: MatDialogRef<any>) {
    this._modalRef = newModal;
  }

  getModalRef() {
    return this._modalRef;
  }
}
