import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TodoList, TodolistService } from './todolist.service';
console.log("test");
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers:[TodolistService]
})
export class AppComponent{
  title = 'l3m-tpX-todolist-angular-y2022';  

  obsToDo: Observable<TodoList>;
  newItem: string ='';

  constructor(private toDoService: TodolistService){
    this.obsToDo=this.toDoService.observable;
  }

  add(){
    console.log("add");
  }

  create(){
  // this.TS.create(...arguments);
  console.log("create");
  }

  delete(){
    console.log("delete");
  }
}
