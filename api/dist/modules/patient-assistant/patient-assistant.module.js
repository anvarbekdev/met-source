"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientAssistantModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const patient_assistant_controller_1 = require("./patient-assistant.controller");
const patient_assistant_service_1 = require("./patient-assistant.service");
const assistant_conversation_entity_1 = require("../dimed-assistant/entities/assistant-conversation.entity");
const appointment_entity_1 = require("../appointments/entities/appointment.entity");
const doctor_entity_1 = require("../doctors/entities/doctor.entity");
const patient_entity_1 = require("../patients/entities/patient.entity");
const ai_core_module_1 = require("../ai-core/ai-core.module");
const clinics_module_1 = require("../clinics/clinics.module");
const notifications_module_1 = require("../notifications/notifications.module");
let PatientAssistantModule = class PatientAssistantModule {
};
exports.PatientAssistantModule = PatientAssistantModule;
exports.PatientAssistantModule = PatientAssistantModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([assistant_conversation_entity_1.AssistantConversation, appointment_entity_1.Appointment, doctor_entity_1.Doctor, patient_entity_1.Patient]),
            ai_core_module_1.AiCoreModule,
            clinics_module_1.ClinicsModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [patient_assistant_controller_1.PatientAssistantController],
        providers: [patient_assistant_service_1.PatientAssistantService],
    })
], PatientAssistantModule);
//# sourceMappingURL=patient-assistant.module.js.map