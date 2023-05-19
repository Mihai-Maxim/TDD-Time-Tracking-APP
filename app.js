import * as dotenv from 'dotenv'
import bodyParser from "body-parser"
dotenv.config()

import express from "express"
import todosRouter from "./API/todos.js"


const app = express()

app.use(bodyParser.json())

app.use("/", todosRouter)


export default app