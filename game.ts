import { Collection, ObjectID } from 'mongodb';

export class ArchiveElt {
  player_name : string;
  phrase_or_drawing : string;
};

export class Game {
  db : Collection;
  id : string;
  shortId : string;
  current_round : number;
  players : {
    socket : SocketIO.Socket;
    name : string;
    current_phrase? : string;
    latest_phrase? : string;
  }[];
  archive : ArchiveElt[][];
  players_by_name : { [user:string] : number };
  socket? : SocketIO.Socket;

  constructor(db: Collection, id: string, shortId: string) {
    this.db = db;
    this.id = id;
    this.shortId = shortId;
    this.players = [];
    this.players_by_name = {};
    this.current_round = 0;
  }

  set_socket(socket : SocketIO.Socket) {
    this.socket = socket;

    this.socket.emit('players', Object.keys(this.players_by_name));
  }

  add_player(name : string, socket : SocketIO.Socket) {
    let player_num : number;
    if (name in this.players_by_name) {
      player_num = this.players_by_name[name];
      this.players[player_num].socket = socket;
    } else {
      player_num = this.players_by_name[name] = this.players.length;
      this.players.push({ name : name, socket : socket });
      if (this.socket) {
        this.socket.emit('players', Object.keys(this.players_by_name));
      }
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
    } else if (this.current_round > this.players.length) {
      player.socket.emit('done');
    } else if (player.latest_phrase) {
      player.socket.emit('wait1');
    } else if (this.current_round == 1) {
      player.socket.emit('start', this.players.length);
    } else if (this.current_round % 2 == 0) {
      player.socket.emit('phrase', player.current_phrase, this.current_round, this.players.length);
    } else {
      player.socket.emit('drawing', player.current_phrase, this.current_round, this.players.length);
    }
  }

  start() {
    this.current_round = 1;
    this.archive = [];
    for (let _ of this.players) {
      this.archive.push([]);
    }
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
      let archive_no = (i - this.current_round + 2*this.players.length) % this.players.length;
      this.archive[archive_no].push({
        player_name: this.players[i].name,
        phrase_or_drawing: this.players[i].latest_phrase,
      });

      let i1 = (i + 1) % this.players.length;
      this.players[i1].current_phrase = this.players[i].latest_phrase;
      this.players[i].latest_phrase = undefined;
    }

    this.db.update({_id: new ObjectID(this.id)}, {$set: {archive: this.archive}});
  }
};
