# ![Software Plumbers](http://docs.softwareplumbers.com/common/img/SquareIdent-160.png) DB Plumbing (Map)

Map-based in-memory database.

## Tl;DR

```javascript
let store = new Store(Object, object=>object.key);

store.update({ key: 1, a: "hello", b: "sailor"});

value=store.find(1);
```

and value should eventually resolve to `{key:1, a:"hello", b:"sailor"}`

The store also supports remove, find by criteria, and remove by criteria operations. Criteria are created using the [abstract-query](https://npmjs.org/packages/abstract-query) library, and result sets are returned using the [iterator-plumbing](https://npmjs.org/packages/iterator-plumbing) asynchronous streams API. It also supports a bulked update operation based on the [typed-patch](https://npmjs.org/packages/typed-patch) library. 

This implementation is intended primarily as a test stub for applications using db-plumbing-mongo or db-plumbing-rest.

For the latest API documentation see [The Software Plumbers Site](http://docs.softwareplumbers.com/db-plumbing-map/master)
