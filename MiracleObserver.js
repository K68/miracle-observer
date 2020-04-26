import {Observable, Subject} from 'rxjs';
import {map, filter, throttleTime, debounceTime} from 'rxjs/operators';

let globalSubscriber;
const publishSubject = new Subject();
const observable = new Observable(function(subscriber) {
  globalSubscriber = subscriber;
  return () => {
    globalSubscriber = undefined;
    subscriber.complete();
  };
});
const subscription = observable.subscribe(publishSubject);

export const SubscribeMatchType = {
  ExactMatch: 1, // 完全匹配
  // 订阅的消息名 内容长度大于 通知的消息名
  PrefixNotify: 2,
  SuffixNotify: 4,
  ContainsNotify: 8,
  // 通知的消息名 内容长度大于 订阅的消息名
  PrefixSubscri: 16,
  SuffixSubscri: 32,
  ContainsSubscri: 64,
};

/**
 * 订阅方法
 * @param key           Event Key
 * @param cbGetState    Callback
 * @param matchType     SubscribeMatchType
 * @param period        time that has to pass before emiting new items (ms)
 * @param throttle      0 for throttleTime
 *                      1 for debounceTime
 * @param preprocessing data pre process
 * @returns {Subscription}
 */
export function subscribe(
  key,
  cbGetState,
  matchType = 1,
  period = 0,
  throttle = 0,
  preprocessing,
) {
  const observer = {
    next: x => {
      // eslint-disable-next-line no-bitwise
      if ((x.allowTypes & matchType) === matchType) {
        cbGetState(x.key, x.value, GlobalStore);
      }
    },
    error: err => console.error('Observer got an error: ' + err),
    complete: () => console.debug('Observer got a complete notification'),
  };

  let pipeMatch;
  switch (matchType) {
    case SubscribeMatchType.ExactMatch:
      pipeMatch = filter(x => x.key === key);
      break;
    case SubscribeMatchType.PrefixNotify:
      pipeMatch = filter(x => key.startsWith(x.key));
      break;
    case SubscribeMatchType.SuffixNotify:
      pipeMatch = filter(x => key.endsWith(x.key));
      break;
    case SubscribeMatchType.ContainsNotify:
      pipeMatch = filter(x => key.indexOf(x.key) >= 0);
      break;
    case SubscribeMatchType.PrefixSubscri:
      pipeMatch = filter(x => x.key.startsWith(key));
      break;
    case SubscribeMatchType.SuffixSubscri:
      pipeMatch = filter(x => x.key.endsWith(key));
      break;
    case SubscribeMatchType.ContainsSubscri:
      pipeMatch = filter(x => x.key.indexOf(key) >= 0);
      break;
  }

  let pipeThrottle;
  if (period > 0) {
    if (throttle === 1) {
      pipeThrottle = debounceTime(period);
    } else {
      pipeThrottle = throttleTime(period);
    }
  }

  let pipeMap;
  if (preprocessing) {
    pipeMap = map(x => preprocessing(x));
  }

  const pipes = [pipeMatch, pipeThrottle, pipeMap].filter(i => i !== undefined);
  let _ps = publishSubject;
  if (pipes.length > 0) {
    _ps = publishSubject.pipe(...pipes);
  }

  return _ps.subscribe(observer);
}

let GlobalStore = {}; // initialState

export function initStore(initialState, aspect) {
  if (aspect) {
    GlobalStore[aspect] = initialState;
  } else {
    GlobalStore = initialState;
  }
}

export function getStore(aspect) {
  if (aspect) {
    return GlobalStore[aspect];
  } else {
    return GlobalStore;
  }
}

export function setInitialState(cb) {
  return cb(GlobalStore);
}

export function defaultCbSetState(key, value, globalStore) {
  globalStore[key] = value;
}

export function createNotifyStation(cbSetStateDft, allowTypesDft = 1) {
  return {
    notify: (key, value, cbSetState, allowTypes) => {
      if (cbSetState) {
        cbSetState(key, value, GlobalStore);
      } else if (cbSetStateDft) {
        cbSetStateDft(key, value, GlobalStore);
      }
      notify(key, value, allowTypes || allowTypesDft);
    },
  };
}

function notify(key, value, allowTypes = 1) {
  if (globalSubscriber) {
    globalSubscriber.next({
      key,
      value,
      allowTypes,
    });
  }
}

export function shutdown() {
  subscription.unsubscribe();
}
