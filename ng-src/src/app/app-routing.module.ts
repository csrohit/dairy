import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';


const routes: Routes = [
  { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule) },
  { path: '', component: HomeComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), MDBBootstrapModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
