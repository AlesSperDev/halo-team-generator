// team-generator.component.ts

// --- (Incolla qui i Modelli di Dati e le Mappe come nell'esempio precedente) ---

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- ASSICURATI CHE SIA PRESENTE!

// RENAMED: La lista originale ora funge da fallback di default
const DEFAULT_HALO_RANKINGS: { [key: string]: string } = {
  deviltoroita: 'Silver 5',
  Alpina6018: 'Gold 1',
  Marcogiosue: 'Gold 3',
  'Miki MclfdM': 'Gold 4',
  AltSpy7184: 'Gold 5',
  guidinovi: 'Gold 5',
  TRINTY76: 'Gold 6',
  Ugototti7133: 'Gold 6',
  HithustMassi: 'Gold 6',
  Giddy892394: 'Platinum 1',
  TurboDax85: 'Platinum 1',
  Colmoschin1: 'Platinum 1',
  GalloKun2658: 'Platinum 2',
  CAPTAINLUCAS84: 'Platinum 2',
  Redgar8: 'Platinum 3',
  EVOAXL: 'Platinum 3',
  'MARCY XRX': 'Platinum 4',
  BlankAdAstra: 'Platinum 4',
  alegamer106: 'Platinum 5',
  'Davide Dsc': 'Diamond 1',
};

// UPDATED: English rank tiers
const RANK_OFFSETS: { [key: string]: number } = {
  Bronze: 0,
  Silver: 6,
  Gold: 12,
  Platinum: 18,
  Diamond: 24,
  Onyx: 30,
};

// NEW: Team names
const SQUADRE_NOMI = [
  'Alpha',
  'Bravo',
  'Charlie',
  'Delta',
  'Echo',
  'Foxtrot',
  'Golf',
  'Hotel',
];

// UPDATED: Generate rank options programmatically
export const RANK_OPTIONS: string[] = Object.keys(RANK_OFFSETS)
  .filter((tier) => tier !== 'Onyx') // Onyx has a different structure
  .flatMap((tier) => Array.from({ length: 6 }, (_, i) => `${tier}_${i + 1}`));

// UPDATED: Giocatore interface
export interface Giocatore {
  id: number;
  nome: string;
  rank: string; // Es: 'Diamond_1'
  score: number;
  team?: string | null; // Es: 'Alpha' or null
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

  // NEW properties
  // Player lists are now class properties to be mutable
  haloRankings: { [key: string]: string } = {};
  giocatoriPredefiniti: string[] = [];
  nomiSquadre = SQUADRE_NOMI;

  // NEW: List for the player management UI
  listaGiocatoriModificabile: { key: string; value: string }[] = [];

  // NEW: trackBy function for ngFor (Fixes HTML error)
  trackByIndex(index: number, item: any): number {
    return index;
  }

  // NEW: Restituisce un Set di nomi di giocatori predefiniti già selezionati.
  get giocatoriPredefinitiSelezionati(): Set<string> {
    const selected = new Set<string>();
    this.giocatori.forEach((g) => {
      // Use haloRankings to check if it's a predefined player
      if (this.haloRankings[g.nome]) {
        selected.add(g.nome);
      }
    });
    return selected;
  }

  ngOnInit() {
    this.caricaGiocatoriDaStorage(); // Load players on init
    this.impostaPartecipanti();
  }

  // NEW: Loads the list from localStorage or uses defaults
  caricaGiocatoriDaStorage(): void {
    const storedPlayers = localStorage.getItem('halo-team-gen-players');
    if (storedPlayers) {
      try {
        this.haloRankings = JSON.parse(storedPlayers);
      } catch (e) {
        console.error('Error parsing players from localStorage', e);
        this.haloRankings = { ...DEFAULT_HALO_RANKINGS };
      }
    } else {
      this.haloRankings = { ...DEFAULT_HALO_RANKINGS };
    }
    this.aggiornaListeGiocatori();

    // Update default participants count to match the loaded list size if valid
    const loadedCount = this.giocatoriPredefiniti.length;
    if (loadedCount >= 4 && loadedCount <= 32 && loadedCount % 4 === 0) {
      this.numeroPartecipanti = loadedCount;
    }
  }

