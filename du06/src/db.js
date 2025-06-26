// src/db.js
import knex from 'knex'
// Jelikož knexfile se už nenachází ve stejném adresáři,
// musíme upravit cestu importu. 
import knexfile from '../knexfile.js'

const db = knex(knexfile)

// Jeden ze způsobů jak exportovat věci ze souboru je 'export default'
// Defaultní exporty se importují takto:
// import libovolnyNazev from './src/db.js'
export default db

// Nebo pouze 'export' takzvaný jmenný export
// Jmenný export se importuje takto:
// import { getAllTodos } from './src/db.js'
// kde musíme dodržet název getAllTodos, pokud se nám nehodí můžeme přejmenovat:
// import { getAllTodos as libovolnyNazev } from './src/db.js'
export const getAllTodos = async () => {
  const todos = await db('todos').select('*')

  return todos
}