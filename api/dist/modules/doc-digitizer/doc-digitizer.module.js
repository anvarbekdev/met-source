"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocDigitizerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const doc_digitizer_controller_1 = require("./doc-digitizer.controller");
const doc_digitizer_service_1 = require("./doc-digitizer.service");
const digitized_document_entity_1 = require("./entities/digitized-document.entity");
const ai_core_module_1 = require("../ai-core/ai-core.module");
const files_module_1 = require("../files/files.module");
let DocDigitizerModule = class DocDigitizerModule {
};
exports.DocDigitizerModule = DocDigitizerModule;
exports.DocDigitizerModule = DocDigitizerModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([digitized_document_entity_1.DigitizedDocument]), ai_core_module_1.AiCoreModule, files_module_1.FilesModule],
        controllers: [doc_digitizer_controller_1.DocDigitizerController],
        providers: [doc_digitizer_service_1.DocDigitizerService],
    })
], DocDigitizerModule);
//# sourceMappingURL=doc-digitizer.module.js.map