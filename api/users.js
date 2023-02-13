const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {
  getUserByUsername,
  getUser,
  getPublicRoutinesByUser,
  createUser,
} = require("../db");
const { JWT_SECRET } = process.env;

// POST /api/users/login

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      next({
        name: "UserDoesNotExist",
        message: "User does not exist",
      });
    }


    const user = await getUser({ username, password });

    if (user) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET
      );
      res.send({ message: "you're logged in!", token, user });
    } else {
      //
      next({
        name: "Invalid User",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// POST /api/users/register
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  const existingUser = await getUserByUsername(username);

  try {
    if (existingUser) {
      next({
        name: "DuplicateUsername",
        message: `User ${username} is already taken.`,
      });
    } else if (password.length < 8) {
      next({
        name: "PasswordTooShort",
        message: "Password Too Short!",
      });
    } else {
      const newUser = await createUser({ username, password });
      const token = jwt.sign(
        { id: newUser.id, username: newUser.username },
        JWT_SECRET
      );
      res.send({
        message: "you have successfully been registered!",
        token,
        user: newUser,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET /api/users/me
router.get("/me", async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).send({
        name: "NotLoggedIn",
        message: "You must be logged in to perform this action",
        error: "401",
      });
    } else {
      res.json(req.user);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
});

// GET /api/users/:username/routines
router.get("/:username/routines", async (req, res, next) => {
  const { username } = req.params;
  try {
    const routines = await getPublicRoutinesByUser({ username });
    res.send(routines);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
