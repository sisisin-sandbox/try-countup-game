import * as readline from 'readline';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

type Player = 'A' | 'B';
interface State {
  count: number;
  playerCount: number;
  player: Player;
}
class Game {
  state$ = new BehaviorSubject<State>({
    count: 0,
    playerCount: 0,
    player: 'A',
  });
  gameEnd$ = new Subject<State>();
  subs = new Subscription();
  constructor() {
    this.subs.add(this.state$.subscribe(state => {
      if (state.count === 5) {
        this.gameEnd$.next(state);
        this.subs.unsubscribe();
      }
    }));
  }

  start() {
    this.state$.next(this.state$.getValue());
  }

  execAnswer(ans: 'a' | 'b') {
    const state = this.state$.getValue();
    if (ans === 'a') {
      state.count++;
      state.playerCount++;

      if (state.playerCount === 3) {
        state.player = state.player === 'A' ? 'B' : 'A';
        state.playerCount = 0;
      }
    } else if (ans === 'b') {
      state.player = state.player === 'A' ? 'B' : 'A';
      state.playerCount = 0;
    }
    console.log(state);
    this.state$.next(state);
  }
}

export function routine() {
  const game = new Game();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const subs = new Subscription();
    subs.add(game.state$.subscribe(state => {
      const q = (ans: string) => {
        if (ans !== 'a' && ans !== 'b') {
          rl.question('invalid input!\n\n' + state.player + '\'s turn!\na: +1, b: pass your turn\n', q);
          return;
        }
        game.execAnswer(ans);
      };

      rl.question(state.player + '\'s turn!\na: +1, b: pass your turn\n', q);
    }));

  subs.add(game.gameEnd$.subscribe(state => {
    console.log(`player ${state.player} win!`);
    subs.unsubscribe();
    rl.close();
  }));

  game.start();
}
