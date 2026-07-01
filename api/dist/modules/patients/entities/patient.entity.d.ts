import { User } from '../../users/entities/user.entity';
export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}
export declare class Patient {
    id: string;
    userId: string;
    user: User;
    fullName: string;
    birthDate: Date;
    gender: Gender;
    phone: string;
    medicalHistoryJson: object;
    address: string;
    bloodType: string;
    allergies: string[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
