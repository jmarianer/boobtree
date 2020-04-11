export class Game {
  current_round : number;
  players : { [user:string] : {
    socket : SocketIO.Socket;
    name : string;
  }};

  constructor() {
    this.players = {};
    this.current_round = 0;
  }
  add_player(name : string, socket : SocketIO.Socket) {
    this.players[name] = { name : name, socket : socket };
    socket.on('phrase', (phrase : string) => {
      this.add_phrase(name, phrase);
    });

    this.update_socket(name);
  }

  update_all_sockets() {
    for (let name of Object.getOwnPropertyNames(this.players)) {
      this.update_socket(name);
    }
  }
  update_socket(name : string) {
    let player = this.players[name];
    if (this.current_round == 0) {
      player.socket.emit('wait');
    } else if (this.current_round == 1) {
      player.socket.emit('start');
    }
  }

  start() {
    this.current_round = 1;
    this.update_all_sockets();
  }

  add_phrase(name : string, phrase : string) {
   /*
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
  */}
};
