require('dotenv').config()

const app = require('./app')
const port = 3000
require('./database')
require('./redis/blocklist-access-token')
require('./redis/allowlist-refresh-token')

app.use((requisicao, resposta, proximo) => {
  const accept = requisicao.get('Accept')

  if (accept.indexOf('application/json')) {
    resposta.status(406)
    resposta.end()
    return
  }

  resposta.set({
    'Content-Type': 'application/json'
  })

  proximo()
})

const routes = require('./rotas')
const { InvalidArgumentError, NaoEncontrado, NaoAutorizado } = require('./src/erros')
const jwt = require('jsonwebtoken')
routes(app)

app.use((erro, requisicao, resposta, proximo) => {
  let status = 500
  const corpo = {
    message: erro.message
  }

  if (erro instanceof NaoAutorizado) {
    status = 401
  }

  if (erro instanceof NaoEncontrado) {
    status = 404
  }

  if (erro instanceof InvalidArgumentError) {
    status = 400
  }

  if (erro instanceof jwt.JsonWebTokenError) {
    status = 401
  }

  if (erro instanceof jwt.TokenExpiredError) {
    status = 401
    corpo.expiradoEm = erro.expiredAt
  }

  resposta.status(status).json(corpo)
})

app.listen(port, () => console.log('A API está funcionando!'))
