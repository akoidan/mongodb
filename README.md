# Postgres
## Characteristics
- ROW based storage (stores data in rows)
- CAP: AC (Strong consistent. availability if Primary is reachable. On network partition connection returns errors)
- SQL, performant join
- ACID compliant (Atomicity, Consistency, Isolation, Durability)

## Replication
Master slave. Master can accept read, write. Each database endpoint should be hardcoded in the client. No automatic failover on the client side. Slaves can automatically sync from master and support read. Especially in CQRS (Command Query Responsibility Segregation) pattern (where reads are separate)
Really performant. 
Typically handled at average up to 200-500 connections. Can be setup more but then CPU context switching slows it down, since there's not layer in front that persist connections.

## Sharding
 - Doesn't support sharding. Sharding should be done at the application level manually.
 
## profiling
```sql
EXPLAIN Select * from ...
```

# Cassandra

## Characteristics
 - Wide column based storage (stores data in rows, BUT each rows has any amount of columns and rows are distributed)
 - CAP: AP (always available even when partition occurs. Not consistent, serves outdated data even if other nodes are not reachable or down)
 - CAP: Can be tuned to CP.!! Tunable consistency (each query can specify desired consistency. E.g. if you WRITE to database you can specify the flags: ONE(means available), QUARUM (majority), ALL)
 - NoSQL
 - Scalable
 - High Available
 - Fault Tolerant
 - Doesn't support joins

## Replication
Self healing
No single master. Every node is equal, uses gossip protocol, every node communicates with a few more nodes and decides on consistency.

## Sharding
Supports sharding out of the box. Uses [consistent hashing](https://en.wikipedia.org/wiki/Consistent_hashing). 


## Interesting facts
- Written by the same guy for Facebook who created DynamoDB. Also an alternative to Google BigQuery
- Writes goes to Commit log and then to MemTable. Request returns response. And asynchronounsly Memtable gets perioducally flushed. So data is not actually updated but appended. In order to know the current state you need to calculate it. But sometimes compaction process runs to merge that chunked data together 


# MongoDB

## Characteristics
- Stores data in documents (I can still consider row based if rows store complex data like objects and array with WiredTiger compressed documents BSON)
- Document
- Scalable
- High Available
- Fault Tolerant
- Support joins (join will have cortege times if no Index attached, but still work)

## Profiling

```mongosh
db.users.find().explain("executionStats")
```

## Replication
Self healing
Supported out of the box with replicaset. Automatically reelects primary Node. Automatically syncs. client driver specifies all nodes, if one node fail -automatically reconnects to another node w/o downtime. Only primary node support writes, but client driver resolves it automatically.

## Sharding
Supports sharding out of the box
