import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { SharedListComponent } from './shared-list/shared-list.component';
import { TodoListComponent } from './todo-list/todo-list.component';



const routes: Routes = [
    { path: 'list/:id', component: SharedListComponent
    }, 

];

@NgModule({imports:[
    RouterModule.forRoot(routes)
],
exports: [
    RouterModule
]})
export class AppRoutingModule{}