import spacetimedb from './schema';

export default spacetimedb;

export const onConnect = spacetimedb.clientConnected(_ctx => {});
export const onDisconnect = spacetimedb.clientDisconnected(_ctx => {});
