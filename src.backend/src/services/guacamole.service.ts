import { BasicHelper } from "../helper/basic.helper";
import {Connection} from 'postgresql-client';
import { ConnectionModel } from "../models/connection.model";
import { ConnectionType } from "../models/connection-type.enum";

export class GuacamoleService {

  db:Connection;

    constructor(config:{host:string,user:string,password:string,database:string,port:number}){
      this.db = new Connection(config);
      this.db.connect();
    }

    async deleteConnection(conID:number) {
      let connectionID = -1;

      // Check if connection exists
      let result = await this.db.query(
          'SELECT * FROM guacamole_connection WHERE connection_name = $1',
          {params: [<string><unknown>conID]});
      let rows:any[] | undefined = result.rows;

      // Set ID or create new connection
      if(rows && rows!.length > 0){
        connectionID = rows[0]["connection_id"];
        await this.db.query("DELETE FROM guacamole_connection_parameter WHERE connection_id = $1", {params:[connectionID]});
        await this.db.query("DELETE FROM guacamole_connection WHERE connection_id = $1", {params:[connectionID]});
      }
    }


    async setConnection(connection:ConnectionModel) {
      let connectionID = -1;

      // Check if connection exists
      let result = await this.db.query(
          'SELECT * FROM guacamole_connection WHERE connection_name = $1',
          {params: [<string><unknown>connection.id]});
      let rows:any[] | undefined = result.rows;

      // Set ID or create new connection
      if(rows && rows!.length > 0){
        connectionID = rows[0]["connection_id"];
      } else {
        let result = await this.db.query(
          "INSET INTO guacamole_connection (connection_name, protocol) VALUES($1,$2) RETURNING connection_id",
          {params:[connection.id, ConnectionType[connection.type].toLowerCase()]}
        );
        connectionID = result.rows![0].connection_id
      }

      // Add parameters
      await this.setParameter(connectionID,"hostname",connection.hostname);
      
      if(connection.port){
        await this.setParameter(connectionID,"port",connection.port);
      }

      if(connection.credential?.privateKey){
        await this.setParameter(connectionID,"private-key",connection.credential.privateKey);
      }
      if(connection.credential?.password){
        await this.setParameter(connectionID,"password",connection.credential.password);
      }
      if(connection.credential?.username){
        await this.setParameter(connectionID,"username",connection.credential.username);
      }

      if(connection.type == ConnectionType.rdp){
        await this.setParameter(connectionID,"security","any");
        await this.setParameter(connectionID,"ignore-cert","true");
      }
    }

    async setParameter(conID:number, key:string, value:string){
      // Check if entry exists
      let result = await this.db.query(
        'SELECT * FROM guacamole_connection_parameter WHERE connection_id = $1 AND parameter_name = $2',
        {params: [<string><unknown>conID, key]});
      let rows:any[] | undefined = result.rows;
      
      if(rows && rows!.length > 0){ // update
        await this.db.query("UPDATE guacamole_connection_parameter SET parameter_value = $1",{params:[value]});
      } else {
        await this.db.query("INSERT INTO guacamole_connection_parameter (connection_id, parameter_name, parameter_value) VALUES($1,$2,$3)",{params:[conID,key,value]});
      }
    }


}

