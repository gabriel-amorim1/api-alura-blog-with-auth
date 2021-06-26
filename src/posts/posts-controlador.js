const Post = require('./posts-modelo')
const { ConversorPost } = require('../conversores')
const { EmailPostCriado } = require('../usuarios/emails')

module.exports = {
  async adiciona (req, res, proximo) {
    try {
      req.body.autor = req.user.id
      const post = new Post(req.body)
      await post.adiciona()

      const email = new EmailPostCriado(req.user, post.id, post.titulo)
      await email.enviaEmail()

      res.status(201).json(post)
    } catch (erro) {
      proximo(erro)
    }
  },

  async lista (req, res) {
    try {
      let posts = await Post.listarTodos()

      const conversor = new ConversorPost('json', req.acesso.todos.permitido
        ? req.acesso.todos.atributos
        : req.acesso.apenasSeu.atributos)

      if (!req.estaAutenticado) {
        posts = posts.map(post => {
          post.conteudo = post.conteudo.substr(0, 10) +
            '... Você precisa assinar o blog para ler o restante do post'

          return post
        })
      }

      res.send(conversor.converter(posts))
    } catch (erro) {
      return res.status(500).json({ erro: erro.message })
    }
  },

  async obterDetalhes (req, res) {
    try {
      const post = await Post.buscaPorId(req.params.id, req.user.id)
      res.json(post)
    } catch (erro) {
      return res.status(500).json({ erro: erro.message })
    }
  },

  async remover (req, res) {
    try {
      let post
      if (req.acesso.todos.permitido === true) {
        post = await Post.buscaPorId(req.params.id, req.user.id)
      } else if (req.acesso.apenasSeu.permitido === true) {
        post = await Post.buscaPorAutor(req.params.id, req.user.id)
      }

      post.remover()
      res.status(204)
      res.end()
    } catch (erro) {
      return res.status(500).json({ erro: erro.message })
    }
  }
}
