import { Component } from '@angular/core';
import { MagicBlueBulbService } from '../lib';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public color = '#ffffff';

  public selectedColor: Subject<string> = new Subject<string>();

  constructor(private bulbService: MagicBlueBulbService) {}

  private subscription: Subscription;

  connect() {
    this.disconnect();
    this.subscription = this.bulbService.listen(this.selectedColor.asObservable()).subscribe(
      color => {
        console.log(`hexColor`, color);
      },
      error => {
        console.error(`error`, error);
      },
      () => {
        console.log(`complete`);
      }
    );
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  forgetDevice() {
    this.bulbService.forgetDevice();
  }
}
