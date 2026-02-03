// team-generator.component.ts

// --- (Incolla qui i Modelli di Dati e le Mappe come nell'esempio precedente) ---

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- ASSICURATI CHE SIA PRESENTE!

// Mappa i livelli per il calcolo del Punteggio di Abilità S
// Livello Base (Offset) + Divisione
const RANK_OFFSETS: { [key: string]: number } = {
  Bronzo: 0,
  Argento: 6,
  Oro: 12,
  Platino: 18,
  Diamante: 24,
  Onice: 30,
};

// Aggiungi questa mappa:
const ROMAN_TO_ARABIC: { [key: string]: number } = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
};

// Array di tutte le opzioni di ranking per la dropdown
export const RANK_OPTIONS: string[] = [
  'Bronzo_I',
  'Bronzo_II',
  'Bronzo_III',
  'Bronzo_IV',
  'Bronzo_V',
  'Bronzo_VI',
  'Argento_I',
  'Argento_II',
  'Argento_III',
  'Argento_IV',
  'Argento_V',
  'Argento_VI',
  'Oro_I',
  'Oro_II',
  'Oro_III',
  'Oro_IV',
  'Oro_V',
  'Oro_VI',
  'Platino_I',
  'Platino_II',
  'Platino_III',
  'Platino_IV',
  'Platino_V',
  'Platino_VI',
  'Diamante_I',
  'Diamante_II',
  'Diamante_III',
  'Diamante_IV',
  'Diamante_V',
  'Diamante_VI',
];

// ... (Incolla qui le interfacce Giocatore e Squadra) ...

export interface Giocatore {
  id: number;
  nome: string;
  rank: string; // Es: 'Diamante_VI'
  score: number; // Punteggio di Abilità S (1-30)
}

export interface Squadra {
  nome: string;
  membri: Giocatore[];
  punteggioTotale: number;
}

@Component({
  selector: 'app-team-generator',
  standalone: true,
  // Dichiara FormsModule qui
  imports: [CommonModule, FormsModule],
  templateUrl: './team-generator.html',
  styleUrl: './team-generator.css',
})
export class TeamGenerator implements OnInit {
  // Proprietà per i dati
  giocatori: Giocatore[] = [];
  squadre: Squadra[] = [];
  rankOptions = RANK_OPTIONS;
  numeroPartecipanti: number = 16;
  messaggioErrore: string = '';

  // Inizializza i 16 giocatori
  ngOnInit() {
    this.impostaPartecipanti();
  }

  impostaPartecipanti() {
    if (this.numeroPartecipanti % 4 !== 0) {
      this.messaggioErrore = 'Il numero di giocatori deve essere divisibile per 4.';
      this.giocatori = [];
      this.squadre = [];
      return;
    }
    this.messaggioErrore = '';
    this.giocatori = [];
    this.squadre = [];
    for (let i = 1; i <= this.numeroPartecipanti; i++) {
      this.giocatori.push({
        id: i,
        nome: `Giocatore ${i}`,
        rank: 'Oro_III', // Rank di default
        score: 0,
      });
    }
  }

  // Funzione per calcolare il Punteggio di Abilità (S)
  private calcolaScore(rank: string): number {
    if (!rank || rank === '') return 0;

    const [tier, divisionStr] = rank.split('_');

    // *** CORREZIONE QUI ***
    // Cerca il valore numerico usando la mappa ROMAN_TO_ARABIC
    const division = ROMAN_TO_ARABIC[divisionStr] || 0;
    // *** FINE CORREZIONE ***

    const offset = RANK_OFFSETS[tier] || 0;

    // Il punteggio minimo per Bronzo I sarà 0 + 1 = 1, superando il filtro g.score > 0
    return offset + division;
  }

  // --- ALGORITMO DI BILANCIAMENTO ---
  generaSquadre(): void {
    // 1. Calcola i punteggi per tutti i giocatori
    this.giocatori.forEach((g) => {
      g.score = this.calcolaScore(g.rank);
    });

    // Filtra i giocatori con score > 0 e li ordina dal più forte al più debole
    const giocatoriOrdinati = this.giocatori
      .filter((g) => g.score > 0)
      .sort((a, b) => b.score - a.score);

    // Verifica che ci siano esattamente il numero di giocatori previsto
    if (giocatoriOrdinati.length !== this.numeroPartecipanti) {
      alert(
        `Errore: Devi inserire esattamente ${this.numeroPartecipanti} giocatori con un rank valido. Trovati ${giocatoriOrdinati.length}.`
      );
      this.squadre = [];
      return;
    }

    const numeroSquadre = this.numeroPartecipanti / 4;
    this.squadre = [];
    for (let i = 0; i < numeroSquadre; i++) {
      this.squadre.push({ nome: `Squadra ${i + 1}`, membri: [], punteggioTotale: 0 });
    }

    // 2. Algoritmo a Serpente (Zig-Zag) per il bilanciamento

    for (let i = 0; i < giocatoriOrdinati.length; i++) {
      const giocatore = giocatoriOrdinati[i];
      let indiceSquadra: number;

      // Determina l'indice della squadra in base al pattern serpente
      if (Math.floor(i / numeroSquadre) % 2 === 0) {
        // Sequenza dispari: 0, 1, 2, 3
        indiceSquadra = i % numeroSquadre;
      } else {
        // Sequenza pari: 3, 2, 1, 0 (Ordine inverso)
        indiceSquadra = numeroSquadre - 1 - (i % numeroSquadre);
      }

      // Assegna il giocatore
      const squadra = this.squadre[indiceSquadra];
      squadra.membri.push(giocatore);
      squadra.punteggioTotale += giocatore.score;
    }
  }

  // --- ALGORITMO DI GENERAZIONE CASUALE ---
  generaSquadreCasuali(): void {
    // 1. Calcola i punteggi per tutti i giocatori
    this.giocatori.forEach((g) => {
      g.score = this.calcolaScore(g.rank);
    });

    // Filtra i giocatori con score > 0
    const giocatoriValidi = this.giocatori.filter((g) => g.score > 0);

    // Verifica che ci siano esattamente il numero di giocatori previsto
    if (giocatoriValidi.length !== this.numeroPartecipanti) {
      alert(
        `Errore: Devi inserire esattamente ${this.numeroPartecipanti} giocatori con un rank valido. Trovati ${giocatoriValidi.length}.`
      );
      this.squadre = [];
      return;
    }

    // 2. Crea una copia e la mescola (Fisher-Yates shuffle)
    const giocatoriMescolati = [...giocatoriValidi];
    for (let i = giocatoriMescolati.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [giocatoriMescolati[i], giocatoriMescolati[j]] = [
        giocatoriMescolati[j],
        giocatoriMescolati[i],
      ];
    }

    const numeroSquadre = this.numeroPartecipanti / 4;
    this.squadre = [];
    for (let i = 0; i < numeroSquadre; i++) {
      this.squadre.push({ nome: `Squadra ${i + 1}`, membri: [], punteggioTotale: 0 });
    }

    // 3. Distribuisci i giocatori mescolati tra le squadre (4 giocatori ciascuna)
    for (let i = 0; i < giocatoriMescolati.length; i++) {
      const indiceSquadra = i % numeroSquadre;
      const squadra = this.squadre[indiceSquadra];
      squadra.membri.push(giocatoriMescolati[i]);
      squadra.punteggioTotale += giocatoriMescolati[i].score;
    }
  }
}
