import { ConnectionType } from "./connection-type.enum";
import { CredentialModel } from "./credential.model";

export interface ConnectionModel {
    id?:number;
    name:string;
    port?:string;
    description?:string;
    hostname:string;
    type:ConnectionType
    credentialID?:number;
    credential?:CredentialModel;
    tags?:string;
}