  // NEW: Updates the lists used by the component after a change
  private aggiornaListeGiocatori(): void {
    this.giocatoriPredefiniti = Object.keys(this.haloRankings);
    this.listaGiocatoriModificabile = Object.entries(this.haloRankings).map(
      ([key, value]) => ({ key, value }),
    );
  }

  // NEW: Saves the current editable list to localStorage
  salvaGiocatoriSuStorage(): void {
    const nuovoHaloRankings: { [key: string]: string } = {};
    for (const player of this.listaGiocatoriModificabile) {
      if (player.key && player.key.trim() !== '') {
        nuovoHaloRankings[player.key.trim()] = player.value;
      }
    }

    localStorage.setItem(
      'halo-team-gen-players',
      JSON.stringify(nuovoHaloRankings),
    );
    this.haloRankings = nuovoHaloRankings;
    this.aggiornaListeGiocatori();
    alert('Lista giocatori personalizzata salvata!');
  }

  // NEW: Adds an empty row for a new player in the management UI
  aggiungiGiocatore(): void {
    this.listaGiocatoriModificabile.push({ key: '', value: 'Bronze 1' });
  }

  // NEW: Removes a player from the management list
  rimuoviGiocatore(index: number): void {
    this.listaGiocatoriModificabile.splice(index, 1);
  }

  // NEW: Resets the list to default values
  resettaListaGiocatori(): void {
    if (
      confirm(
        'Sei sicuro di voler resettare la lista ai valori predefiniti? Le modifiche andranno perse.',
      )
    ) {
      localStorage.removeItem('halo-team-gen-players');
      this.caricaGiocatoriDaStorage();
    }
  }

  impostaPartecipanti() {
    if (
      this.numeroPartecipanti % 4 !== 0 ||
      this.numeroPartecipanti > 32 ||
      this.numeroPartecipanti < 4
    ) {
      this.messaggioErrore =
        'Il numero di giocatori deve essere un multiplo di 4 (compreso tra 4 e 32).';
      this.squadre = [];
      return;
    }
    this.messaggioErrore = '';
    this.squadre = [];

    const currentCount = this.giocatori.length;
    const newCount = this.numeroPartecipanti;

    if (newCount > currentCount) {
      // Aggiunge nuovi giocatori se il numero aumenta
      for (let i = currentCount + 1; i <= newCount; i++) {
        this.giocatori.push({
          id: i,
          nome: `Giocatore ${i}`,
          rank: 'Gold_3',
          score: 0,
          team: null,
        });
      }
    } else if (newCount < currentCount) {
      // Rimuove i giocatori in eccesso se il numero diminuisce
      this.giocatori.length = newCount;
    }
  }
  // NEW method to handle selection from predefined list
  onPlayerSelect(giocatore: Giocatore, gamertag: string) {
    if (gamertag && this.haloRankings[gamertag]) {
      giocatore.nome = gamertag;
      // Convert "Gold 5" to "Gold_5"
      giocatore.rank = this.haloRankings[gamertag].replace(' ', '_');
    }
  }

  caricaGiocatoriPredefiniti(): void {
    const giocatoriPredefiniti = Object.entries(this.haloRankings);
    const numeroGiocatori = giocatoriPredefiniti.length;

    if (
      numeroGiocatori % 4 !== 0 ||
      numeroGiocatori > 32 ||
      numeroGiocatori < 4
    ) {
      this.messaggioErrore = `Il numero di giocatori predefiniti (${numeroGiocatori}) non è un multiplo di 4 valido.`;
      return;
    }

    this.numeroPartecipanti = numeroGiocatori;
    this.messaggioErrore = '';
    this.squadre = [];
    this.giocatori = giocatoriPredefiniti.map(([nome, rank], index) => ({
      id: index + 1,
      nome: nome,
      rank: rank.replace(' ', '_'),
      score: 0,
      team: null,
    }));
  }

