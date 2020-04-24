import {initStore, subscribe, createNotifyStation, SubscribeMatchType, shutdown} from "./MiracleObserver";
import axios from 'axios';

// init store all in one file or multifiles
initStore({
  theme: 'night',
  language: 'zh'
});

initStore({
  userName: 'K68',
  role: 'admin'
}, 'account');

initStore({
  react: '16',
  rxjs: '6'
}, 'dependencies');

// create notify instance, you can have multi stations in anywhere
const station = createNotifyStation((k, v, store) => {
  // example
  store[k] = v;
}, SubscribeMatchType.ExactMatch | SubscribeMatchType.ContainsNotify);

const sub1 = subscribe('hello_world', (k, v, store) => {
  console.log(k, store[k]);
  console.log('sub1 result: ', v === store[k]);
});

const sub2 = subscribe('goodbye', (k, v, store) => {
  console.log(k, store[k]);
  console.log('sub2 result: ', v === store[k]);
  console.log(JSON.stringify(store));
}, SubscribeMatchType.ContainsNotify);

station.notify('hello_world', ': our future');
station.notify('bye', ': ContainsNotify');

axios.get('https://www.so.com')
  .then((response) => {
    station.notify('hello_world', response.data);

  }).catch((error) => {
    console.log(error.toJSON());
  });

setTimeout(() => {
  sub1.unsubscribe();
  sub2.unsubscribe();
  shutdown();
}, 10000);

