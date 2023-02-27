import DatabaseConstructor,{ Database } from "better-sqlite3"
import { BasicHelper } from "../helper/basic.helper";
import { UserModel } from "../models/user.model";
import fs from 'fs';
import { CredentialModel } from "../models/credential.model";
import { ConnectionModel } from "../models/connection.model";

export class DatabaseService {

    private db:Database;

    constructor(){
        this.db = new DatabaseConstructor('./data.db');
        
        this.migrate();
    }



    /*******************
     *    Migrations
     *******************/


    migrate(){

      // Create Migrations Table
      this.db.exec("CREATE TABLE IF NOT EXISTS migrations (migration TEXT)");

      // Migration Create User Table
      this.runMigration("2023-02-24_create_users",()=>{
        this.db.exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL)");
        this.createUser({username: "admin", password: "admin"});
      });

      // Migration Create credentials Table
      this.runMigration("2023-02-24_create_credentials",()=>{
        this.db.exec("CREATE TABLE IF NOT EXISTS credentials (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, username TEXT, password TEXT, privateKey TEXT, description TEXT)");        
      });

      // Migration Create Connections Table
      this.runMigration("2023-02-24_create_connections",()=>{
        this.db.exec("CREATE TABLE IF NOT EXISTS connections (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, hostname TEXT, type INT NOT NULL, credentialID INT)");
      });

      // migration add domain to credentials
      this.runMigration("2023-02-26_add_domain",()=>{
        this.db.exec("ALTER TABLE credentials ADD domain TEXT;");
      });

      // migration add port to connections
      this.runMigration("2023-02-26_add_port",()=>{
        this.db.exec("ALTER TABLE connections ADD port TEXT;");
      });

      // migration add tags to connections
      this.runMigration("2023-02-26_add_tags",()=>{
        this.db.exec("ALTER TABLE connections ADD tags TEXT;");
      });
      
    }
    
    checkMigration(migration:string):boolean {
      let query = this.db.prepare("SELECT * FROM migrations WHERE migration = :migration");
        return query.all({migration: migration}).length > 0;
    }

    runMigration(migration:string,queryFunction:Function){
      if(!this.checkMigration(migration)){
        console.log("running migration " + migration)
        queryFunction();
        let query = this.db.prepare("INSERT INTO migrations (migration) VALUES (:migration)");
        query.run({migration:migration});
      }
      
    }



    /*******************
     *    Functions
     *******************/


    insert(table:string, data:any):number|bigint{
      let columns:string[] = Object.keys(data);

      let sql = "INSERT INTO " + table + " (";
      sql += columns.join(",");
      sql += ") VALUES(:" + columns.join(",:");
      sql += ")";

      let query = this.db.prepare(sql);
      let res = query.run(data);
      return res.lastInsertRowid;
    }


    update(table:string, data:any[]){
      if(data.length == 0){return;}

      data.forEach((item, i) => {
        let columns:string[] = Object.keys(item);

        let sql = "UPDATE " + table + " SET ";

        columns.forEach((col:string,i) => {
          if(col == "id"){ return; }

          sql += col + " = :" + col;
          if(i < columns.length - 1){
            sql += ", "
          }
        });
        sql += " WHERE id = :id";


        let query = this.db.prepare(sql);
        query.run(item);
      });
    }

    delete(table:string, id:number){
      let sql = "DELETE FROM " + table + " WHERE id = :id";
      let query = this.db.prepare(sql);
      query.run({id:id});
    }


    /*******************
     *    Users
     *******************/

    getUser(username:string):UserModel|null{
        let query = this.db.prepare("SELECT * FROM users WHERE username = :username");
        let user = query.get({username: username});
        return user;
    }

    getUserById(id:number):UserModel|null{
        let query = this.db.prepare("SELECT * FROM users WHERE id = :id");
        let user = query.get({id: id});
        return user;
    }

    createUser(user:UserModel){
      this.insert("users", {
        "username": user.username,
        "password": BasicHelper.hashPassword(user.password)
      });
    }

    updateUser(user:any){
      let dbUser = this.getUserById(user.id);

      if(dbUser == null){
        return;
      }

      if(user.password.length > 0){
        this.update("users", [{
          "id": dbUser.id,
          "username": user.username,
          "password": BasicHelper.hashPassword(user.password)
        }]);
      } else {
        this.update("users", [{
          "id": dbUser.id,
          "username": user.username
        }]);
      }
    }



    /*******************
     *    Credentials
     *******************/

    createCredential(credential:CredentialModel){
      return this.insert("credentials", credential);
    }

    saveCredential(credential:CredentialModel|{id:number,password:string,privateKey:string}){
      return this.update("credentials", [credential]);
    }

    deleteCredential(id:number){
      if(id >= 1){
        this.delete("credentials", id);
      }
    }

    getCredential(id:number):CredentialModel{
      let query = this.db.prepare("SELECT * FROM credentials WHERE id = :id");
      return query.get({id:id});
    }

    getCredentials():CredentialModel[]{
      let query = this.db.prepare("SELECT * FROM credentials");
      return query.all();
    }

    /*******************
     *    Connections
     *******************/

    createConnection(connection:ConnectionModel){
      if(connection.credentialID == null && connection.credential?.id != null){
        connection.credentialID = connection.credential.id;
      }
      Reflect.deleteProperty(connection,"credential")
      connection.credentialID = connection.credentialID ?? null;

      return this.insert("connections", connection);
    }

    saveConnection(connection:ConnectionModel){
      if(connection.credentialID == null && connection.credential?.id != null){
        connection.credentialID = connection.credential.id;
      }
      Reflect.deleteProperty(connection,"credential")
      connection.credentialID = connection.credentialID ?? null;

      return this.update("connections", [connection]);
    }

    deleteConnection(id:number){
      if(id >= 1){
        this.delete("connections", id);
      }
    }


    getConnection(id:number):ConnectionModel{
      let connection:ConnectionModel;
      let query = this.db.prepare("SELECT * FROM connections WHERE id = :id");
      connection = query.get({id:id});
      connection.credential = this.getCredential(connection.credentialID!);
      return connection;
    }


    getConnections():ConnectionModel[]{
      let connections:ConnectionModel[] = [];
      let query = this.db.prepare("SELECT * FROM connections");
      query.all().forEach((row)=>{
        connections.push({...row , ...{credential: this.getCredential(row.credentialID)} });
      });
      return connections;
    }


    getTags():string[]{
      let tags:string[] = [];
      let query = this.db.prepare("SELECT tags FROM connections");
      query.all().forEach((row)=>{
        tags.push(row["tags"]);
      });
      return tags;
    }
}

