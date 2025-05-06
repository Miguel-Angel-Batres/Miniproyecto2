import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'securedom'
})
export class SecuredomPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(videoId: string, baseUrl: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(baseUrl + videoId);
  }

}
