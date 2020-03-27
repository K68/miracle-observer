# miracle-observer
Push-based Data &amp; Event management based on React Hooks and RxJS

## Install

```javascript
npm i miracle-observer
```
[https://www.npmjs.com/package/miracle-observer](https://www.npmjs.com/package/miracle-observer)

## Usage

```javascript
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

/**
 * 订阅方法
 * @param key           Event Key
 * @param cbGetState    Callback
 * @param matchType     SubscribeMatchType
 * @param period        time that has to pass before emiting new items (ms)
 * @param throttle      0 for throttleTime
 *                      1 for debounceTime
 * @param preprocessing data pre process
**/

const sub2 = subscribe('goodbye', (k, v, store) => {
  console.log(k, store[k]);
  console.log('sub2 result: ', v === store[k]);
  console.log(JSON.stringify(store));
}, SubscribeMatchType.ContainsNotify);

station.notify('hello_world', ': our future');
station.notify('bye', ': ContainsNotify');

setTimeout(() => {
  sub1.unsubscribe();
  sub2.unsubscribe();
  shutdown();
}, 1000);

```

### Use with React Hook

```javascript
import React, {useState} from 'react';
import {
  useMiracleObserver,
  useMiracleObserverHot,
  createNotifyStation,
  SubscribeMatchType,
} from 'miracle-observer';

const App: () => React$Node = () => {
  const [globalCount, setGlobalCount] = useState(0);

// bind every rerender, globalCount is fresh
  useMiracleObserverHot(
    'actionOne.actionTwo.actionThree',
    (key, value, store) => {
      console.log(key + value + globalCount);
      setCount(count + 1);
    },
    SubscribeMatchType.ContainsNotify,
  );

// bind once in Component Mount, globalCount will not change
  useMiracleObserver(
    'actionTwo',
    (key, value, store) => {
      console.log(key + value + globalCount);
      setGlobalCount(store.globalCount);
    },
    SubscribeMatchType.ExactMatch,
    2000,
    0,
  );

  ...
```

## Reference

https://github.com/ReactiveX/RxJS

https://reactjs.org/docs/hooks-effect.html

https://cn.rx.js.org/manual/index.html

https://cn.rx.js.org/class/es6/Observable.js~Observable.html

https://medium.com/@thomasburlesonIA/https-medium-com-thomasburlesonia-react-hooks-rxjs-facades-4e116330bbe1

https://www.jianshu.com/p/76901410645a

https://github.com/LeetCode-OpenSource/rxjs-hooks

https://github.com/LeetCode-OpenSource/rxjs-hooks

https://zhuanlan.zhihu.com/p/49408348

https://github.com/react-native-community/hooks