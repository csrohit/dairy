import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserRegisterComponent } from './user-register/user-register.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserGuard } from './user.guard';

const routes: Routes = [
  {path: 'login', component: UserLoginComponent},
  { path: 'dashboard', canActivate: [UserGuard], component: DashboardComponent},
  {path: '', component: UserRegisterComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
