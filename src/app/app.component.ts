import { Component, OnInit } from '@angular/core';
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
  isDisabled: string = "disabled";
  save!: TodoList;

  constructor(private toDoService: TodolistService){
    this.obsToDo=this.toDoService.observable;
  }

  add(label: string){
    this.toDoService.create(label);
    //on s'abonne a l'observable pour pouvoir le mettre dans le localStorage
    this.obsToDo.subscribe(data=>localStorage.setItem('data',JSON.stringify(data)));
 
  }

  delete(item: TodoItem){
    this.toDoService.delete(item);
    this.obsToDo.subscribe(data=>localStorage.setItem('data',JSON.stringify(data)));
  }

  update(data :Partial<TodoItem>,item: TodoItem){
    this.toDoService.update(data, item);
    this.obsToDo.subscribe(data=>localStorage.setItem('data',JSON.stringify(data)));
  }

  //pour ne pas perdre le focus quand on met a jour un item
  trackByFn(index: number, item: TodoItem){
    return index;
  }
  // enable(){
  //   if (this.isDisabled=="disabled"){
  //     this.isDisabled="";
  //   }
  //   else{
  //     this.isDisabled="disabled";
  //   }
  // }  
}
