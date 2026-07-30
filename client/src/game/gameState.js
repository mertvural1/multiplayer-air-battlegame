export class GameState {
  selfId = null;
  players = new Map();
  serverTime = 0;

  setReady({ self }) { this.selfId = self.id; this.players.set(self.id, self); }
  setPlayers(players) { players.forEach((player) => this.players.set(player.id, player)); }
  removePlayer(id) { this.players.delete(id); }

  applySnapshot(snapshot) {
    this.serverTime = snapshot.serverTime;
    this.players = new Map(snapshot.players.map((player) => [player.id, player]));
  }

  get self() { return this.players.get(this.selfId); }
}
