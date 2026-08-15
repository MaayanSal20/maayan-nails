const net = require('net')

const socket = net.createConnection(6543, 'aws-1-eu-west-1.pooler.supabase.com', () => {
  console.log('✅ התחברות הצליחה!')
  socket.end()
})

socket.on('error', (err) => {
  console.log('❌ שגיאה:', err.message)
})