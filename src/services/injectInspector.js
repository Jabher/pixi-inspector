import {Observable} from "rx";
import detectPixi from "./detectPixi";
import proxy from "./proxy";

/**
 * @var {Observable}
 * - Wait for detected PIXI
 * - Inject inpector for the detected path
 * - Wait until injected script is executed
 */
export default detectPixi.flatMap((path) =>
    proxy.eval('typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__')
        .then((type) =>
            type !== 'object'
                ? proxy
                .eval(`window.__PIXI_INSPECTOR_GLOBAL_HOOK__ = "${path}"`)
                .then(() => proxy.injectScript('pixi.inspector.js'))
                : undefined
        ).then(() => path))
    .delay(1)
    .flatMap(path => Observable.defer(() => proxy.eval('typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__')
        .then((type) => {
            if (type !== 'object') {
                throw new Error('pixi.inspector.js not yet executed');
            }
        }))
        .retryWhen((errors) => errors.delay(25))
        .map(path))
    .share();
