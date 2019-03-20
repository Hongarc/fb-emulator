import Api, { Arg, Form } from '../Api';

export default function (this: Api, threadId: Arg, ...userIds: Arg[]): Form {
  const participants = userIds.map((userId: Arg) => `fbid:${userId}`);
  const oti = Api.genOTI();
  return this.send({
    action_type: 'ma-type:log-message',
    timestamp: Date.now(),
    source: 'source:chat:web',
    log_message_type: 'log:subscribe',
    offline_threading_id: oti,
    message_id: oti,
    thread_fbid: threadId,
    log_message_data: {
      added_participants: participants,
    },
  });
}
