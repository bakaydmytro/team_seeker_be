const asyncHandler = require("express-async-handler");
const { User, Role } = require("../../models");

const isAdmin = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Role, as: 'Roles' }]
          });
      
          if (!user) {
            return res.status(404).json({ error: "No users found" });
          }
      
          if (user.Roles.name !== "ADMIN") {
            return res.status(403).json({ error: "Access denied: not an admin" });
          }
      
          next();
      } catch (err) {
        console.error('Error in admin middleware:', err);
        return res.status(500).json({ error: 'Something went wrong' });
      }
});

module.exports = { isAdmin };
