import { ApplicationRef, Component, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App { }

const appRef: ApplicationRef = await bootstrapApplication(
  App,
  {
    providers: []
  }
);