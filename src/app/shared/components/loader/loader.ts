import { Component } from '@angular/core';
import { NgxSpinnerComponent } from 'ngx-spinner';

@Component({
  selector: 'app-loader',
  imports: [NgxSpinnerComponent],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
})
export class Loader {}
