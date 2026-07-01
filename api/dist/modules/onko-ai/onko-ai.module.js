"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnkoAiModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const onko_ai_controller_1 = require("./onko-ai.controller");
const onko_ai_service_1 = require("./onko-ai.service");
const diagnosis_result_entity_1 = require("./entities/diagnosis-result.entity");
const ai_core_module_1 = require("../ai-core/ai-core.module");
const files_module_1 = require("../files/files.module");
const notifications_module_1 = require("../notifications/notifications.module");
let OnkoAiModule = class OnkoAiModule {
};
exports.OnkoAiModule = OnkoAiModule;
exports.OnkoAiModule = OnkoAiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([diagnosis_result_entity_1.DiagnosisResult]),
            ai_core_module_1.AiCoreModule,
            files_module_1.FilesModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [onko_ai_controller_1.OnkoAiController],
        providers: [onko_ai_service_1.OnkoAiService],
    })
], OnkoAiModule);
//# sourceMappingURL=onko-ai.module.js.map