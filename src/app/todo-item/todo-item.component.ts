import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { TodoItem, TodoList, TodolistService } from '../todolist.service';
@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoItemComponent implements OnInit {

  @Input() data!: TodoItem; 
  @Output() update = new EventEmitter<Partial<TodoItem>>();
  @Output() remove = new  EventEmitter<TodoItem>();
  
  constructor() {}

  ngOnInit(): void {
  }

  updateData(partialData :Partial<TodoItem>){
    this.update.emit(partialData);
  }

  delete(item: TodoItem){
    this.remove.emit(item);
  }


}
