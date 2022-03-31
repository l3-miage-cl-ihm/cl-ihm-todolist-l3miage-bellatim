import { Component, OnInit, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { HistoryService, History } from '../history.service';
import { TodoItem, TodoList, TodolistService } from '../todolist.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:[TodolistService, HistoryService]
})
export class TodoListComponent implements OnInit {

  obsToDo: Observable<TodoList>;
  obsHistory: Observable<History<TodoList>>;
  isDisabled: string = "disabled";
  save!: TodoList;
  isEditable: boolean=false;
  remaining=0;

  constructor(private toDoService: TodolistService, private HS: HistoryService<TodoList>) { 
    this.obsToDo=this.toDoService.observable;
    this.obsHistory=this.HS.observable;
  }

    //on charge les données a l'abonnement

  ngOnInit(): void {
    this.toDoService.loadData();
    this.count();

  }

 

  editable(){
    this.isEditable=!this.isEditable;
  }

  add(label: string){
    this.toDoService.create(label);
    //on s'abonne a l'observable pour pouvoir le mettre dans le localStorage, push dans l'historique et unsubscribe pour eviter les doublons
    this.obsToDo.subscribe(data=>{
      localStorage.setItem('data',JSON.stringify(data));
      this.HS.push(data);
      console.log("observation");
    }).unsubscribe();
      
    console.log("add");
    this.count();
  }
  delete(item: TodoItem){
    this.toDoService.delete(item);
    this.obsToDo.subscribe(data=>{
      localStorage.setItem('data',JSON.stringify(data));
      this.HS.push(data);
      console.log("observation-delete");
    }).unsubscribe();
    this.count();
  }

  update(data :Partial<TodoItem>,item: TodoItem){
    this.toDoService.update(data, item);

    this.obsToDo.subscribe(data => {
      localStorage.setItem('data',JSON.stringify(data));
      this.HS.push(data);
      console.log("observation-update");
    }).unsubscribe();
    this.count();
    
  }
  
  annuler(){
    console.log("annuler comp");
    var canUndo=false;
    var currentIndex=0;
    this.obsHistory.subscribe(data=>currentIndex=data.currentIndex).unsubscribe();
    if(currentIndex>1){
      this.HS.undo();
      this.obsHistory.subscribe(data=>{
        this.toDoService.load(data.current);
        localStorage.setItem('data',JSON.stringify(data.current));
        console.log("current load: "+data.current.label);
      }).unsubscribe();
    }
    else{
      console.log("cannot undo (comp undo)");

    }
    
    this.count();

  }

  refaire(){
    console.log("refaire comp");
    var currentIndex=0;
    var length=0;
    this.obsHistory.subscribe(data=>{
      currentIndex=data.currentIndex;
      length=data.history.length;
    }).unsubscribe();

    if(currentIndex<length){
      this.HS.redo();
      this.obsHistory.subscribe(data=>{
        this.toDoService.load(data.current);
        localStorage.setItem('data',JSON.stringify(data.current));
        console.log("current load: "+data.current.label);
      }).unsubscribe();
    }
    this.count();

  }

  //recupere la liste des items, compte le nombre de restante avec un reduce puis se desabonne
  count(){
    this.obsToDo.subscribe(data=>this.remaining=data.items.reduce((acc, item)=>(!item.isDone)?acc+1:acc,0)).unsubscribe;
  }
  //en cours d'edition ou pas
  changeEdit(isEditing: boolean, item: TodoItem){
    this.toDoService.update({isEditing:!isEditing}, item);
  }


  @HostListener('document:keydown.control.z') undo(event: KeyboardEvent) { 
    this.annuler();  
  } 

  @HostListener('document:keydown.control.y') redo(event: KeyboardEvent) { 
    this.refaire();  
  } 


   //pour ne pas perdre le focus quand on met a jour un item
   trackByFn(index: number, item: TodoItem){
    return index;
   }

}
