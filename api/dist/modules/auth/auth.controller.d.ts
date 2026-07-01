import { Response, Request } from 'express';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
export declare class AuthController {
    private readonly authService;
    private patientRepo;
    constructor(authService: AuthService, patientRepo: Repository<Patient>);
    register(dto: RegisterDto, res: Response): Promise<{
        success: boolean;
        user: Partial<User>;
        accessToken: any;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        success: boolean;
        user: Partial<User>;
        accessToken: any;
    }>;
    refresh(req: Request, res: Response): Promise<{
        success: boolean;
        accessToken: string;
    }>;
    logout(user: User, res: Response): Promise<{
        success: boolean;
    }>;
    getMe(user: User): Promise<any>;
    private setCookies;
}
