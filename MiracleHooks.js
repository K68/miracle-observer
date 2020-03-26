import {useState, useEffect} from 'react';
import {
  subscribe,
  SubscribeMatchType,
  setInitialState,
} from './MiracleObserver.js';

export function useMiracleStore(initialFunc, updateFunc) {
  const [value, setValue] = useState(setInitialState(initialFunc));

  const initValue = () => {
    setValue(setInitialState(initialFunc));
  };

  const updateValue = (key, _value, store) => {
    setValue(updateFunc(key, _value, store));
  };

  return [value, setValue, initValue, updateValue];
}

/**
 *
 * @param key
 * @param cbGetState          // 注意：回调中值状态的引用不再变化
 * @param matchType
 * @param period
 * @param throttle
 * @param preprocessing
 * @returns {*[]}
 */
export function useMiracleObserver(
  key,
  cbGetState,
  matchType = SubscribeMatchType.ExactMatch,
  period = 0,
  throttle = 0,
  preprocessing = null,
) {
  const [staticTag] = useState(key);

  useEffect(() => {
    // console.debug('create subscribe in useEffect', key);
    const sub = subscribe(
      key,
      cbGetState,
      matchType,
      period,
      throttle,
      preprocessing,
    );
    return () => {
      // console.debug('unsubscribe in useEffect', key);
      sub.unsubscribe();
    };
  }, [staticTag]);

  return [];
}

export function useMiracleObserverHot(
  key,
  cbGetState,
  matchType = SubscribeMatchType.ExactMatch,
  preprocessing = null,
) {
  useEffect(() => {
    // console.debug('create subscribe in useEffect: hot ', key);
    const sub = subscribe(key, cbGetState, matchType, 0, 0, preprocessing);
    return () => {
      // console.debug('unsubscribe in useEffect: hot ', key);
      sub.unsubscribe();
    };
  }, [cbGetState, key, matchType, preprocessing]);

  return [];
}
