const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const {
  findUserByEmail,
  findUserByUsername,
  findUserByEmailOrUsername,
  createUser,
  incrementLoginCount,
} = require("../models/authModel");

async function registerUser({ displayName, username, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();
  const cleanedDisplayName = displayName.trim();

  const existingEmail = await findUserByEmail(normalizedEmail);
  if (existingEmail) {
    throw new Error("Email is already in use.");
  }

  const existingUsername = await findUserByUsername(normalizedUsername);
  if (existingUsername) {
    throw new Error("Username is already taken.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await createUser({
    displayName: cleanedDisplayName,
    username: normalizedUsername,
    email: normalizedEmail,
    passwordHash,
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
  });

  return { user, token };
}

async function loginUser({ identifier, password }) {
  const cleanedIdentifier = identifier.trim().toLowerCase();

  const user = await findUserByEmailOrUsername(cleanedIdentifier);
  if (!user) {
    throw new Error("Invalid credentials.");
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new Error("Invalid credentials.");
  }

  await incrementLoginCount(user.id);

  const token = generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
  });

  return {
    user: {
      id: user.id,
      display_name: user.display_name,
      username: user.username,
      email: user.email,
      theme_name: user.theme_name,
    },
    token,
  };
}

module.exports = {
  registerUser,
  loginUser,
};