import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }



  static hueRange(hash:number, min:number, max:number) {
    var diff = max - min;
    var x = ((hash % diff) + diff) % diff;
    return x + min;
  }

  static toHue(value:string, opts?:{hue:number[], sat:number[], lit:number[]}) {
    var h, s, l;
    let newOpts:any = opts ? opts : {};
    newOpts.hue = newOpts?.hue || [0, 360];
    newOpts.sat = newOpts?.sat || [75, 100];
    newOpts.lit = newOpts?.lit || [40, 60];


    var hash = 0;
    if (value.length === 0) return hash;
    for (var i = 0; i < value.length; i++) {
        hash = value.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }

    h = this.hueRange(hash, newOpts?.hue[0], newOpts?.hue[1]);
    s = this.hueRange(hash, newOpts?.sat[0], newOpts?.sat[1]);
    l = this.hueRange(hash, newOpts?.lit[0], newOpts?.lit[1]);

    return `hsl(${h}, ${s}%, ${l}%)`;
  }
}
