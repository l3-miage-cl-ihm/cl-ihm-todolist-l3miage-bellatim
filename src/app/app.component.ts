import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TodoItem, TodoList, TodolistService } from './todolist.service';


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

  add(label: string){
    console.log(label);
    this.toDoService.create(label);
    // var labels : string[]= [this.newItem];
  }

  delete(item: TodoItem){
    this.toDoService.delete(item);
    console.log("delete");
  }

  update(data :Partial<TodoItem>,item: TodoItem){
    this.toDoService.update(data, item);
    console.log("update: item.label = "+item.label);
    console.log("update: item.isDone = "+item.isDone);
  }
}