  // UPDATED: calcolaScore to handle new rank format
  private calcolaScore(rank: string): number {
    if (!rank || rank === '') return 0;

    const parts = rank.split('_');
    if (parts.length !== 2) return 0;

    const [tier, divisionStr] = parts;
    const division = parseInt(divisionStr, 10);

    if (isNaN(division)) return 0;

    const offset = RANK_OFFSETS[tier] || 0;

    return offset + division;
  }

  // NEW: Resets only the team assignments for all players
  resetAssegnazioniSquadre(): void {
    this.giocatori.forEach((g) => (g.team = null));
    // Force array reference update and deep clone to ensure UI updates and no references linger
    this.giocatori = JSON.parse(JSON.stringify(this.giocatori));
    // Re-calculate scores immediately to ensure state is consistent
    this.giocatori.forEach((g) => (g.score = this.calcolaScore(g.rank)));
  }

  // UPDATED: generaSquadre to handle pre-assignment
  generaSquadre(): void {
    // Create a deep copy of players to ensure we work with a clean slate,
    // preventing any state from previous runs from interfering.
    const giocatoriPerBilanciamento: Giocatore[] = JSON.parse(
      JSON.stringify(this.giocatori),
    );

    // 1. Calcola i punteggi e filtra i giocatori validi
    giocatoriPerBilanciamento.forEach((g) => {
      g.score = this.calcolaScore(g.rank);
    });

    const giocatoriValidi = giocatoriPerBilanciamento.filter(
      (g) => g.nome && g.nome.trim() !== '' && g.score > 0,
    );

    if (giocatoriValidi.length !== this.numeroPartecipanti) {
      alert(
        `Errore: Devi inserire ${this.numeroPartecipanti} giocatori con nome e rank validi. Trovati ${giocatoriValidi.length}.`,
      );
      this.squadre = [];
      return;
    }

    // 2. Inizializza le squadre
    const numeroSquadre = this.numeroPartecipanti / 4;
    this.squadre = [];
    for (let i = 0; i < numeroSquadre; i++) {
      this.squadre.push({
        nome: `Squadra ${this.nomiSquadre[i]}`,
        membri: [],
        punteggioTotale: 0,
      });
    }

    // 3. Separa giocatori pre-assegnati e da bilanciare
    const giocatoriDaBilanciare: Giocatore[] = [];
    giocatoriValidi.forEach((giocatore) => {
      // FIX: Check for a valid, non-empty team string instead of just truthiness.
      // This ensures that selecting "-- Assegna Squadra --" (which sets team to "")
      // correctly un-assigns the player.
      if (giocatore.team && typeof giocatore.team === 'string') {
        const squadraAssegnata = this.squadre.find(
          (s) => s.nome === `Squadra ${giocatore.team}`,
        );
        if (squadraAssegnata) {
          squadraAssegnata.membri.push(giocatore);
          squadraAssegnata.punteggioTotale += giocatore.score;
        } else {
          giocatoriDaBilanciare.push(giocatore);
        }
      } else {
        giocatoriDaBilanciare.push(giocatore);
      }
    });

    // 4. Controlla se qualche squadra ha più di 4 giocatori
    const squadreSovraccariche = this.squadre.filter(
      (s) => s.membri.length > 4,
    );
    if (squadreSovraccariche.length > 0) {
      const nomi = squadreSovraccariche.map((s) => s.nome).join(', ');
      alert(
        `Errore: Le seguenti squadre hanno più di 4 giocatori pre-assegnati: ${nomi}.`,
      );
      this.squadre = [];
      return;
    }

    // 5. Mescola prima i giocatori per rompere i pareggi, poi ordina per punteggio.
    // Questo evita che l'algoritmo sia troppo deterministico (sempre lo stesso ordine per rank uguali).
    for (let i = giocatoriDaBilanciare.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [giocatoriDaBilanciare[i], giocatoriDaBilanciare[j]] = [
        giocatoriDaBilanciare[j],
        giocatoriDaBilanciare[i],
      ];
    }

    const giocatoriOrdinati = giocatoriDaBilanciare.sort(
      (a, b) => b.score - a.score,
    );

    while (giocatoriOrdinati.length > 0) {
      // Calcola la media dinamica dei giocatori RIMANENTI per una proiezione più accurata
      const currentAvg =
        giocatoriOrdinati.reduce((sum, p) => sum + p.score, 0) /
        giocatoriOrdinati.length;

      const squadreDisponibili = this.squadre.filter(
        (s) => s.membri.length < 4,
      );
      if (squadreDisponibili.length === 0) break;

      // NEW: Mescola le squadre disponibili prima di ordinare.
      // Questo rompe il determinismo: se due squadre hanno lo stesso bisogno (es. all'inizio),
      // non vincerà sempre "Alpha", ma una a caso.
      for (let i = squadreDisponibili.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [squadreDisponibili[i], squadreDisponibili[j]] = [
          squadreDisponibili[j],
          squadreDisponibili[i],
        ];
      }

      // Ordina le squadre in base al punteggio finale "proiettato" più basso.
      // Questo aiuta una squadra con 3 giocatori deboli a ricevere un giocatore forte,
      // perché il suo punteggio proiettato sarà più basso di una squadra vuota.
      squadreDisponibili.sort((a, b) => {
        const projectedScoreA =
          a.punteggioTotale + (4 - a.membri.length) * currentAvg;
        const projectedScoreB =
          b.punteggioTotale + (4 - b.membri.length) * currentAvg;
        return projectedScoreA - projectedScoreB;
      });

      const squadraTarget = squadreDisponibili[0];
      // Prendi il miglior giocatore disponibile (senza tolleranza casuale per massimizzare il bilanciamento iniziale)
      const giocatore = giocatoriOrdinati.shift()!;

      squadraTarget.membri.push(giocatore);
      squadraTarget.punteggioTotale += giocatore.score;
    }

    // FASE 2: Ottimizzazione Post-Processing (Swapping)
    // Cerca di scambiare giocatori tra la squadra più forte e quella più debole per ridurre il gap.
    this.ottimizzaBilanciamento();
  }

