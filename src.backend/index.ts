import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';

import dotenv from 'dotenv';
import { AuthHelper } from './src/helper/auth.helper';
import { DatabaseService } from './src/services/database.service';
import bodyParser, { BodyParser, json } from 'body-parser';
import { BasicHelper } from './src/helper/basic.helper';
import fs from 'fs';
import { CredentialModel } from './src/models/credential.model';
import { connect } from 'http2';
import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import { GuacamoleService } from './src/services/guacamole.service';

dotenv.config();

const app: Express = express();
const port = process.env.SERVER_PORT;
const databasePath:string = process.env.DATABASE_PATH ? process.env.DATABASE_PATH : './data.db';
const appSecret = <string>process.env.APP_KEY;
const postgresConfig = {
  host: <string>process.env.POSTGRES_HOSTNAME,
  user: <string>process.env.POSTGRES_USER,
  password: <string>process.env.POSTGRES_PASSWORD,
  database: <string>process.env.POSTGRES_DATABASE,
  port: <number>(process.env.POSTGRES_PORT ? process.env.POSTGRES_PORT : 5432)
};

let guacamoleService = new GuacamoleService(postgresConfig);
let dbService = new DatabaseService(databasePath, guacamoleService);

let authHelper = new AuthHelper(dbService);


app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: appSecret
}));

app.use(cors({
  origin:'*'
}));

app.use(expressjwt({ secret: appSecret, algorithms: ['HS256']})
    .unless(
        { path: [
            '/api/token/sign'
        ]}
    ));

var jsonParser = bodyParser.json();
















app.post('/api/token/sign', jsonParser,(req, res) => {

  if(req.body.username && req.body.password){
    let dbUser = dbService.getUser(req.body.username.toLowerCase());

    if(dbUser && BasicHelper.checkPassword(req.body.password,dbUser.password)){
      let token = jwt.sign(dbUser, appSecret, { expiresIn: '60m'})
      res.status(200).json({"state": true,"token": token});
    } else {
      res.status(200).json({"state": false});
    }
  } else {
    res.status(422).json({"state": false});
  }
});
 














app.put('/api/credentials',jsonParser, (request: Request, response: Response) => {
  let id = dbService.createCredential(request.body);
  BasicHelper.returnData(request, response, { ...request.body, ...{id: id} });
});

app.get('/api/credentials',jsonParser, (request: Request, response: Response) => {
    BasicHelper.returnData(request, response, 
      dbService.getCredentials()
    );
});

app.patch('/api/credentials',jsonParser, (request: Request, response: Response) => {

  let updateData:{id:number,password:string,privateKey:string}[] = request.body;

  updateData.forEach( (upDat) => {
    dbService.saveCredential(upDat);
  });

  BasicHelper.returnData(request, response, { });
});

app.post('/api/credentials/:id',jsonParser, (request: Request, response: Response) => {
  dbService.saveCredential(request.body);
  BasicHelper.returnData(request, response, { ...request.body });
});

app.get('/api/credentials/:id',jsonParser, (request: Request, response: Response) => {
    BasicHelper.returnData(request, response, 
      dbService.getCredential((<number><unknown>request.params.id))
    );
});


app.get('/api/tags/connections',jsonParser, (request: Request, response: Response) => {
  BasicHelper.returnData(request, response, 
    dbService.getConnectionTags()
  );
});
app.get('/api/tags/credentials',jsonParser, (request: Request, response: Response) => {
  BasicHelper.returnData(request, response, 
    dbService.getCredentialTags()
  );
});

app.delete('/api/credentials/:id',jsonParser, (request: Request, response: Response) => {
  dbService.deleteCredential((<number><unknown>request.params.id))
  BasicHelper.returnData(request, response, {});
});





app.put('/api/connections',jsonParser, (request: Request, response: Response) => {
  let id = dbService.createConnection(request.body);
  BasicHelper.returnData(request, response, { ...request.body, ...{id: id} });
});

app.get('/api/connections',jsonParser, (request: Request, response: Response) => {
  BasicHelper.returnData(request, response, dbService.getConnections());

});

app.post('/api/connections/:id',jsonParser, (request: Request, response: Response) => {
  dbService.saveConnection(request.body);
  BasicHelper.returnData(request, response, { ...request.body });
});

app.get('/api/connections/:id',jsonParser, (request: Request, response: Response) => {
    BasicHelper.returnData(request, response, 
      dbService.getConnection((<number><unknown>request.params.id))
    );
});

app.get('/api/connections/:id/guacid',jsonParser, async (request: Request, response: Response) => {
    BasicHelper.returnData(request, response, 
      {id: await guacamoleService.getID((<number><unknown>request.params.id))}
    );
});


app.delete('/api/connections/:id',jsonParser, (request: Request, response: Response) => {
  dbService.deleteConnection((<number><unknown>request.params.id))
  BasicHelper.returnData(request, response, {});
});

app.get('/api/user',jsonParser, (request: Request, response: Response) => {
  let tokenData:any = jwt.decode(<string>request.headers.authorization?.replace('Bearer ',''));
  let user = dbService.getUserById(tokenData.id);
  if(user?.password){
    user.password = '';
  }

  BasicHelper.returnData(request, response, { ...user });
});

app.post('/api/user',jsonParser, (request: Request, response: Response) => {
  let tokenData:any = jwt.decode(<string>request.headers.authorization?.replace('Bearer ',''));
  dbService.updateUser({ id: tokenData.id, ...request.body});
  BasicHelper.returnData(request, response, { ...request.body });
});






app.listen(port);
