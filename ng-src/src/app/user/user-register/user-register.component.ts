import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';

import { User, MailPreferenceArray } from '../user';
import { UserService } from '../user.service';
import { confirmPasswrdValidator } from '../../shared/customValidators';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FlashMessagesService } from 'angular2-flash-messages';
@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent implements OnInit {
  mailPreferences: string[] = [];
  modal: { show: boolean, title?: string, body?: string } = {
    show: false
  };

  profileForm = this.fb.group({
    name: ['Sanket Niprul', Validators.required],
    userName: ['sniprul', Validators.required],
    email: ['sniprul@gmail.com', Validators.required],
    password: ['1234', Validators.required],
    confirmPassword: ['1234', Validators.required],
    age: ['22', Validators.required],
    phone: ['8983375797', Validators.required],
    address: this.fb.group({
      line1: ['Bada Bajar', Validators.required],
      line2: [''],
      villTown: ['Kandri', Validators.required],
      taluka: ['Mohadi', Validators.required],
      district: ['Bhandara', Validators.required],
      state: ['Maharashtra', Validators.required],
      country: ['India', Validators.required],
      pincode: ['441908', Validators.required],
    }),
    location: this.fb.group({
      x: ['21.387895'],
      y: ['79.546210']
    }),
    mailPreference: new FormArray([])
  }, { validators: confirmPasswrdValidator });



  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private flash: FlashMessagesService
  ) { }

  get mailPreference(): FormArray {
    return this.profileForm.controls.mailPreference as FormArray;
  }


  ngOnInit(): void {
    this.userService.getMailPreferences().subscribe(
      (data) => {
        this.mailPreferences = data;
        data.forEach(() => { this.mailPreference.push(new FormControl(false)); });
      },
      (err) => { console.error(err); }
    );
  }
  onSubmit(): void {
    const user: User = {
      name: this.profileForm.get('name').value,
      userName: this.profileForm.get('userName').value,
      email: this.profileForm.get('email').value,
      password: this.profileForm.get('password').value,
      age: this.profileForm.get('age').value,
      phone: this.profileForm.get('phone').value,
      address: this.profileForm.get('address').value,
      location: this.profileForm.get('location').value,
      mailPreference: {}
    };
    this.profileForm.get('mailPreference').value.forEach((element: boolean, index: number) => {
      user.mailPreference[MailPreferenceArray[index]] = element;
    });
    this.userService.registerUser(user).subscribe((data) => {
      this.flash.show('Registration complete and can now login', { cssClass:'alert-danger', timeout: 5000});
      this.router.navigate(['/user/login']);
    }, (err: HttpErrorResponse) => {
      switch (err.status) {
        case 504:
          this.showModal('connection failed', 'could not connect to database <br> try again later');
          break;
        case 409:
          this.showModal('failed to register', `user with username ${this.profileForm.get('userName').value} already exists`);
          break;
        default:
          this.showModal('Something\'s not right', 'an unknown error occured <br> sorry forthe inconvienience');
      }
    });
  }

  showModal(title: string, body: string): void {
    this.modal.title = title;
    this.modal.body = body;
    this.modal.show = true;
  }
  closeModal(): void {
    this.modal.show = false;
  }
}

