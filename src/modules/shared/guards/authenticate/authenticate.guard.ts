import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AdminService } from '../../services/admin/admin/admin.service';
import { UserService } from '../../services/create-user/create-user/create-user.service';

@Injectable()
export class AuthenticateGuard implements CanActivate {
  constructor(
    private userService: UserService,
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
        return await this.userService.verifyToken({token: token}).then(async r => {
            if (r.success) {
                // get user and attach it to the request
                await this.userService.getUser({phone: r.data.phone}).then(async userR => {
                    if (userR.success) {
                        // attach token object to request
                        req.headers['auth-token'] = {...r, id: userR.data._id};  
                        req.headers['user'] = userR.data; 
                    } else {
                        await this.adminService.getAdmin({phone: r.data.phone}).then(adminR => {
                            if (adminR.success) {
                                // attach token object to request
                                req.headers['auth-token'] = {...r, id: adminR.data._id};
                                req.headers['user'] = adminR.data;
                            } else {
                                return false;
                            }
                        })
                    }
                });
                return true;
            } else {
                return false;
            }
        });
    }
}
