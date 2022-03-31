import { Component, HostListener, OnInit } from '@angular/core';
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



  // constructor(private toDoService: TodolistService, private HS: HistoryService<TodoList>){
  constructor(){
    // this.obsToDo=this.toDoService.observable;
    // this.obsHistory=this.HS.observable;
  }

  //on charge les données a l'abonnement
  ngOnInit(){ 
    // this.toDoService.loadData();
  }

  // add(label: string){
  //   this.toDoService.create(label);
  //   //on s'abonne a l'observable pour pouvoir le mettre dans le localStorage, push dans l'historique et unsubscribe pour eviter les doublons
  //   this.obsToDo.subscribe(data=>{
  //     localStorage.setItem('data',JSON.stringify(data));
  //     this.HS.push(data);
  //     console.log("observation");
  //   }).unsubscribe();
      
  //   console.log("add");
    
  // }

  // delete(item: TodoItem){
  //   this.toDoService.delete(item);
  //   this.obsToDo.subscribe(data=>{
  //     localStorage.setItem('data',JSON.stringify(data));
  //     this.HS.push(data);
  //     console.log("observation-delete");
  //   }).unsubscribe();

  // }

  // update(data :Partial<TodoItem>,item: TodoItem){
  //   this.toDoService.update(data, item);

  //   this.obsToDo.subscribe(data => {
  //     localStorage.setItem('data',JSON.stringify(data));
  //     this.HS.push(data);
  //     console.log("observation-update");
  //   }).unsubscribe();

  // }

  // annuler(){
  //   console.log("annuler comp");
  //   var canUndo=false;
  //   var currentIndex=0;
  //   this.obsHistory.subscribe(data=>currentIndex=data.currentIndex).unsubscribe();
  //   if(currentIndex>1){
  //     this.HS.undo();
  //     this.obsHistory.subscribe(data=>{
  //       this.toDoService.load(data.current);
  //       localStorage.setItem('data',JSON.stringify(data.current));
  //       console.log("current load: "+data.current.label);
  //     }).unsubscribe();
  //   }
  //   else{
  //     console.log("cannot undo (comp undo)");

  //   }
    
      
  // }

  // refaire(){
  //   console.log("refaire comp");
  //   var currentIndex=0;
  //   var length=0;
  //   this.obsHistory.subscribe(data=>{
  //     currentIndex=data.currentIndex;
  //     length=data.history.length;
  //   }).unsubscribe();

  //   if(currentIndex<length){
  //     this.HS.redo();
  //     this.obsHistory.subscribe(data=>{
  //       this.toDoService.load(data.current);
  //       localStorage.setItem('data',JSON.stringify(data.current));
  //       console.log("current load: "+data.current.label);
  //     }).unsubscribe();
  //   }
  // }

  // @HostListener('document:keydown.control.z') undo(event: KeyboardEvent) { 
  //   this.annuler();  
  // } 

  // @HostListener('document:keydown.control.y') redo(event: KeyboardEvent) { 
  //   this.refaire();  
  // } 
  
   

  // //pour ne pas perdre le focus quand on met a jour un item
  // trackByFn(index: number, item: TodoItem){
  //   return index;
  // }
  // // enable(){
  // //   if (this.isDisabled=="disabled"){
  // //     this.isDisabled="";
  // //   }
  // //   else{
  // //     this.isDisabled="disabled";
  // //   }
  // // }  
}
