const express = require("express");
const {
  getAllPublicRoutines,
  createRoutine,
  etRoutineById,
  updateRoutine,
  destroyRoutine,
  getRoutineActivitiesByRoutine,
  addActivityToRoutine,
} = require("../db");
const requireUser = require("./utils");
const router = express.Router();

// GET /api/routines
router.get("/", async (req, res, next) => {
  try {
    const allPublicRoutines = await getAllPublicRoutines();
    res.send(allPublicRoutines);
  } catch (error) {
    next(error);
  }
});

// POST /api/routines
router.post("/", requireUser, async (req, res, next) => {
  const { name, goal, isPublic } = req.body;
  const creatorId = req.user.id;

  try {
    const newRoutine = await createRoutine({ name, goal, isPublic, creatorId });
    res.send(newRoutine);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/routines/:routineId
router.patch("/:routineId", requireUser, async (req, res, next) => {
  const { name, goal, isPublic } = req.body;
  const creatorId = req.user.id;
  const { routineId } = req.params;

  try {
    const routineById = await getRoutineById(routineId);

    if (routineById.creatorId !== creatorId) {
      res.status(403).send({
        message: `User ${req.user.username} is not allowed to update ${routineById.name}`,
        name: "UnauthorizedUpdate",
        error: "403",
      });
    } else {
      const routine = await updateRoutine({
        name,
        goal,
        isPublic,
        id: routineId,
      });
      res.send(routine);
    }

    res.send(routineById);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routines/:routineId
router.delete("/:routineId", requireUser, async (req, res, next) => {
  const creatorId = req.user.id;
  const { routineId } = req.params;

  try {
    const routineById = await getRoutineById(routineId);

    if (routineById.creatorId !== creatorId) {
      res.status(403).send({
        message: `User ${req.user.username} is not allowed to delete ${routineById.name}`,
        name: "UnauthorizedUpdate",
        error: "403",
      });
    } else {
      const routine = await destroyRoutine(routineId);
      res.send(routine);
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/routines/:routineId/activities
router.post("/:routineId/activities", requireUser, async (req, res, next) => {
  const { routineId } = req.params;
  const { activityId, count, duration } = req.body;

  try {
    const routineById = await getRoutineActivitiesByRoutine({ id: routineId });

    const existingRoutineActivities = routineById.filter(
      (routine) => routine.activityId === activityId
    );

    if (existingRoutineActivities.length === 0) {
      const response = await addActivityToRoutine({
        routineId,
        activityId,
        count,
        duration,
      });
      res.send(response);
    } else {
      next({
        name: "ActivityExists",
        message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
