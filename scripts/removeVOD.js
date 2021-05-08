const redis = require('redis');
const yargs = require('yargs');

const client = redis.createClient();


const argv = yargs
  .command('ids', 'The VOD ids to be removed', {
    year: {
      description: 'The VOD ids to be removed',
      alias: 'i',
      type: 'string',
    }
  })
  .help()
  .demandOption(['ids'], 'Please define a vod ids with -i or -ids')
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

    vodIds.forEach((id) => {
      if (!data[id]) {
        console.log('VOD id is unknown');
      } else {
        delete data[id]
      }
    });
    client.set(key, JSON.stringify(data), (err) => {
      client.end(false);
    });
  });
}

removeVOD(argv.ids.split(','));