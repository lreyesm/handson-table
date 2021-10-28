import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  title: string,
  text: string,
}

@Component({
  selector: 'app-question-dialog',
  templateUrl: './question-dialog.component.html',
  styleUrls: ['./question-dialog.component.scss']
})
export class QuestionDialogComponent implements OnInit {

  title?: string = 'Titulo';
  text?: string = 'Texto';

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) { 
    this.title = data.title;
    this.text = data.text;
  }

  ngOnInit(): void {
  }

}
