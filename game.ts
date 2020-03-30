export class Game {
  player_count : number;

  players : { [user:string] : SocketIO.Socket };

  constructor(count : number) {
    this.player_count = count;
    this.players = {};
  }
  add_player(user : string, socket : SocketIO.Socket) {
    this.players[user] = socket;
    let all_names = Object.getOwnPropertyNames(this.players);
    console.log(all_names);
    if (all_names.length == this.player_count) {
      console.log('Starting game with players ' + all_names);
      this.start();
    }
  }

  start() {
    let all_names = Object.getOwnPropertyNames(this.players);
    for (let name of all_names) {
      this.players[name].emit('start', all_names);
    }
  }
};
