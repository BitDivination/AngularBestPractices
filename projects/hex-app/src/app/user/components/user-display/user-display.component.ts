import { Component, OnInit, input, InputSignal, output } from '@angular/core';
import { User } from '@hex/imp';
import { FormControl } from '@angular/forms';
import { debounceTime, tap } from 'rxjs/operators';

@Component({
  selector: 'app-user-display',
  standalone: true,
  template: `
    <p>Hello {{ user()?.getDisplayName() || '- -' }}!</p>

    <input [formControl]="userNameControl">
  `
})
export class UserDisplayComponent implements OnInit {
  user: InputSignal<User> = input<User>(undefined);
  updatedUser = output<User>();

  userNameControl = new FormControl('');

  ngOnInit(): void {
    this.userNameControl.valueChanges.pipe(
      debounceTime(333),
      tap(value => {
        try {
          this.updatedUser.emit(this.user.update('name', value));
        } catch (error) {
          console.error('Cannot update name with that!')
        }
      }),
    ).subscribe();
  }
}
