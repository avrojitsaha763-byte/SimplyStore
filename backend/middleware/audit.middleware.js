import AuditLog from '../models/auditLog.model.js';

export const auditLogger = async (req, res, next) => {
    // Only log state-changing requests
    if (req.method === 'GET') {
        return next();
    }

    // Capture response to log after request completes
    const originalSend = res.send;
    res.send = function (body) {
        res.send = originalSend;
        
        if (req.user && req.user.role === 'admin' && res.statusCode >= 200 && res.statusCode < 400) {
            try {
                const actionMapping = {
                    'POST': 'CREATE',
                    'PATCH': 'UPDATE',
                    'PUT': 'UPDATE',
                    'DELETE': 'DELETE'
                };
                
                const action = actionMapping[req.method] || req.method;
                const resource = req.originalUrl;
                
                // Redact sensitive info
                const details = { ...req.body };
                if (details.password) details.password = '[REDACTED]';
                
                AuditLog.create({
                    userId: req.user.id,
                    role: req.user.role,
                    action,
                    resource,
                    details,
                    ipAddress: req.ip || req.connection.remoteAddress
                }).catch(err => console.error("Audit log failed:", err));
            } catch (err) {
                console.error("Audit log error:", err);
            }
        }
        
        return res.send(body);
    };

    next();
};
