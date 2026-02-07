# Postgres
## Characteristics
- Structured Query Language (SQL)
- USE when: Default choice on < 10k RPS.
- ROW based storage (stores data in rows)
- CAP: AC (Strong consistent. availability if Primary is reachable. On network partition connection returns errors)
- SQL, performant join
- ACID compliant (Atomicity, Consistency, Isolation, Durability)
- a lot of extension like full text search (tsvector with preindexing)
- geospacial support
- Typically handled at average up to 200-500 connections. Can be setup more but then CPU context switching slows it down, since there's not layer in front that persist connections. PgBouncer Is required to be set in front for connection pooler. Otherwise each connection = 1 process (not even thread)

## Replication
Master slave. Master can accept read, write. Each database endpoint should be hardcoded in the client. No automatic failover on the client side. Slaves can automatically sync from master and support read. Especially in CQRS (Command Query Responsibility Segregation) pattern (where reads are separate)
Really performant. 

If faul tolerant required Patroni / repmgr / pg_auto_failover can be used. + etcd / Consul / ZooKeeper for leader election. Client should connect to HAProxy / PgBouncer. Managed solutions:
 - GCP automatic failover for readonly replices. if master dies GGWP. Up to 10 read replicas. Doesnt support load balancing. Should be done manually with proxy or on a client side.
 - AWS Auroa - the only solution that reelects master. up to 15 replicas. Supports load balancing
 - AWS RDS Psql - up to 5 read replicas. Doesnt support load balancing. Should be done manually with proxy or on a client side.

## Sharding
 - Doesn't support sharding. Sharding should be done at the application level manually.
 
## profiling
```sql
EXPLAIN Select * from ...
```

# Cassandra

## Characteristics
 - Cassandra Query Language (CQL),
 - Wide column based storage (stores data in rows, BUT each rows has any amount of columns and rows are distributed)
 - Use when REALLY high throughtput (100k RPS writes). Write >> read. Predictable QUERIES from the POC (less flexible, dev-friendly). E.g. Activity feeds, messaging, event logging. Do not use when flex queries or consistency required.
 - Doesn't support transaction
 - required huge denormalization (comparing to mongo for example, since no joins)
 - CAP: AP (always available even when partition occurs. Not consistent, serves outdated data even if other nodes are not reachable or down) 
 - CAP: Can be tuned to CP.!! Tunable consistency (each query can specify desired consistency. E.g. if you WRITE to database you can specify the flags: ONE(means available), QUARUM (majority), ALL)
 - NoSQL
 - Scalable
 - High Available
 - Fault Tolerant
 - Doesn't support joins

## Replication
Self healing
No single master. So thus we get write conflicts. Thus no DATA integrity. Resolution - last write wins. Every node is equal, uses gossip protocol, every node communicates with a few more nodes and decides on consistency.

## Sharding
Supports sharding out of the box. Uses [consistent hashing](https://en.wikipedia.org/wiki/Consistent_hashing). 


## Interesting facts
- Written by the same guy for Facebook who created DynamoDB. Also an alternative to Google BigQuery
- Writes goes to Commit log and then to MemTable. Request returns response. And asynchronounsly Memtable gets perioducally flushed. So data is not actually updated but appended. In order to know the current state you need to calculate it. But sometimes compaction process runs to merge that chunked data together. This is why writes are fast (since append only, no random IO, no searching, locks/coordination). Since write append only, in order to read it uses bloom filter and indexes to skip states not related to calculate latest state) 

# MongoDB

## Characteristics
- MongoDB Query Language (MQL)
- Document 
- B tree indexs
- more developer friendly and flexible than cassandra.
- Eats memory like crazy if not limit it. Outperforms psql in cases where data fully fit in RAM. WiredTiger (mongos storage engine) consumes 50% of all system memory. But compresses data in Disk (so disk consumption is lower to PSQL)
- Stores data in documents (I can still consider row based if rows store complex data like objects and array with WiredTiger compressed documents BSON)
- Support ACID transactions BUT in replicaset only. 
- Scalable
- supports data validation indatabase. Same as database constraint but optional. Also it supports it only withing this document (table), e.g. impossible to validate if foregn key exists (should be done at app level)
- High Available
- Fault Tolerant
- Support joins (join will have cortege times if no Index attached, but still work)
- Typically handled up to 1k-50k connections. But heavy on RAM

