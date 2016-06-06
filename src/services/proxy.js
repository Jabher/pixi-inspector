/**
 * A proxy for executing code in the inspectedWindow environment.
 *
 * Has convenience wrappers for console methods. `proxy.log('a example message')`
 */
class Proxy {

    /**
     * Proxy to console.log()
     * @param {String} message
     */
    log(message) {
        return this.apply('console', 'log', arguments);
    }

    /**
     * Proxy to console.warn()
     * @param {String} message
     */
    warn(message) {
        return this.apply('console', 'warn', arguments);
    }

    /**
     * Proxy to console.error()
     * @param {String} message
     */
    error(message) {
        return this.apply('console', 'error', arguments);
    }

    /**
     * @param {String} object
     * @param {method} method
     * @param {Array} [args]
     * @returns Promise
     */
    apply(object, method, args = []) {
        return this.eval(`${object}.${method}(${args.map(val => JSON.stringify(val)).join(',')})`);
    }

    /**
     * @param {Function} fn
     * @param {Object} constants
     * @returns Promise
     */
    evalFn(fn, constants = {}) {
        if (typeof fn === 'function')
            return this.evalFn(`(${fn.toString()}());`, constants);

        Object.keys(constants).forEach(key => fn.split(key).join(constants[key]));
        return this.eval(fn);
    }

    /**
     * @param {String} code
     * @returns Promise
     */
    eval(code) {
        return new Promise((resolve, reject) => {
            if (chrome.devtools) {
                chrome.devtools.inspectedWindow
                    .eval(code, (result, exceptionInfo) => {
                        if (exceptionInfo) {
                            if (exceptionInfo.isException) {
                                reject(exceptionInfo.value);
                            } else if (exceptionInfo.isError) {
                                if (exceptionInfo.description.match(/%s/) && exceptionInfo.details.length === 1) {
                                    proxy.warn(exceptionInfo.description.replace(/%s/, exceptionInfo.details[0]));
                                    reject(exceptionInfo.description);
                                }
                            }
                            reject(exceptionInfo);
                        } else {
                            resolve(result);
                        }
                    });
            } else {
                resolve(eval(code));
            }
        });
    }

    /**
     * @param {String} url
     */
    injectScript(url) {
        var SCRIPT_URL = url;
        /* make linters happy */
        if (chrome.extension) {
            url = chrome.extension.getURL(url);
        } else {
            url = 'http://localhost:8080/src/' + url;
        }
        
        return this.evalFn(() =>
                document.documentElement.appendChild(
                    Object.assign(
                        window.document.createElement('script'), {src: SCRIPT_URL})),
            {
                SCRIPT_URL: JSON.stringify(url)
            });
    }
}

export default new Proxy();