  private ottimizzaBilanciamento() {
    let migliorato = true;
    let iterazioni = 0;

    // Continua a scambiare finché trovi miglioramenti o raggiungi un limite di sicurezza
    while (migliorato && iterazioni < 100) {
      migliorato = false;
      iterazioni++;

      // Ordina le squadre per punteggio totale
      this.squadre.sort((a, b) => a.punteggioTotale - b.punteggioTotale);
      const minTeam = this.squadre[0];
      const maxTeam = this.squadre[this.squadre.length - 1];
      const diffAttuale = maxTeam.punteggioTotale - minTeam.punteggioTotale;

      if (diffAttuale <= 1) break; // Bilanciamento perfetto raggiunto

      // Cerca uno scambio valido tra giocatori NON bloccati
      // Un giocatore è "bloccato" se ha la proprietà 'team' impostata (pre-assegnato)
      const candidatiMin = minTeam.membri.filter((p) => !p.team);
      const candidatiMax = maxTeam.membri.filter((p) => !p.team);

      let bestSwap = null;

      for (const pMin of candidatiMin) {
        for (const pMax of candidatiMax) {
          // Calcola quanto guadagnerebbe la squadra debole (e perderebbe la forte)
          const gain = pMax.score - pMin.score;

          // Lo scambio è utile se riduce il gap senza invertirlo eccessivamente
          // Idealmente gain dovrebbe essere circa metà della differenza
          if (gain > 0 && gain < diffAttuale) {
            const nuovoMin = minTeam.punteggioTotale + gain;
            const nuovoMax = maxTeam.punteggioTotale - gain;
            const nuovaDiff = Math.abs(nuovoMax - nuovoMin);

            if (nuovaDiff < diffAttuale) {
              // Trovato uno scambio che migliora la situazione
              if (!bestSwap || nuovaDiff < bestSwap.newDiff) {
                bestSwap = { pMin, pMax, newDiff: nuovaDiff, gain };
              }
            }
          }
        }
      }

      if (bestSwap) {
        // Esegui lo scambio
        const { pMin, pMax, gain } = bestSwap;

        // Rimuovi
        minTeam.membri = minTeam.membri.filter((p) => p !== pMin);
        maxTeam.membri = maxTeam.membri.filter((p) => p !== pMax);

        // Aggiungi (scambiati)
        minTeam.membri.push(pMax);
        maxTeam.membri.push(pMin);

        // Aggiorna punteggi
        minTeam.punteggioTotale += gain;
        maxTeam.punteggioTotale -= gain;

        migliorato = true;
      }
    }
  }

