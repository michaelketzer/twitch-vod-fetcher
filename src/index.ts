import { getObj, setObj } from './redis';

import api from 'twitch-api-v5';
import cfg from './config';
import fetch from 'node-fetch';

api.clientID = cfg.clientId;

interface Vods {
  [x: string]: {
    title: string;
    url: string;
    thumbnail: string;
  };
}

const key = 'twitch-vod-fetcher-data';

async function request(path: string, method: 'POST' | 'PATCH', data: object): Promise<void> {
  const response = await fetch(cfg.apiUrl + path + `?apiKey=${cfg.apiKey}`, {
    method,
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    console.error('Returned ' + response.status + ' from request ' + path + ' with data ' + data);
  }
}
async function createVod(title: string, url: string): Promise<void> {
  console.log('Creating new VOD ' + title + ' with URL ' + url);
  request('/video/createFromFetcher', 'POST', { title, source: url });
}
async function updateVod(title: string, url: string): Promise<void> {
  console.log('Updating VOD ' + title);
  request('/video/patchFromFetcher', 'PATCH', { title, source: url });
}

async function checkVideos(): Promise<void> {
  api.channels.videos({ channelID: '63202811', sort: 'time', broadcast_type: 'highlight' }, async (err, res) => {
    if (err) {
      console.error(err);
    } else {
      const knownVoDs = (await getObj<Vods>(key)) || {};

      for (const vod of res.videos) {
        if (knownVoDs.hasOwnProperty(vod._id)) {
          const data = knownVoDs[vod._id];
          if (data.thumbnail !== vod.preview.large || data.title !== vod.title) {
            await updateVod(vod.title, vod.url);
            data.thumbnail = vod.preview.large;
            data.title = vod.title;
          }
        } else if (!knownVoDs.hasOwnProperty(vod._id)) {
          await createVod(vod.title, vod.url);
          knownVoDs[vod._id] = {
            title: vod.title,
            url: vod.url,
            thumbnail: vod.preview.large,
          };
        }
      }

      await setObj(key, knownVoDs);
    }
  });
}

checkVideos();

setInterval(checkVideos, 300000);
