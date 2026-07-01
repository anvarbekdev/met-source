"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtConfig = void 0;
const getJwtConfig = (configService) => ({
    secret: configService.get('JWT_SECRET', 'fallback-secret'),
    signOptions: {
        expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
    },
});
exports.getJwtConfig = getJwtConfig;
//# sourceMappingURL=jwt.config.js.map