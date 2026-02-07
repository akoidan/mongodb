### MongoDB Replicaset

Showcase of mongodb replicaset


```bash
#nvm install 
nvm use
yarn
# docker-compose down -v
docker-compose up
```


# 1st RS

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

## 2nd RS

```bash
mongosh --host localhost:28021
```

Execute:
```mongosh
use admin

rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'localhost:28021', priority: 2 },
    { _id: 1, host: 'localhost:28022', priority: 1 },
    { _id: 2, host: 'localhost:28023', priority: 1 }
  ]
})

db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [{ role: 'root', db: 'admin' }]
})
```

```bash

yarn start

# docker container ls
# docker kill anycontainerid_even_prime

curl --request POST \
  --url http://localhost:3000/users \
  --header 'Content-Type: application/json' \
  --data '{
	"username": "Andrew"
}'
```
