/** @module db-plumbing-map
 *
 */
'use strict';

const debug = require('debug')('db-plumbing-map');
const { AsyncStream } = require('iterator-plumbing');
const { Query } = require('abstract-query');

/** Default comparison operation.
 *
 * @param key {Function} function that extracts a key value (number or string) from a stored object
 * @param a {Object} First object
 * @param b {Object} Second object
 * @returns {boolean} -1, 1, 0 depending on whether a < b, b < a, or a == b
 *
 */
function defaultComparator(key, a, b) {
    if (key(a) < key(b)) return -1;
    if (key(a) > key(b)) return 1;
    return 0;
}

/** Utility function used to inject log operations into promise chain
 *
 * @private
 * @param e value to log
 * @returns e
 */
function logValue(e) {
    debug('lv',e);
    return e[1];
}

/** Error type (used when find() cannot return)
*
*/
class DoesNotExist extends Error {

    /** Constructor
    *
    * @param key key for which an item cannot be found
    */
    constructor(key) { super(`${key} does not exist`); this.key = key; }
}

/** In-memory document store.
 *
 * Essentially just some utility functions wrapping an ES6 Map. Other implementations (db-plumbing-mongo etc) have the
 * same signature and should work as a drop-in replacement.
 */
class Store {

    /** Constructor.
    * 
    * Only the first parameter is mandatory. Default behavior is to look for an attribute uid in the object to 
    * use as the unique key, and assume uid can be compared with standard comparison operations (basically it must
    * be a string or a number).
    *
    *
    * @param type {Function} a constructor (perhaps a base class constructor) for elements in this store.
    * @param [key] {Function} a function that extracts a unique key from objects in this store
    * @param [comparator] {Function} a function that compares two objects in this store
    */ 
    constructor(type, key = e=>e.uid, comparator = (a,b) => defaultComparator(key,a,b)) {
        this.idMap = new Map();
        this.key = key;
        this.comparator = comparator;
        this.sorted = true;
        this.type = type;
    }

    /** Find an object by its unique key
    *
    * @param  key {string|number} Unique object identifier
    * @returns {Promise} A promise, either resovled with the object stored for the given key, or rejected with a DoesNotExist error.
    */
    find(key) { 
        debug('find', key);
        let val = this.idMap.get(key);
        return val === undefined ? Promise.reject(new DoesNotExist(key)) : Promise.resolve(val);
    }

    /** Get all objects in the store
    *
    * @returns {BaseAsyncStream} an asyncronous stream that will return all the stored items
    */
    get all() {
        debug('all');
        return AsyncStream.from(this.idMap).map(([k,v])=>v);
    }

    /** Find objects by query
    * 
    * @param query {Query} A query object
    * @param [parameters] {Object} Supplies parameters to the query
    * @returns {BaseAsyncStream} An async stream containing all elements for which the query predicate returns true for the given parameters
    */ 
    findAll(query, parameters = {})  { 
        debug('findAll', query, parameters);
        return this.all.filter(query.bind(parameters).predicate);
    }

    /** Update or add an object in the store.
    *
    * @param {Object} object to add or update.
    * @returns {Promise}                                                                                                            a resolved promise.
    */
    update(object) { 
        debug('Update',object);
        if (!this.idMap.has(object.uid)) this.sorted = false;
        this.idMap.set(object.uid, object); 
        return Promise.resolve(true);
    }

    /** Remove an object from the store.
    *
    * @param key {Object} unique identifier of object to remove.
    * @returns {Promise<boolean>} a promise that resolves to true if the object is removed, false otherwise.
    */
    remove(key)  { 
        if (! this.idMap.get(key) === undefined) {
            this.idMap.delete(key);
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }

    /** Remove multiple objects from the store
    *
    * @param query {Query} A query object
    * @param [parameters] {Object} Supplies parameters to the query
    * @param {Promise<boolean>} a promise that resolves to true if at least one item has been deleted.
    */ 
    removeAll(query, parameters) {
        return this.findAll(query, parameters)
            .then(items => { 
                if (items.length === 0) 
                    return false;
                else {
                    for (let item in items) this.idMap.delete(item.uid);
                    return true;
                }
            });
    }

    /** Execute multiple update operations on the store
    *
    * @param patch { Patch.Operation } Information to update in patch format. 
    * @see [Typed Patch](https://www.npmjs.com/package/typed-patch)
    * @returns {Promise<number>} a promise that resolves to the number of items updated.
    */
    bulk(patch) {
        debug('bulk', patch);
        debug('bulk - this.sorted', this.sorted);
        debug('bulk - before', this.idMap);
        this.idMap = patch.patch(this.idMap, { value: logValue, collectionElementType: this.type, sorted: this.sorted });
        this.sorted = true;
        debug('bulk - after', this.idMap);

        return Promise.resolve(patch.data.length);
    }
}

/** the public API of this module. */
module.exports = { Store, DoesNotExist };

