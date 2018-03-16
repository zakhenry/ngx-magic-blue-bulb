import { Component } from '@angular/core';
import {MagicBlueBulbService} from "../lib";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(private bulbService: MagicBlueBulbService) {}

  connect() {
    this.bulbService.connect().subscribe(server => {
      console.log(`server`, server);

        server.getPrimaryService(0xffe5)
          .then(gattService => gattService.getCharacteristic(0xffe9))
          .then(char => {


            const arg = [0x56, 0x00, 0x00, 0xff, 0x00, 0xf0, 0xaa];
            // 56 ff 08 5a 00 f0 aa

            const buffer = new Uint8Array(arg);

            char.writeValue(buffer);

            console.log(`buffer written`, buffer);

        })

      // Characteristic number ffe9 in Service ffe5

    },
 error => {
      console.error(`error`, error);
      });
  }

}
