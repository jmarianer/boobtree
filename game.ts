export class Game {
  id : string;
  current_round : number;
  players : {
    socket : SocketIO.Socket;
    name : string;
    current_phrase? : string;
    latest_phrase? : string;
  }[];
  rounds_archive : string[][];
  players_by_name : { [user:string] : number };

  constructor(id: string) {
    this.id = id;
    this.players = [];
    this.players_by_name = {};
    this.current_round = 0;
  }

  add_player(name : string, socket : SocketIO.Socket) {
    let player_num : number;
    if (name in this.players_by_name) {
      player_num = this.players_by_name[name];
      this.players[player_num].socket = socket;
    } else {
      player_num = this.players_by_name[name] = this.players.length;
      this.players.push({ name : name, socket : socket });
    }
    socket.on('phrase', (phrase : string) => {
      this.add_phrase(player_num, phrase);
    });

    this.update_socket(player_num);
  }

  update_all_sockets() {
    for (let i = 0; i < this.players.length; i++) {
      this.update_socket(i);
    }
  }
  update_socket(i : number) {
    let player = this.players[i];
    if (this.current_round == 0) {
      player.socket.emit('wait');
    } else if (player.latest_phrase) {
      player.socket.emit('wait1');
    } else if (this.current_round == 1) {
      player.socket.emit('start');
    } else if (this.current_round % 2 == 0) {
      player.socket.emit('phrase', player.current_phrase);
    } else {
      player.socket.emit('drawing', player.current_phrase);
    }
  }

  start() {
    this.current_round = 1;
    this.update_all_sockets();
  }

  add_phrase(i : number, phrase : string) {
    this.players[i].latest_phrase = phrase;

    if (this.players.every((player) => player.latest_phrase)) {
      this.next_round();
      this.update_all_sockets();
    } else {
      this.update_socket(i);
    }
  }

  next_round() {
    this.current_round++;
    for (let i = 0; i < this.players.length; i++) {
      let i1 = (i + 1) % this.players.length;
      this.players[i1].current_phrase = this.players[i].latest_phrase;
      this.players[i].latest_phrase = undefined;
    }
  }
};
