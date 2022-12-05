import { Injectable } from '@nestjs/common';
import { ClientSession, FilterQuery, MongoClient, UpdateQuery } from 'mongodb';
import { Feedback } from 'src/modules/shared/interfaces/main.interfaces';

export class DbLookupData {
    collection : "cee" | "users" | "admins" | "notifications" | "transactions" | "verification_tokens" | "deposit-tokens" | "deposit-history";
    db : "classyempireenterprise" = "classyempireenterprise";
    message ?: string;
    uri ?: string;
  }

@Injectable()
export class DbMediatorService {
    private uri = "mongodb+srv://classyempireenterprise:classyempireenterprise@cluster0.rx23p.mongodb.net/geekas?retryWrites=true&w=majority";
    //private uri = "mongodb://127.0.0.1:27017";
  
    // CRUD Operations
    async fetchOne <T> (query: FilterQuery<T>, dbLookupData : DbLookupData): Promise<Feedback<T>> {
        try {
            // open connection
            return await this.openConnection(dbLookupData.uri).then(async client => {
                try {
                    const collection = await client.db(dbLookupData.db).collection(dbLookupData.collection);
  
                    // fetch single document from collection
                    let result = await collection.findOne(query);
                    if(result) {
                        return {
                            success : true,
                            data : result
                        }
                    } else {
                        return {
                            success : false,
                            msg : dbLookupData.message || "Fetch returned nothing",
                            data : result
                        }  
                    }
  
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }
  
    async fetchAll <T> (query: FilterQuery<T>, dbLookupData : DbLookupData): Promise<Feedback<T[]>> {
        try {
            // open connection
            return await this.openConnection(dbLookupData.uri).then(async client => {
                try {
                    const collection = await client.db(dbLookupData.db).collection(dbLookupData.collection);
  
                    // fetch documents from collection
                    let result = await collection.find(query).toArray();
                    if(result.length > 0) {
                        return {
                            success : true,
                            data : result
                        }
                    } else {
                        return {
                            success : false,
                            msg : dbLookupData.message || "Fetch returned nothing",
                            data : result
                        }
                    }
  
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }
  
    async insertOne <T> (doc : T, dbLookupData : DbLookupData) : Promise<Feedback<T>> {
        try {
            // open connection
            return await this.openConnection(dbLookupData.uri).then(async client => {
                try {
                    const collection = await client.db(dbLookupData.db).collection(dbLookupData.collection);
  
                    // insert doc in collection
                    await collection.insertOne(doc);
  
                    return {success : true, msg : dbLookupData.message || "Insertion Successful", data : doc}
                    
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }

    async replaceOne <T> (filter: FilterQuery<T>, newDoc : T, dbLookupData : DbLookupData): Promise<Feedback<T>> {
        try {
            // open connection
            return await this.openConnection(dbLookupData.uri).then(async client => {
                try {
                    const collection = client.db(dbLookupData.db).collection(dbLookupData.collection);
                                
                    // update document in collection
                    await collection.replaceOne(filter, newDoc)
                    return {success: true, msg: dbLookupData.message || "Document Replaced Successfully"};
  
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }
  
    async updateOne <T> (filter: FilterQuery<T>, update: UpdateQuery<T>, dbLookupData : DbLookupData): Promise<Feedback<T>> {
        try {
            // open connection
            return await this.openConnection(dbLookupData.uri).then(async client => {
                try {
                    const collection = client.db(dbLookupData.db).collection(dbLookupData.collection);
                                
                    // update document in collection
                    await collection.updateOne(filter, update)
                    return {success: true, msg: dbLookupData.message || "Document Updated Successfully"};
  
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }
  
    async deleteOne <T> (query: FilterQuery<T>, dbLookupData : DbLookupData) : Promise<Feedback<T>> {
        try {
            // open connection
            return await this.openConnection(dbLookupData.uri).then(async client => {
                try {
                    const collection = await client.db(dbLookupData.db).collection(dbLookupData.collection);
  
                    // delete document in collection
                    await collection.deleteOne(query);
  
                    return {success : true, msg : dbLookupData.message || "Deletion Successful"}
                } catch(e) {
                    console.error(e);
                } finally {
                    // close connection
                    await this.closeConnection(client);
                }
            })
        } catch(e) {
            console.error(e)
        }
    }
    
    private async openConnection(uri ?: string): Promise<MongoClient> {
        try {
            const client = new MongoClient(uri || this.uri, {
                compression: {compressors: [`zlib`]},
                useNewUrlParser: true, 
                useUnifiedTopology: true
            });
            return await client.connect();
        } catch(e) {
            console.error(e);
        }
    }
  
    private async closeConnection(client: MongoClient) {
        try {
            await client.close();
        } catch(e) {
            console.error(e);
        }
  
    }
  
    private async useSession(client: MongoClient): Promise<ClientSession> {
        let session = await client.startSession()
        return session;
    }
  
    private async endSession(session: ClientSession) {
        try {
            session.endSession();
        } catch(e) {
            console.error(e);
        }
    }
}
