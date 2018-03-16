import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { exhaustMap, finalize, map, mapTo, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';

export type ColourHex = [number, number, number];

export class MagicBlueBulbService {
  private static serviceId = 0xffe5;
  private static characteristicId = 0xffe9;

  private colourStream: Subject<ColourHex> = new ReplaySubject(1);

  private device$: Observable<BluetoothDevice>;
  private subscribedStreams: Subscription[] = [];

  private search(): Observable<BluetoothDevice> {
    if (this.device$) {
      return this.device$;
    }

    this.device$ = fromPromise(
      navigator.bluetooth.requestDevice({
        filters: [
          {
            namePrefix: 'LEDBLE',
          },
        ],
        optionalServices: [MagicBlueBulbService.serviceId],
      })
    );

    return this.device$;
  }

  public forgetDevice(): void {
    this.device$ = undefined;
  }

  private connect(): Observable<BluetoothRemoteGATTServer> {
    return this.search().pipe(
      switchMap(
        device =>
          new Observable(observer => {
            device.gatt
              .connect()
              .then(server => {
                observer.next(server);
              })
              .catch(error => {
                observer.error(error);
              });

            return () => device.gatt.disconnect();
          })
      )
    );
  }

  private getCharacteristic(): Observable<BluetoothRemoteGATTCharacteristic> {
    return this.connect().pipe(
      switchMap(server => server.getPrimaryService(MagicBlueBulbService.serviceId)),
      switchMap(service => service.getCharacteristic(MagicBlueBulbService.characteristicId))
    );
  }

  public listen(stream?: Observable<ColourHex | string>): Observable<ColourHex> {
    if (stream) {
      this.registerColourStream(stream);
    }

    return this.getCharacteristic().pipe(
      switchMap(characteristic => {
        return this.colourStream.pipe(
          // this should really be a debounceMap/auditMap operator or similar to ensure that the last ignored message is retried
          // @see https://github.com/ReactiveX/rxjs/issues/1777
          exhaustMap(colour => {
            const buffer = new Uint8Array([0x56, ...colour, 0x00, 0xf0, 0xaa]);

            return fromPromise(characteristic.writeValue(buffer)).pipe(mapTo(colour));
          })
        );
      }),
      finalize(() => this.subscribedStreams.forEach(s => s.unsubscribe()))
    );
  }

  public setColour(colourStringOrHex: ColourHex | string): void {
    this.colourStream.next(this.colourStringOrHexToHex(colourStringOrHex));
  }

  private colourStringToHex(colourString: string): ColourHex {
    return colourString
      .substr(1)
      .match(/(..?)/g)
      .map(s => parseInt(s, 16)) as ColourHex;
  }

  private colourStringOrHexToHex(colourStringOrHex: ColourHex | string): ColourHex {
    return typeof colourStringOrHex === 'string' ? this.colourStringToHex(colourStringOrHex) : colourStringOrHex;
  }

  public registerColourStream(stream: Observable<ColourHex | string>): void {
    this.subscribedStreams.push(
      stream.pipe(map(s => this.colourStringOrHexToHex(s))).subscribe(colour => this.colourStream.next(colour))
    );
  }
}
