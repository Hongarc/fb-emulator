
import Api, { Id } from '../src/api';
import {
  pMe, pFriend,
  init, final, each,
} from './user';

let me: Api;
let friend: Api;
let groupId: Id;

describe('Message group', () => {
  beforeAll(async () => {
    me = await pMe;
    friend = await pFriend;

    await init(me, friend);
  });

  afterAll(() => final(me));

  afterEach(() => {
    each(me, friend);
  });

  test('create message group', async () => {
    const name = 'My group';
    const response = await friend.createMsgGroup({
      name,
    }, me.id);
    groupId = response.threadId;
    expect(response).toMatchObject({
      name,
      participants: [{
        id: me.id,
      }, {
        id: friend.id,
      }],
    });
  });

  test('delete user in message group', (done) => {
    friend.removeParticipant(groupId, me.id);
    me.once('log_admin', (message) => {
      expect(message).toMatchObject({
        type: 'ParticipantLeftGroupThread',
        leftId: me.id,
        threadId: groupId,
      });
      done();
    });
  });

  test('add user in message group', (done) => {
    friend.addUserToThread(groupId, me.id);
    me.once('log_admin', (message) => {
      expect(message).toMatchObject({
        type: 'ParticipantsAddedToGroupThread',
        addedIds: [{ userFbId: me.id }],
        threadId: groupId,
      });
      done();
    });
  });

  test('delete message group', async () => {
    await friend.deleteThread(groupId);
    await me.deleteThread(groupId);
  });
});