const User = require("../../models").User;
const bcrypt = require("bcrypt");

const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // Extract user ID from URL
    const { username, email, birthday, password } = req.body; // Extract fields to update

    // Find the user by ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user fields
    const updatedUser = await user.update({
      username,
      email,
      birthday,
      password: hashedPassword,
    });

    return res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error in updateUser:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateUser };