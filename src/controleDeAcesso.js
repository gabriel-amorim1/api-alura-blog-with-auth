const AccessControl = require('accesscontrol')
const controle = new AccessControl()

controle
  .grant('assinante')
  .readAny('post', ['id', 'titulo', 'conteudo', 'autor'])

controle
  .grant('editor')
  .extend('assinante')
  .createOwn('post')
  .deleteOwn('post')

controle
  .grant('admin')
  .createAny('post')
  .readAny('post')
  .deleteAny('post')
  .readAny('usuario')
  .deleteAny('usuario')

module.exports = controle