## Profiling

```mongosh
db.users.find().explain("executionStats")
```
Benchmarks: https://info.enterprisedb.com/rs/069-ALB-339/images/PostgreSQL_MongoDB_Benchmark-WhitepaperFinal.pdf
Psql is a lot faster in most scenarios, even JSONB
## Replication
Self healing
Supported out of the box with replicaset. Automatically reelects primary Node. Automatically syncs. client driver specifies all nodes, if one node fail -automatically reconnects to another node w/o downtime. 
Only primary node support writes, but client driver resolves it automatically.
If all nodes go down, none would be able to go up (since it needs to connect to someone) So manually config is required


## Sharding
Supports sharding out of the box. Requires mongos server + 3 config serverers (mongod) + shardede replicas.
Sharding start at 64MB of data by default. 

# Redis
- Strings (set,get, incr, decr,append), List (lpush, rpush, lpop, rpop, lrange), Sets (add, delete, emember, union). HashMap (hset, hget, hincrby). Streams
- PUBSUB
- Transactions (multi, exec, discard, watch) + lua
- Lua Scripting
- Geo 
- Stream
- Cache
- Arythemtic operation
- TTL (automatically delete entry after time). Can act like a distributed lock






# Elastic search
 - tokenizes the string . E.g. 2 strings "I love cats", "I love dogs". WIll hashmap e.g. "I" -> 1st, 2nd row. "love" -> 1,2. Cats -> 1. Dogs ->2
 - has geospacial support
 - AWS provides opensearch 
 - support node query caching (lets say for 10k most search string it will cache result so they are blazingly fast)



# TIPS


## Indexes
1) DEFAULT: B-tree (be-tree, not binary). Tree where each node is an array of pointers to a node. most popular. Since it's ordered supprots operations like
 - select * from a where a.b = 30; 
 - select * from a where a.b > 30; 
2) INMEMORY: Hash index - usually used only in RAM store (like redis) since doesnt' support all operation and do not benefit from sequantial storage block
3) LOCATION: Geospatial Indexes
- Select * from location where lat > 100 and lat < 400 and long > 20 and long < 200
3a) geohasing redis
3b) quadtrees (split each square by quad, if number of items > k). Rarely uses
3c) Rtree - PostGis (psql)
4) STRING: Inverted index (for string, map each word in each string to a key , and value would be pointer to all strings in occurs)

HAPPY PATH

## CDC

change data captures - PostgreSQL (primary DB) → Debezium captures WAL → Kafka topic → Worker reads topic → Updates Elasticsearch

## Data approach
SQL - is entity driven
NOSQL - is query driven (storage is cheap, duplication is fine)

## How to pick database?

These are the qualities of the database that we need.
These databases satisfity it... Most time debates on SQL vs NoSQL doesnt matter. E.g. DynamoDB can have ACID properties

## DBs to learn

QUESTDB
MEMGRAPH
TIMESCALE 
COCKROACHDB
SCylla


## How to migrate from 1 DB set to another
1) Define Application requirements:  P99 Read < 30ms, Peak throughput 150'000 ops/s. Read/write ratio: 55/45
2) Define Infra requirements: Cloud provider, scalability, replication factor.
3) Create POC with test data to verify new DB support it
4) Dump data from the live server and validate concept on current data
5) Add first stage support, write from API to both new PROD DB and old PROD DB
6) Add migration script to migrate all data from from old db to new one
7) Switch to read to new DB, while still writting to both old DB and new DB. IN case of any errors to be able to fall back
8) Remove write to old db, and remove the old db as well 