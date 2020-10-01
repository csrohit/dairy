import { Component, OnInit } from '@angular/core';
import { UserService } from '../user/user.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  constructor(
    public userService: UserService,
    private router: Router,
    private flash: FlashMessagesService
  ) { }

  ngOnInit(): void {
  }

  logout(): void{
    this.userService.logout();
    this.flash.show('You have now logged out', { cssClass: 'alert alert-success'});
    this.router.navigate(['/user/login']);
  }

}
