require('dotenv').config()
const postgres = require('postgres')

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  prepare: false,
  connect_timeout: 10,
})

async function test() {
  try {
    await sql`SELECT 1`
    console.log('DB CONNECTED ✅')
  } catch (error) {
    console.error('DB ERROR ❌')
    console.error(error)
  } finally {
    await sql.end()
  }
}

test()