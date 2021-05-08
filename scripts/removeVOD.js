const redis = require('redis');
const yargs = require('yargs');

const client = redis.createClient();


const argv = yargs
  .command('ids', 'The VOD id to be removed', {
    year: {
      description: 'The VOD id to be removed',
      alias: 'i',
      type: 'number',
    }
  })
  .help()
  .demandOption(['id'], 'Please define a vod id with -i or -id')
  .alias('ids', 'i')
  .alias('help', 'h')
  .argv;

client.on('connect', () => {
  console.info('🗄️ Redis Object Storage registered');
});
client.on('error', (error) => {
  console.info('🗄️ Failed to connect to redis:', error);
});


const key = 'twitch-vod-fetcher-data';

function removeVOD(vodIds) {
  client.get(key, (err, reply) => {
    if (err) {
      console.error(err);
      return;
    }

    const data = JSON.parse(reply) || {};

    if (!data[vodId]) {
      console.log('VOD id is unknown');
      client.end(false);
      return;
    } else {
      vodIds.forEach((id) => delete data[id]);
      client.set(key, JSON.stringify(data), (err) => {
        client.end(false);
      });
    }
  });
}

removeVOD(argv.ids.split(','));