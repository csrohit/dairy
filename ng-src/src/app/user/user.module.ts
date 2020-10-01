import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UserRoutingModule } from './user-routing.module';
import { UserRegisterComponent } from './user-register/user-register.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserService } from './user.service';


@NgModule({
  declarations: [UserRegisterComponent, UserLoginComponent, DashboardComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    ReactiveFormsModule
  ],
  providers: [UserService],
})
export class UserModule { }
