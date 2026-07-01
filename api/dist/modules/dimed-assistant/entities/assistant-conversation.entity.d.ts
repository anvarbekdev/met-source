import { User } from '../../users/entities/user.entity';
export declare enum AssistantModuleType {
    DIMED = "DIMED",
    PATIENT = "PATIENT"
}
export declare class AssistantConversation {
    id: string;
    userId: string;
    user: User;
    sessionId: string;
    moduleType: AssistantModuleType;
    messagesJson: object[];
    contextJson: object;
    createdAt: Date;
    updatedAt: Date;
}
