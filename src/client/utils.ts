export function replaceArray<T>(array: T[], item: T, replacement: T): T[] {
    let index = array.indexOf(item)
    if (index < 0) {
        return array
    }
    return [
        ...array.slice(0, index),
        replacement,
        ...array.slice(index + 1)
    ]
}

export function replaceDictionary<T>(object: {[name:string]:T}, key: string, replacement: T): {[name:string]:T} {
    let newObject = Object.assign({}, object);
    newObject[key] = replacement
    return newObject;
}

export function replaceManyDictionary<T>(object: {[name:string]:T}, keyer: (t:T) => string, replacements: T[]): {[name:string]:T} {
    let newObject = Object.assign({}, object);
    replacements.forEach( t => newObject[keyer(t)] = t);
    return newObject;
}