package com.saree.config;

import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.DefaultTransactionStatus;

@Configuration
public class MongoConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);

    @Bean
    public MongoTransactionManager transactionManager(MongoDatabaseFactory dbFactory) {
        return new SmartMongoTransactionManager(dbFactory);
    }

    public static class SmartMongoTransactionManager extends MongoTransactionManager {
        private static final Logger logger = LoggerFactory.getLogger(SmartMongoTransactionManager.class);
        private Boolean replicaSetSupported = null;

        public SmartMongoTransactionManager(MongoDatabaseFactory dbFactory) {
            super(dbFactory);
        }

        public synchronized boolean isReplicaSetSupported() {
            if (replicaSetSupported != null) {
                return replicaSetSupported;
            }
            try {
                Document hello = getDatabaseFactory().getMongoDatabase().runCommand(new Document("hello", 1));
                replicaSetSupported = hello.containsKey("setName") || hello.containsKey("hosts");
                logger.info("MongoDB cluster hello check: setName={}, replicaSetSupported={}", hello.get("setName"), replicaSetSupported);
            } catch (Exception e) {
                try {
                    Document isMaster = getDatabaseFactory().getMongoDatabase().runCommand(new Document("isMaster", 1));
                    replicaSetSupported = isMaster.containsKey("setName") || isMaster.containsKey("hosts");
                } catch (Exception ex) {
                    logger.warn("Could not determine MongoDB cluster topology, defaulting replicaSetSupported to true", ex);
                    replicaSetSupported = true;
                }
            }
            return replicaSetSupported;
        }

        @Override
        protected void doBegin(Object transaction, TransactionDefinition definition) {
            if (!isReplicaSetSupported()) {
                logger.debug("Connected to standalone MongoDB instance; multi-document transaction skipped");
                return;
            }
            super.doBegin(transaction, definition);
        }

        @Override
        protected void doCommit(MongoTransactionManager.MongoTransactionObject txObject) throws Exception {
            if (!isReplicaSetSupported() || txObject.getSession() == null) {
                return;
            }
            super.doCommit(txObject);
        }

        @Override
        protected void doRollback(DefaultTransactionStatus status) {
            if (!isReplicaSetSupported()) {
                return;
            }
            super.doRollback(status);
        }

        @Override
        protected void doCleanupAfterCompletion(Object transaction) {
            if (!isReplicaSetSupported()) {
                return;
            }
            super.doCleanupAfterCompletion(transaction);
        }
    }
}
