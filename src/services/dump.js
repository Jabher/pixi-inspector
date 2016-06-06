export default function dump(object, filterProps = ['children', 'parent'], depth = 1) {
    if (!object)
        return null;
    const formatted = {};
    Object.keys(object)
        .filter(prop => !prop.startsWith('_') && filterProps.indexOf(prop) === -1)
        .forEach((property) => {
            var value = object[property];
            var type = typeof value;
            switch (true) {
                case type === 'string':
                case type === 'number':
                case type === 'boolean':
                case value === 'null':
                    formatted[property] = value;
                    break;
                case type === 'object' && value.constructor === PIXI.Point && depth > 0:
                    const dumpResult = dump(value, filterProps, depth - 1);
                    const prefix = `${property}.`;
                    Object.keys(dumpResult)
                        .forEach(property =>
                            formatted[prefix + property] = dumpResult[property]);
                    break;
                default:
                    formatted[property] = '...' + type
            }
        });
    return formatted;
}