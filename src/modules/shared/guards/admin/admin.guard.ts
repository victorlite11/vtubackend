import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { env } from '../../environment/environment';
import { AdminService } from '../../services/admin/admin/admin.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private adminService: AdminService
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = <Request>(context.switchToHttp().getRequest())

    const token = req.headers['authorization']?.split(' ')[1];

    if(!token) {
        return false;
    } else {
        // verify provided token
        return this.verify(token, req)
    }
}

async verify(token: string, req: Request) : Promise<boolean> {

    // bypass validating stored token in db if the token provided is the ultimate access token
    if (token == env.ultimateAccessToken) {
        // attach token object to request
        req.headers['auth-token'] = env.ultimateAccessToken;

        return true;
    }

    let verifiedToken = await this.adminService.verifyToken({token: token})
    if (verifiedToken.success) {
 
        // get user and attach it to the request
        let admin = await this.adminService.getAdmin({phone: verifiedToken?.data.phone});

        if (!admin.success && token) {
            return false;
        }

        // attach token object to request
        req.headers['auth-token'] = {...verifiedToken, id: admin.data._id};
        req.headers['user'] = admin.data;

        return true;
    } else {
        return false;
    }
}
}
