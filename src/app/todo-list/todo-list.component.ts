import { Component, OnInit, ChangeDetectionStrategy, HostListener, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
// import { stringify } from 'querystring';
import { BehaviorSubject, map, Observable, share } from 'rxjs';
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

  showAll=true;
  showDone=false;
  showActive=false;

  isShared=false;
  /**Limitations:
   * L'application bug quand on fait ctrl z on ctrly
   * pour annuler ou revenir en vant lorsqu'on a changé
   * de liste
   */

  listDB!: AngularFirestoreCollection<TodoList>;

  //nombre d'item restant
  countRemaining = new BehaviorSubject<number>(0);

  @Input() userName!: string;
  @Input() userId!: string;
  @Input() isAnon!: boolean;


  // subscribed=false; supprimer
  currentId!:string;

  constructor(router:Router,private sanitizer: DomSanitizer, private toDoService: TodolistService, private HS: HistoryService<TodoList>, private db: AngularFirestore) { 
    this.obsToDo=this.toDoService.observable;
    this.obsHistory=this.HS.observable;

    this.listDB=db.collection('/todoList');
  }


  //charge la premiere liste de l'utilisateur
  //puis s'abonne au compteurs
  //et charge les noms de liste de l'utilisateur
  //on derivant un abonnement depuis le service firestore
  ngOnInit(): void {
    let id ='anon';
    if(!this.isAnon){
      // id=this.userName+":"+this.userId+this.listId;
      id=this.userName+":"+this.userId+'0';
    }else{
      this.userName='anon';
      id='anon0'
    }
    console.log("id: "+id+this.isAnon);
    this.currentId=id;
    this.toDoService.loadData(id);
    this.count();
    this.loadLocalFilters();
    this.countRemaining.subscribe(remains => this.remaining=remains);

  

    //init de selection des listes
    this.obsList=this.listDB.snapshotChanges().pipe(
      map(changes =>
        changes.map(
          c => ({id: c.payload.doc.id,label:c.payload.doc.data().label})
        ).filter(c => c.id.includes(this.userName))
        ), share());
    this.countList();


   /**
    * Pour le qr code
    * idList au demarrage sera equivalement a la premiere liste 
    * on devrait initiser le premier doc a id+1*/
   if(!this.isAnon){
     this.idList=this.userId+'0';
     console.log('qrcode '+this.idList);
   } 
   else{
     this.idList=id;
   }
  }



  downloadUri!:SafeUrl;

  //exxporter une liste en JSON
  exportList(){
    let exportedData!:string;
    this.toDoService.observable.subscribe(data=>{
      localStorage.setItem('data',JSON.stringify(data));
      exportedData = JSON.stringify(data);
      console.log("exporting");
    }).unsubscribe();

    let uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(exportedData));
    this.downloadUri = uri;
  }

  //importer une liste JSON
  importList(file: any){ //unsub de l'ancien avec de load
    let selectedFile = file.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(selectedFile, "UTF-8");
    fileReader.onload = () => {
    //console.log(fileReader.result.toString());
    if(fileReader.result){
      let jsonObj=(JSON.parse(fileReader.result.toString()));
      console.log("lecture fichier"+jsonObj);
      this.toDoService.load(jsonObj);
      this.saveData(jsonObj);
      alert("Fichier importé aves succès");
    }
    }
    fileReader.onerror = (error) => {
    console.log(error);
    alert("Erreur fichier")
    }
  }

  // totalItems = new BehaviorSubject<number>(0);
  

  //sauvegarde les files de manière locale
  saveLocalFilters(){
    localStorage.setItem('showAll',JSON.stringify(this.showAll));
    localStorage.setItem('showDone',JSON.stringify(this.showDone));
    localStorage.setItem('showActive',JSON.stringify(this.showActive));
  }

  //charge les filtres (de manière locale)
  loadLocalFilters(){
    let retrievedFilter = localStorage.getItem('showAll');
    if(retrievedFilter){
      this.showAll=(JSON.parse(retrievedFilter));
    }
    retrievedFilter = localStorage.getItem('showDone');
    if(retrievedFilter){
      this.showDone=(JSON.parse(retrievedFilter));
    }
    retrievedFilter = localStorage.getItem('showActive');
    if(retrievedFilter){
      this.showActive=(JSON.parse(retrievedFilter));
    }
  }
    //on charge les données a l'abonnement



  ngOnDestroy(){
  }

  @HostListener('document:keydown.control.z') undo(event: KeyboardEvent) { 
    this.annuler();  
  } 

  @HostListener('document:keydown.control.y') redo(event: KeyboardEvent) { 
    this.refaire();  
  } 

  //on s'abonne a l'observable pour pouvoir le mettre dans le localStorage, push dans l'historique et unsubscribe pour eviter les doublons
  //charge la sauvegarde courante
  private saveState(){
    this.obsToDo.subscribe(data=>{
      this.listDB.doc(this.currentId).set(data);
      // localStorage.setItem('data',JSON.stringify(data));
      this.HS.push(data);
      console.log("saving");
    }).unsubscribe();
    
  }

  //charge une sauvegarde précise 
  saveData(data: TodoList){
    this.listDB.doc(this.currentId).set(data);
  }


  //ajoute un item dans la liste
  add(label: string){
  this.toDoService.create(label);
  this.saveState();
  }

  //supprime un item de la liste
  delete(item: TodoItem){
    this.toDoService.delete(item);
    this.saveState();
  }

  //met a jour un item de la liste
  update(data :Partial<TodoItem>,item: TodoItem){
    this.toDoService.update(data, item);
    this.saveState();
    
  }
  
  //undo
  annuler(){
    var canUndo=false;
    var currentIndex=0;
    this.obsHistory.subscribe(data=>currentIndex=data.currentIndex).unsubscribe();
    if(currentIndex>1){
      this.HS.undo();
      this.obsHistory.subscribe(data=>{
        this.toDoService.load(data.current);
        // localStorage.setItem('data',JSON.stringify(data.current));
        this.saveData(data.current);
      }).unsubscribe();
    }

  }

  //redo
  refaire(){
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
        // localStorage.setItem('data',JSON.stringify(data.current));
        this.saveData(data.current);
      }).unsubscribe();
    }

  }

  //recupere la liste des items, compte le nombre ditem restant avec un reduce puis se desabonne
  count(){
    // this.obsToDo.subscribe(data=>this.remaining=data.items.reduce((acc, item)=>(!item.isDone)?acc+1:acc,0)).unsubscribe();
    this.obsToDo.subscribe(data=>this.countRemaining.next(data.items.reduce((acc, item)=>(!item.isDone)?acc+1:acc,0)));

  }

  //en cours d'edition ou pas
  changeEdit(isEditing: boolean, item: TodoItem){
    this.toDoService.update({isEditing:!isEditing}, item);
    
  }

  //on met show a true a tous les item
  filterAll(){
    this.showAll=true;
    if(this.showAll){
      this.showActive=false;
      this.showDone=false;
    }
    this.saveLocalFilters();
  }

  //on met show a false aux item done
  filterActive(){
    this.showActive=true;
    if(this.showActive){
      this.showAll=false;
      this.showDone=false;
    }
    this.saveLocalFilters();

  }

  //on met show a true aux item done
  filterDone(){
    this.showDone=true;
    if(this.showDone){
      this.showAll=false;
      this.showActive=false;
    }
    this.saveLocalFilters();
  }

  //supprime les items selectionnés
  deleteDone(){
    this.obsToDo.subscribe(data => data.items.forEach(
        item => {if(item.isDone){this.toDoService.delete(item)}
          })).unsubscribe();

  this.saveState();
  }

  
  //Check tous les items (ou deselectionne si il le sont déjà)
  checkAll(items: readonly TodoItem[]){
    let allChecked!:boolean;
    this.countRemaining.subscribe(i => {
      allChecked=(i==0);
    }).unsubscribe;
    this.toDoService.update({isDone:!allChecked}, ...items);
    this.saveState();


  }


   //pour ne pas perdre le focus quand on met a jour un item
   trackByFn(index: number, item: TodoItem){
    return index;
   }


  //  id et label des liste de l'utilisateur
   obsList!: Observable<{id:string,label:string}[]>;


   //nombre de liste 
   listNb=0;


  //compte le nombre de liste de l'utiliasteur
  countList(){
    this.obsList.subscribe(data => {this.listNb=data.length
      // this.listNb=data.reduce((acc:number)=>(acc));
    });
  }

  //id de la nouvelle liste
  idList!:string;

  //creer une nouvelle liste voir aves les sauvegardes
  selectedLabel=''; //supprimer
  newList(i: number){ 
    this.toDoService.firestoreObs.unsubscribe(); //il faut unsub a chaque changemet sinon on des centianes d'instances qui s'ajoutent
    console.log(this.listNb.toString());
    let id ='anon';
    this.idList=this.randomString();
    if(!this.isAnon){
      id=this.userName+":"+this.userId+this.listNb.toString()+this.idList;
    }
    else{
      id=this.userName+":"+this.listNb.toString()+this.idList;
    }
    this.listDB.doc(id).set({label: 'TODO'+(i+1), items: [] }); //creation liste vierge
    this.toDoService.loadData(id); //chargelent liste vierge
    this.loadLocalFilters();
    this.countRemaining.subscribe(remains => this.remaining=remains);

    this.selected=this.listNb;
    // this.currentId=this.idList;
    this.currentId=id;

  }

  //change de liste
  selected=0;
  changeList(id:string, i:number){
    //il faut veilleur a change l'id
    // let id='anon'
    this.toDoService.firestoreObs.unsubscribe(); //il faut unsub a chaque changemet sinon on des centianes d'instances qui s'ajoutent
    this.selected=i; //pour le css
    console.log("chargement "+id); //debug
    // this.idList=i.toString()=='0'?'':i.toString(); //pour selectionner la bonne liste de l'utilisateur, la premiere etant coposé de son nom met uid
    this.idList=i.toString()=='0'?'':id.replace(this.userName,'').replace(this.userId,'').replace(':',''); //pour selectionner la bonne liste de l'utilisateur, la premiere etant coposé de son nom met uid
    console.log("idlist"+this.idList);//debug
    this.toDoService.loadData(id);//on charge la bonne liste depuis le service
    // this.currentId=this.idList;
    this.currentId=id;

    /**Pour le qr code si premiere liste on change l'id du qrcode */
    if(i==0){
      if(!this.isAnon){
        this.idList=this.userId+'0';
        console.log('qrcode '+this.idList);
      } 
      else{
        this.idList='anon0';
      }
    }
  }

  //utilisé pour determiner si une liste est selectionné
  //pour le css
  //a supprimer
  isSelected(index: number):boolean{
    return index==this.selected;
  }

  deleteList(list: {id:string,label:string}){
    if(this.listNb>1){
      this.listDB.doc(list.id).delete();
      if(this.currentId==list.id){
        let id ='anon';
        if(!this.isAnon){
          id=this.userName+":"+this.userId;
        }
        else{
          this.userName='anon';
        }
        this.currentId=id;
        this.toDoService.loadData(id);

      }
      
    }

  }
  
  //update le nom de liste
  updateLabel(label: string){
    this.toDoService.updateLabel(label);
    this.saveState();
  }

 
  private randomString():string {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 5);
  }


}
