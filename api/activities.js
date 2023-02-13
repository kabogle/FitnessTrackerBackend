const express = require("express");
const {
  getActivityById,
  getPublicRoutinesByActivity,
  getAllActivities,
  getActivityByName,
  createActivity,
  updateActivity,
} = require("../db");
const router = express.Router();

// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
  try {
    const { activityId } = req.params;

    const activity = await getActivityById(activityId);

    if (activity) {
      const publicRoutines = await getPublicRoutinesByActivity({
        id: activityId,
      });
      res.send(publicRoutines);
    } else {
      next({
        error: "500",
        message: `Activity ${activityId} not found`,
        name: "ActivityNotFoundError",
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/activities
router.get("/", async (req, res, next) => {
  try {
    const allActivities = await getAllActivities();
    res.send(allActivities);
  } catch (error) {
    next(error);
  }
});

// POST /api/activities
router.post("/", async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const activityName = await getActivityByName(name);

    if (!activityName) {
      const newActivity = await createActivity({ name, description });
      res.send(newActivity);
    } else {
      next({
        name: "ActivityNameExists",
        message: `An activity with name ${name} already exists`,
      });
    }
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:activityId
router.patch("/:activityId", async (req, res, next) => {
  const { name, description } = req.body;
  const { activityId } = req.params;

  try {
    const activityById = await getActivityById(activityId);
    const activityName = await getActivityByName(name);

    if (!activityById) {
      next({
        message: `Activity ${activityId} not found`,
        name: "ActivityNotFoundError",
      });
    } else if (activityName) {
      next({
        name: "ActivityNameExists",
        message: `An activity with name ${name} already exists`,
      });
    } else {
      const activity = await updateActivity({
        name,
        description,
        id: activityId,
      });
      res.send(activity);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
