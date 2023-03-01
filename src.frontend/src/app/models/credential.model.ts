export interface CredentialModel {
    id?:number;
    name:string;
    domain?:string;
    username?:string;
    password?:string;
    privateKey?:string;
    tags?:string;
    description?:string;
}