const client = require("./client");

// database functions
async function getAllActivities() {
  const { rows } = await client.query(`
  SELECT *
  FROM activities;
  `);

  return rows;
}

async function getActivityById(id) {
  const {
    rows: [activity],
  } = await client.query(
    `
  SELECT *
  FROM activities
  WHERE id = $1;
  `,
    [id]
  );

  return activity;
}

async function getActivityByName(name) {
  const {
    rows: [activity],
  } = await client.query(
    `
  SELECT *
  FROM activities
  WHERE name = $1;
  `,
    [name]
  );

  return activity;
}

// select and return an array of all activities
async function attachActivitiesToRoutines(routines) {
  for (let i = 0; i < routines.length; i++) {
    const { rows: activities } = await client.query(
      `
    SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities."routineId", routine_activities.id AS "routineActivityId"
    FROM activities
    JOIN routine_activities
    ON activities.id = routine_activities."activityId"
    WHERE routine_activities."routineId" = $1;
    `,
      [routines[i].id]
    );

    routines[i].activities = activities;
  }

  return routines;
}

// return the new activity
async function createActivity({ name, description }) {
  const {
    rows: [activity],
  } = await client.query(
    `
    INSERT INTO activities(name, description)
    VALUES ($1, $2)
    ON CONFLICT (name) DO NOTHING
    RETURNING *;
    `,
    [name, description]
  );

  return activity;
}

// don't try to update the id
// do update the name and description
// return the updated activity
async function updateActivity({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  const {
    rows: [activity],
  } = await client.query(
    `
    UPDATE activities
    SET ${setString}
    WHERE id = ${id}
    RETURNING *;
    `,
    Object.values(fields)
  );

  return activity;
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
