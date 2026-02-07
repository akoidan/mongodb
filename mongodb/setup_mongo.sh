#!/bin/bash

# Then reconfigure with container names

```bash
mongosh --host localhost:28018
```

Execute:
```mongosh
use admin

rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'localhost:28018', priority: 2 },
    { _id: 1, host: 'localhost:28019', priority: 1 },
    { _id: 2, host: 'localhost:28020', priority: 1 }
  ]
})

db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [{ role: 'root', db: 'admin' }]
})
```

