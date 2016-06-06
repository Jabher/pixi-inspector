import {Observable} from 'rx';
import proxy from './proxy';

let detectTimeout = 500;
/**
 * @var {Observable}
 * Looks for PIXI in the inspected page and emit the path (Ex. 'window.PIXI') when found.
 * Keeps checking when PIXI is not detected, but polling for PIXI slows down.
 */


export default Observable.defer(() =>
    proxy
        .evalFn(function () {
            function detect(window) {
                if (window.PIXI)  // global variable
                    return 'PIXI';
            }

            var detected = detect(window);
            if (detected)
                return 'window.' + detected;

            for (var i = 0; i < window.frames.length; i++) {
                detected = detect(window.frames[i]);
                if (detected) {
                    return `window.frames[${i}].${detected}`;
                }
            }

            return false;
        })
        .then(() => path === false ? Promise.reject('Unable to detect PIXI') : path))
    .retryWhen((errors) =>
        errors.delay((error) =>
            Observable.timer(detectTimeout < 5000 ? detectTimeout += 250 : detectTimeout)))
    .share();