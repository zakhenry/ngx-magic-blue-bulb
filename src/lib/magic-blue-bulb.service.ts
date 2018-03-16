import {Observable} from "rxjs/Observable";
import {fromPromise} from "rxjs/observable/fromPromise";
import {switchMap} from "rxjs/operators";

export class MagicBlueBulbService {

  private search(): Observable<BluetoothDevice> {
    const device$ = fromPromise(navigator.bluetooth.requestDevice({
      filters: [{
        namePrefix: 'LEDBLE'
      }],
      optionalServices: [0xffe5]
    }));

    return device$;
  }

  public connect(): Observable<BluetoothRemoteGATTServer> {

    return this.search().pipe(switchMap(device => new Observable(observer => {

      device.gatt.connect().then(server => {
        observer.next(server);
      }).catch(observer.error);

      return () => device.gatt.disconnect()
    })));

  }

}
