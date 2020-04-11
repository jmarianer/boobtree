export class Game {
  current_round : number;
  players : { [user:string] : {
    socket : SocketIO.Socket;
    name : string;
    current_phrase? : string;
    latest_phrase? : string;
  }};

  constructor() {
    this.players = {};
    this.current_round = 0;
  }
  add_player(name : string, socket : SocketIO.Socket) {
    if (name in this.players) {
      this.players[name].socket = socket;
    } else {
      this.players[name] = { name : name, socket : socket };
    }
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
    } else if (this.current_round == 1 && !player.latest_phrase) {
      player.socket.emit('start');
    } else if (player.latest_phrase) {
      player.socket.emit('wait1');
    } else {
      player.socket.emit('phrase', player.current_phrase);
    }
  }

  start() {
    this.current_round = 1;
    this.update_all_sockets();
  }

  add_phrase(name : string, phrase : string) {
    this.players[name].latest_phrase = phrase;

    if (Object.getOwnPropertyNames(this.players).every((name) => this.players[name].latest_phrase)) {
      this.next_round();
      this.update_all_sockets();
    } else {
      this.update_socket(name);
    }
  }

  next_round() {
    this.current_round++;
    let names = Object.getOwnPropertyNames(this.players);
    for (let i = 0; i < names.length; i++) {
      let i1 = (i + 1) % names.length;
      this.players[names[i1]].current_phrase = this.players[names[i]].latest_phrase;
      this.players[names[i]].latest_phrase = undefined;
    }
  }
};
