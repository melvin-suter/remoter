import { UserModel } from "../models/user.model";
import { DatabaseService } from "../services/database.service";
import { BasicHelper } from "./basic.helper";

export class AuthHelper {

    constructor(private db:DatabaseService){}

    authenticate(username:string, password: string) {
        let dbUser = this.db.getUser(username);
        if (!dbUser) return false;
        if(BasicHelper.checkPassword(password,dbUser.password)){
            return true;
        }
        return false;
    }

    restricted(request:any,response:any,next:any){
        if (request.session.user) {
            next();
        } else {
            // request.session.error = 'Access denied!';
            response.send({'state': 'error', 'error': 'not logged in'});
        }
    }
}