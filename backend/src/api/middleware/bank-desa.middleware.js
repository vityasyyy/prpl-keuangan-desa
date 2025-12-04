// src/api/middleware/bank-desa.middleware.js

// Roles allowed to view Buku Bank Desa list/details
const VIEW_ROLES = ["kepala_desa", "kaur_keuangan", "sekretaris_desa"];

// Roles allowed to create/update Buku Bank Desa entries (add/edit)
const EDIT_ROLES = ["kaur_keuangan", "kepala_desa", "sekretaris_desa"];

// Only kepala_desa may approve records (if approval workflow is added later)
const APPROVE_ROLES = ["kepala_desa"];

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
        error: `Forbidden: role '${role}' is not allowed to ${actionName} buku bank desa`,
      });
    }

    next();
  };
}

export const canViewBankDesa = checkRole(VIEW_ROLES, "view");
export const canEditBankDesa = checkRole(EDIT_ROLES, "edit");
export const canApproveBankDesa = checkRole(APPROVE_ROLES, "approve");
