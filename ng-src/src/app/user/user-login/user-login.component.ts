import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {

  loginForm = this.fb.group({
    userName: ['csrohit', Validators.required],
    password: ['1234', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }
  onSubmit(): void {
    this.userService.authenticateUser(this.loginForm.value).subscribe((response) => {
      // alert(`logged in ${this.loginForm.get('userName').value}`);
      this.userService.storeToken(response.token, response.user);
      this.router.navigate(['/user/dashboard']);
    }, err => console.log(err));
  }

}
