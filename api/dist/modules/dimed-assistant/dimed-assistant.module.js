"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DimedAssistantModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const dimed_assistant_controller_1 = require("./dimed-assistant.controller");
const dimed_assistant_service_1 = require("./dimed-assistant.service");
const assistant_conversation_entity_1 = require("./entities/assistant-conversation.entity");
const ai_core_module_1 = require("../ai-core/ai-core.module");
const appointment_entity_1 = require("../appointments/entities/appointment.entity");
const patient_entity_1 = require("../patients/entities/patient.entity");
const diagnosis_result_entity_1 = require("../onko-ai/entities/diagnosis-result.entity");
let DimedAssistantModule = class DimedAssistantModule {
};
exports.DimedAssistantModule = DimedAssistantModule;
exports.DimedAssistantModule = DimedAssistantModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([assistant_conversation_entity_1.AssistantConversation, appointment_entity_1.Appointment, patient_entity_1.Patient, diagnosis_result_entity_1.DiagnosisResult]),
            ai_core_module_1.AiCoreModule,
        ],
        controllers: [dimed_assistant_controller_1.DimedAssistantController],
        providers: [dimed_assistant_service_1.DimedAssistantService],
    })
], DimedAssistantModule);
//# sourceMappingURL=dimed-assistant.module.js.map