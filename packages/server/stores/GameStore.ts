import { GameInfo, PlayerResult } from '@mafia/domain/types/game';
import { RoomVote, Vote } from '@mafia/domain/types/vote';

interface GameStoreType {
  [roomId: string]: GameInfo[];
}

interface DashBoard {
  mafia: number;
  citizen: number;
}

class GameStore {
  static instance: GameStoreType = {};

  constructor() {
    throw new Error('This is Singleton Class! Use getInstance()');
  }

  static getInstance() {
    return GameStore.instance;
  }

  static get(roomId: string) {
    return GameStore.instance[roomId];
  }

  static set(roomId: string, gameInfo: GameInfo[]) {
    GameStore.instance[roomId] = gameInfo;
  }

  static resetGame(roomId: string) {
    GameStore.instance[roomId] = [];
  }

  static initGame(roomId: string, gameInfoList: GameInfo[] = []) {
    GameStore.instance[roomId] = gameInfoList;
  }

  static resetVote(roomId: string) {
    const resetVoteGameInfo: GameInfo[] = GameStore.get(roomId).map((gameInfo) => ({
      ...gameInfo,
      voteFrom: new Set(),
    }));
    GameStore.set(roomId, resetVoteGameInfo);
  }

  static voteUser(roomId: string, voteInfo: Vote): boolean {
    const { to, from } = voteInfo;
    const votedUser = GameStore.get(roomId)?.find(({ userName }) => to === userName);
    const votingUser = GameStore.get(roomId)?.find(({ userName }) => from === userName);

    if (!votedUser || !votingUser) return false;
    GameStore.get(roomId).forEach(({ voteFrom }) => voteFrom.delete(from));
    votedUser.voteFrom.add(from);
    return true;
  }

  static getVoteInfos(roomId: string): RoomVote[] {
    return GameStore.instance[roomId].map(({ userName, profileImg, voteFrom }) => ({
      userName,
      profileImg,
      voteCount: voteFrom.size,
    }));
  }

  static getPlayerState(roomId: string, playerName: string) {
    const gameInfo = GameStore.get(roomId).find(({ userName }) => playerName === userName);
    if (!gameInfo) return gameInfo;
    return gameInfo.isDead;
  }

  static diePlayer(roomId: string, playerName: string) {
    const deadPlayer = GameStore.get(roomId).find(({ userName }) => userName === playerName);
    if (!deadPlayer) return;

    deadPlayer.isDead = true;
  }

  static getDashBoard(roomId: string): DashBoard {
    const mafia = GameStore.instance[roomId].filter(({ isDead, job }) => !isDead && job === 'mafia')
      .length;
    const citizen = GameStore.instance[roomId].filter(
      ({ isDead, job }) => !isDead && job === 'citizen',
    ).length;

    return { mafia, citizen };
  }

  static getGameResult(roomId: string, win: string): PlayerResult[] {
    return GameStore.instance[roomId].map(({ userName, job }) => ({
      userName,
      job,
      result: job === win,
    }));
  }
}

export default GameStore;
