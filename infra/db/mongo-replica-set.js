/**
 * MongoDB Multi-AZ Synchronous Replication Quorum Setup (Workstream 2.3)
 * Enforces RPO = 0 (Zero Data Loss) across 3 Availability Zones:
 * eu-west-1a (Primary Candidate), eu-west-1b (Secondary), eu-west-1c (Secondary)
 */

rs.initiate({
  _id: "rs-erp-production",
  members: [
    {
      _id: 0,
      host: "mongo-az-1a.internal:27017",
      priority: 2,
      votes: 1,
      tags: { "datacenter": "eu-west-1a", "role": "primary-candidate" }
    },
    {
      _id: 1,
      host: "mongo-az-1b.internal:27017",
      priority: 1,
      votes: 1,
      tags: { "datacenter": "eu-west-1b", "role": "standby-replica" }
    },
    {
      _id: 2,
      host: "mongo-az-1c.internal:27017",
      priority: 1,
      votes: 1,
      tags: { "datacenter": "eu-west-1c", "role": "standby-replica" }
    }
  ],
  settings: {
    // Failover detection budget: 2000ms election timeout
    electionTimeoutMillis: 2000,
    catchUpTimeoutMillis: 10000,
    heartbeatIntervalMillis: 500,
    getLastErrorDefaults: {
      w: "majority",
      wtimeout: 2500,
      j: true
    }
  }
});

// Enforce default write concern to majority and journaled on the cluster
db.adminCommand({
  setDefaultRWConcern: 1,
  defaultWriteConcern: {
    w: "majority",
    j: true,
    wtimeout: 2500
  }
});

print("[MONGO REPLICA SET] Initialized 3-node multi-AZ quorum cluster with RPO=0 majority write concerns.");
