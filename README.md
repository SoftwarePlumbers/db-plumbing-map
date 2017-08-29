# ![Software Plumbers](http://docs.softwareplumbers.com/common/img/SquareIdent-160.png) DB Plumbing (Map)

Map-based in-memory database.

## Tl;DR

```javascript
let store = new Store(Object, object=>object.key);

store.update({ key: 1, a: "hello", b: "sailor"});

value=store.find(1);
```

and value should be `{key:1, a:"hello", b:"sailor"}`

The store supports remove, find by criteria, and remove by criteria operations. It also supports a bulked update operation based on the [typed-patch](https://npmjs.org/packages/typed-patch) library.

This implementation is intended primarily as a test stub for applications using db-plumbing-mongo or db-plumbing-rest.

For the latest API documentation see [The Software Plumbers Site](http://docs.softwareplumbers.com/db-plumbing-map/master)
