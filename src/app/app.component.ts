import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HistoryService , History} from './history.service';
import { TodoItem, TodoList, TodolistService } from './todolist.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers:[TodolistService, HistoryService]
})

export class AppComponent implements OnInit {
  title = 'l3m-tpX-todolist-angular-y2022';  

  obsToDo: Observable<TodoList>;
  obsHistory: Observable<History<TodoList>>;
  isDisabled: string = "disabled";
  save!: TodoList;

  constructor(private toDoService: TodolistService, private HS: HistoryService<TodoList>){
    this.obsToDo=this.toDoService.observable;
    this.obsHistory=this.HS.observable;
  }

  //on charge les données a l'abonnement
  ngOnInit(){ 
    this.toDoService.loadData();
  }

  add(label: string){
    this.toDoService.create(label);
    //on s'abonne a l'observable pour pouvoir le mettre dans le localStorage, push dans l'historique et unsubscribe pour eviter les doublons
    this.obsToDo.subscribe(data=>{
      localStorage.setItem('data',JSON.stringify(data));
      this.HS.push(data);
      console.log("observation");
    }).unsubscribe();
      
      
    //   [localStorage.setItem('data',JSON.stringify(data))]);
    // this.obsToDo.subscribe(data=>this.HS.push(data)).unsubscribe;
    // this.obsToDo.subscribe(() => console.log("observation")).unsubscribe;
    console.log("add");
    
  }

  delete(item: TodoItem){
    this.toDoService.delete(item);
    this.obsToDo.subscribe(data=>{
      localStorage.setItem('data',JSON.stringify(data));
      this.HS.push(data);
      console.log("observation-delete");
    }).unsubscribe();

  }

  update(data :Partial<TodoItem>,item: TodoItem){
    this.toDoService.update(data, item);
    this.obsToDo.subscribe(data=>localStorage.setItem('data',JSON.stringify(data)));
    this.obsToDo.subscribe(data=>this.HS.push(data));
  }

  annuler(){
    console.log("annuler comp");
    this.HS.undo();
    this.obsHistory.subscribe(data=>this.toDoService.load(data.current));
  }

  refaire(){

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
