// src/app/app.component.ts
import { Component } from '@angular/core';
import { TeamGenerator } from './team-generator/team-generator'; // Importa il tuo componente

@Component({
  selector: 'app-root',
  standalone: true,
  // Aggiungi TeamGeneratorComponent a 'imports'
  imports: [TeamGenerator],
  template: ` <app-team-generator></app-team-generator> `,
  styles: [''],
})
export class AppComponent {
  title = 'halo-team-generator';
}