  // UPDATED: generaSquadreCasuali to handle pre-assignment
  generaSquadreCasuali(): void {
    // Create a deep copy of players to ensure we work with a clean slate.
    const giocatoriPerBilanciamento: Giocatore[] = JSON.parse(
      JSON.stringify(this.giocatori),
    );

    // 1. Calcola i punteggi e filtra i giocatori validi
    giocatoriPerBilanciamento.forEach((g) => {
      g.score = this.calcolaScore(g.rank);
    });

    const giocatoriValidi = giocatoriPerBilanciamento.filter(
      (g) => g.nome && g.nome.trim() !== '' && g.score > 0,
    );
    if (giocatoriValidi.length !== this.numeroPartecipanti) {
      alert(
        `Errore: Devi inserire ${this.numeroPartecipanti} giocatori con nome e rank validi. Trovati ${giocatoriValidi.length}.`,
      );
      this.squadre = [];
      return;
    }

    // 2. Inizializza le squadre
    const numeroSquadre = this.numeroPartecipanti / 4;
    this.squadre = [];
    for (let i = 0; i < numeroSquadre; i++) {
      this.squadre.push({
        nome: `Squadra ${this.nomiSquadre[i]}`,
        membri: [],
        punteggioTotale: 0,
      });
    }

    // 3. Separa giocatori pre-assegnati e da mischiare
    const giocatoriDaMischiare: Giocatore[] = [];
    giocatoriValidi.forEach((giocatore) => {
      // FIX: Check for a valid, non-empty team string.
      if (giocatore.team && typeof giocatore.team === 'string') {
        const squadraAssegnata = this.squadre.find(
          (s) => s.nome === `Squadra ${giocatore.team}`,
        );
        if (squadraAssegnata) {
          squadraAssegnata.membri.push(giocatore);
          squadraAssegnata.punteggioTotale += giocatore.score;
        } else {
          giocatoriDaMischiare.push(giocatore);
        }
      } else {
        giocatoriDaMischiare.push(giocatore);
      }
    });

    // 4. Controlla se qualche squadra ha più di 4 giocatori
    const squadreSovraccariche = this.squadre.filter(
      (s) => s.membri.length > 4,
    );
    if (squadreSovraccariche.length > 0) {
      const nomi = squadreSovraccariche.map((s) => s.nome).join(', ');
      alert(
        `Errore: Le seguenti squadre hanno più di 4 giocatori pre-assegnati: ${nomi}.`,
      );
      this.squadre = [];
      return;
    }

    // 5. Mescola i giocatori rimanenti (Fisher-Yates shuffle)
    for (let i = giocatoriDaMischiare.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [giocatoriDaMischiare[i], giocatoriDaMischiare[j]] = [
        giocatoriDaMischiare[j],
        giocatoriDaMischiare[i],
      ];
    }

    // 6. Distribuisci i giocatori mescolati negli slot rimanenti
    let giocatoreIndex = 0;
    for (let i = 0; i < numeroSquadre; i++) {
      const squadra = this.squadre[i];
      while (
        squadra.membri.length < 4 &&
        giocatoreIndex < giocatoriDaMischiare.length
      ) {
        const giocatore = giocatoriDaMischiare[giocatoreIndex++];
        squadra.membri.push(giocatore);
        squadra.punteggioTotale += giocatore.score;
      }
    }
  }
}
