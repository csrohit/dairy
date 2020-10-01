import { Injectable } from '@angular/core';
import {
  CanActivate, CanActivateChild, CanDeactivate, CanLoad,
  Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { FlashMessagesService } from 'angular2-flash-messages';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad {
  constructor(
    private userService: UserService,
    private router: Router,
    private flash: FlashMessagesService
  ) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.userService.isAuthenticated()) {
      return true;
    }
    this.flash.show('Please login first!', { cssClass: 'alert alert-danger' });
    this.router.navigate(['/user/login']);
    return false;
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }
}
