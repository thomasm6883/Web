import { ApolloServer } from '@apollo/server'
import Express from 'express'
import { expressMiddleware } from '@apollo/server/express4'
import { resolvers } from './resolvers.js'
import { typeDefs } from './models/typeDefs.js'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import Dotenv from 'dotenv'
import router from './data/routing.js'

Dotenv.config()

const DB_USER = process.env.DB_USER ?? 'unknown'
const DB_PASS = process.env.DB_PASS ?? 'unknown'

// connect to the database
const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.tvwkihq.mongodb.net/SchoolData?retryWrites=true&w=majority`
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to Database')
  // test query upon connection
}).catch(err => {
  console.log('Error Connecting to Database')
  console.log(err)
})
mongoose.set('debug', true)
const server = new ApolloServer({ typeDefs, resolvers })
await server.start()

const app = new Express()

app.use('/graphql', bodyParser.json(), expressMiddleware(server))

app.use(router)

app.use(Express.static('./public'))

app.listen(3000, () =>
  console.log('Server ready at http://localhost:3000')
)
