export class Game {
  player_count : number;
  current_round : number;
  players : { [user:string] : {
    socket : SocketIO.Socket;
  }};
  rounds : string[][];
  player_names : string[];

  constructor(count : number) {
    this.player_count = count;
    this.players = {};
  }
  add_player(user : string, socket : SocketIO.Socket) {
    this.players[user] = { socket : socket};
    let all_names = Object.getOwnPropertyNames(this.players);
    if (all_names.length == this.player_count) {
      this.start();
    }
  }

  start() {
    this.current_round = 0;
    this.rounds = [[]];
    this.player_names = Object.getOwnPropertyNames(this.players);

    for (let player = 0; player < this.player_names.length; player++) {
      let name = this.player_names[player];
      let socket = this.players[name].socket;
      socket.emit('start', name, this.player_names);
      socket.on('phrase', (phrase : string) => {
        this.add_phrase(player, phrase);
      });
    }
  }

  add_phrase(player : number, phrase : string) {
    let round = this.rounds[this.current_round];
    round[player] = phrase;
    let players_done = round.filter((_) => true).length;
    if (players_done == this.player_count) {
      this.current_round++;
      this.rounds.push([]);
      for (let player = 0; player < this.player_names.length; player++) {
        let name = this.player_names[player];
        let socket = this.players[name].socket;
        socket.emit('phrase', round[(player + 1) % this.player_names.length]);
      }
    }
  }
};
