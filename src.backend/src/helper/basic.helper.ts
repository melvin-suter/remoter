import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';

export class BasicHelper {
    static hashPassword(plain:string):string {
        return bcrypt.hashSync(plain, 10);
    }

    static checkPassword(plain:string, hash:string):Boolean{
        return bcrypt.compareSync(plain, hash);
    }


    // Only works for already signed in requests
    static returnData(req: Request, res:Response, data:any,state: boolean = true, statusCode:number = 200) {
        let tokenData = <any>jwt.decode(<string>req.headers.authorization?.replace('Bearer ',''));
        delete tokenData?.iat;
        delete tokenData?.exp;
        const appSecret = <string>process.env.APP_KEY;
        let token = jwt.sign(tokenData, appSecret, { expiresIn: '60m'})
      
        res.status(200).json({
            'state': state,
            'token': token,
            'data': data

        });
    }
}