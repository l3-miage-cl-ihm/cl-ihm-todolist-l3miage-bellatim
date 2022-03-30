import { Component } from '@angular/core';
import { TodolistService } from './todolist.service';
console.log("test");
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers:[TodolistService]
})
export class AppComponent {
  title = 'l3m-tpX-todolist-angular-y2022';  

  constructor(private TS: TodolistService){
    
  }

    create(){
    // this.TS.create(...arguments);
    console.log("create");
    
  }
}
