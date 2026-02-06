### MongoDB Replicaset

Showcase of mongodb replicaset


```bash
#nvm install 
nvm use
yarn
# docker-compose down -v
docker-compose up
source ./setup_mongo.sh

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
