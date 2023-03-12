import { BasicHelper } from "../helper/basic.helper";
import {Connection, ConnectionConfiguration} from 'postgresql-client';
import { ConnectionModel } from "../models/connection.model";
import { ConnectionType } from "../models/connection-type.enum";

export class GuacamoleService {

  db:Connection;

    constructor(config:ConnectionConfiguration){
      this.db = new Connection(config);
      this.db.connect();
    }

    async deleteConnection(conID:number) {
      let connectionID = -1;

      // Check if connection exists
      let result = await this.db.query(
          'SELECT * FROM guacamole_connection WHERE connection_name = $1',
          {params: ["remoter-" + conID]});
      let rows:any[] | undefined = result.rows;

      // Set ID or create new connection
      if(rows && rows!.length > 0){
        connectionID = rows[0]["connection_id"];
        await this.db.query("DELETE FROM guacamole_connection_parameter WHERE connection_id = $1", {params:["remoter-" + connectionID]});
        await this.db.query("DELETE FROM guacamole_connection WHERE connection_id = $1", {params:["remoter-" + connectionID]});
      }
    }


    async setConnection(connection:ConnectionModel) {
      // Check if connection exists
      let connectionID = await this.getID(connection.id!);

      // Set ID or create new connection
      if(connectionID >= 0){
        await this.db.query(
          "UPDATE guacamole_connection SET connection_name = $2 , protocol = $3 WHERE connection_id = $1",
          {params:[connectionID,"remoter-" + connection.id, ConnectionType[connection.type].toLowerCase()]}
        );

      } else {
        await this.db.query(
          "INSERT INTO guacamole_connection (connection_id, connection_name, protocol) VALUES(DEFAULT, $1,$2)",
          {params:["remoter-" + connection.id, ConnectionType[connection.type].toLowerCase()]}
        );

        connectionID = await this.getID(connection.id!);
      }

      // Add parameters
      await this.setParameter(connectionID,"hostname",connection.hostname);
      
      if(connection.port){
        await this.setParameter(connectionID,"port",connection.port);
      } else {
        await this.deleteParameter(connectionID,"port");
      }

      if(connection.credential?.privateKey){
        await this.setParameter(connectionID,"private-key",connection.credential.privateKey);
      } else {
        await this.deleteParameter(connectionID,"private-key");
      }
      
      if(connection.credential?.username){
        await this.setParameter(connectionID,"username",connection.credential.username);
      } else {
        await this.deleteParameter(connectionID,"username");
      }

      if(connection.type == ConnectionType.rdp){
        await this.setParameter(connectionID,"security","any");
        await this.setParameter(connectionID,"ignore-cert","true");
      } else {
        await this.deleteParameter(connectionID,"security");
        await this.deleteParameter(connectionID,"ignore-cert");
      }
    }

    async setParameter(conID:number, key:string, value:string){
      // Check if entry exists
      let result = await this.db.query(
        'SELECT * FROM guacamole_connection_parameter WHERE connection_id = $1 AND parameter_name = $2',
        {params: [conID, key]});
      let rows:any[] | undefined = result.rows;
      
      if(rows && rows!.length > 0){ // update
        await this.db.query("UPDATE guacamole_connection_parameter SET parameter_value = $1 WHERE connection_id = $2 AND parameter_name = $3",{params:[value, conID, key]});
      } else {
        await this.db.query("INSERT INTO guacamole_connection_parameter (connection_id, parameter_name, parameter_value) VALUES($1,$2,$3)",{params:[conID,key,value]});
      }
    }

    async deleteParameter(conID:number, key:string){
      // Check if entry exists
      let result = await this.db.query(
        'SELECT * FROM guacamole_connection_parameter WHERE connection_id = $1 AND parameter_name = $2',
        {params: [conID, key]});
      let rows:any[] | undefined = result.rows;
      
      if(rows && rows!.length > 0){ // update
        await this.db.query("DELETE FROM guacamole_connection_parameter WHERE connection_id = $1 AND parameter_name = $2",{params:[conID, key]});
      }
    }

    async getID(conID:number):Promise<number>{
      let result = await this.db.query(
        'SELECT connection_id FROM guacamole_connection WHERE connection_name = $1',
        {params: ["remoter-" + conID]});
      let rows:any[] | undefined = result.rows;

      // Set ID or create new connection
      if(rows && rows!.length > 0){
        return rows[0][0];
      } else {
        return -1;
      }
    }


}


