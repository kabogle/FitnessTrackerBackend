const { attachActivitiesToRoutines } = require('./activities');
const client = require('./client');

async function getRoutineById(id){
  const { rows: [routine] } = await client.query(`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines
  JOIN users
  ON routines."creatorId" = users.id
  WHERE routines.id = $1;
  `, [id]);

  await attachActivitiesToRoutines(routine);

  return routine;
}

async function getRoutinesWithoutActivities(){
  const { rows: routines } = await client.query(`
  SELECT *
  FROM routines
  `);

  return routines;
}

async function getAllRoutines() {
  const { rows: routines } = await client.query(`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines
  JOIN users
  ON routines."creatorId" = users.id;
  `);

  await attachActivitiesToRoutines(routines);

  return routines;
}

async function getAllRoutinesByUser({username}) {
  const { rows: routine } = await client.query(`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines
  JOIN users
  ON routines."creatorId" = users.id
  WHERE username = $1;
  `, [username]);

  await attachActivitiesToRoutines(routine)

  return routine;
}

async function getPublicRoutinesByUser({username}) {
  const { rows: routine } = await client.query(`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines
  JOIN users
  ON routines."creatorId" = users.id
  WHERE "isPublic" = true AND username = $1;
  `, [username]);

  await attachActivitiesToRoutines(routine)

  return routine;
}

async function getAllPublicRoutines() {
  const { rows: routine } = await client.query(`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines
  JOIN users
  ON routines."creatorId" = users.id
  WHERE "isPublic" = true;
  `);

  await attachActivitiesToRoutines(routine);

  return routine;
}

async function getPublicRoutinesByActivity({id}) {
  const { rows: routine } = await client.query(`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines
  JOIN users
  ON routines."creatorId" = users.id
  JOIN routine_activities 
  ON routine_activities."routineId" = routines.id
  WHERE "isPublic" = true AND routine_activities."activityId" = $1;
  `, [id]);

  await attachActivitiesToRoutines(routine);

  return routine;
}

async function createRoutine({creatorId, isPublic, name, goal}) {
  const { rows: [routine] } = await client.query(`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (name) DO NOTHING
    RETURNING *;
    `, [creatorId, isPublic, name, goal]);

    const newRoutine = await getRoutineById(routine.id);

    return newRoutine;
}

async function updateRoutine({
  id, ...fields
}) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`
).join(', ');

  const { rows: [routine] } = await client.query(`
  UPDATE routines
  SET ${setString}
  WHERE id = ${id}
  RETURNING *;
  `, Object.values(fields));

  return routine;
}

async function destroyRoutine(id) {
  const { rows: [routine] } = await client.query(`
  DELETE FROM routines
  WHERE id = $1
  RETURNING *;
  `, [id]);

  return routine;
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
}