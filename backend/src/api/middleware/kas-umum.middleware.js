// src/api/middleware/kas-umum.middleware.js

const VIEW_ROLES = ["kepala_desa", "kaur_keuangan"];

const EDIT_ROLES = ["kaur_keuangan"];

function checkRole(allowedRoles, actionName) {
  return (req, res, next) => {
    // pastikan auth.middleware sudah jalan
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized: user not attached to request" });
    }

    const role = req.user.role;

    if (!role) {
      return res
        .status(403)
        .json({ error: `Forbidden: no role assigned for ${actionName}` });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        error: `Forbidden: role '${role}' is not allowed to ${actionName} buku kas umum`,
      });
    }

    next();
  };
}

export const canViewKasUmum = checkRole(VIEW_ROLES, "view");
export const canEditKasUmum = checkRole(EDIT_ROLES, "edit");
