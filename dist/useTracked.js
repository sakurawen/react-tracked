"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTracked = void 0;

var _react = require("react");

var _TrackedProvider = require("./TrackedProvider");

var _utils = require("./utils");

var _deepProxy = require("./deepProxy");

var useTracked = function useTracked() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _opts$customContext = opts.customContext,
      customContext = _opts$customContext === void 0 ? _TrackedProvider.defaultContext : _opts$customContext;
  var forceUpdate = (0, _utils.useForceUpdate)();

  var _useContext = (0, _react.useContext)(customContext),
      state = _useContext.state,
      dispatch = _useContext.dispatch,
      subscribe = _useContext.subscribe;

  var affected = new WeakMap();
  var lastTracked = (0, _react.useRef)(null);
  (0, _utils.useIsomorphicLayoutEffect)(function () {
    lastTracked.current = {
      state: state,
      affected: affected,
      cache: new WeakMap(),

      /* eslint-disable no-nested-ternary, indent, @typescript-eslint/indent */
      assumeChangedIfNotAffected: opts.unstable_forceUpdateForStateChange ? true : opts.unstable_ignoreIntermediateObjectUsage ? false :
      /* default */
      null
      /* eslint-enable no-nested-ternary, indent, @typescript-eslint/indent */

    };
  });
  (0, _react.useEffect)(function () {
    var callback = function callback(nextState) {
      var changed = (0, _deepProxy.isDeepChanged)(lastTracked.current.state, nextState, lastTracked.current.affected, lastTracked.current.cache, lastTracked.current.assumeChangedIfNotAffected);

      if (changed) {
        lastTracked.current.state = nextState;
        forceUpdate();
      }
    }; // run once in case the state is already changed


    callback();
    var unsubscribe = subscribe(callback);
    return unsubscribe;
  }, [forceUpdate, subscribe]);
  var proxyCache = (0, _react.useRef)(new WeakMap()); // per-hook proxyCache

  var proxied = (0, _deepProxy.createDeepProxy)(state, affected, proxyCache.current);
  return (0, _react.useMemo)(function () {
    return [proxied, dispatch];
  }, [proxied, dispatch]);
};

exports.useTracked = useTracked;