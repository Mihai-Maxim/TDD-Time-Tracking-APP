import express from "express"
import jwt from "jsonwebtoken"
import authMiddleware from "./middleware/authMiddleware.js"
import { dbConn } from "./mockedWorkDataDB.js"
import onlyEmployeesMiddleware from "./middleware/onlyEmployees.js"
import authTokens from "./tokens.js"


const { WorkDataFunctions, UsersFunctions } = dbConn


const router = express.Router()

router.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                error: "credentials must contain email and password!"
            })
        }
        const users = await UsersFunctions.getUsersBy({
            email,
            password
        })

        if (users.length === 1) {
            const user = users[0]

            delete user.checkedIn
            delete user.isEmployer

            // here you go sir
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

            authTokens.set(token, true)

            return res.status(200).json({
                token
            })
        }
        return res.status(401).json({
            error: "invalid credentials"
        })

    } catch (error) {
        return res.status(400).json({
            error: "payload must be a JSON with email and password!"
        })
    }
})

router.post("/check-in",
    [
     authMiddleware,
     onlyEmployeesMiddleware({
        returnStatus: 403,
        returnJSON: {
            error: "Only employees can check-in!"
        }
     })
    ],
    async (req, res) => {
        if (req.user.checkedIn) {
            // get the last work data for this user
            const lastWorkSessions = await WorkDataFunctions.getWorkDataBy({
                email: req.user.email,
                end_date: null,
            })

            if (lastWorkSessions.length === 1) {
                return res.status(200).json({
                    success: false, check_in_date: lastWorkSessions[0].start_date
                })
            } else {
                // discard all unclosed work sessions
                await WorkDataFunctions.removeWorkDataBy({
                    email: req.user.email,
                    end_date: null
                })

                await UsersFunctions.updateUsersBy({ email: req.user.email }, { checkedIn: false })

                return res.status(200).json({
                    success: false, error: "something went wrong, check in again!"
                })
            }

        } else {
            // create a new work session
            const start_date = new Date().toISOString()

            await WorkDataFunctions.insertWorkData({
                email: req.user.email,
                start_date,
                end_date: null,
                description: null,
            })

            await UsersFunctions.updateUsersBy({ email: req.user.email }, { checkedIn: true })
            return res.status(200).json({
                success: true, check_in_date: start_date
            })

        }  
    })

router.post("/check-out",
    [
     authMiddleware,
     onlyEmployeesMiddleware({
        returnStatus: 403,
        returnJSON: {
            error: "Only employees can check-out!"
        }
     })
    ],
    async (req, res) => {

        if (!req.body || !req.body.description || typeof req.body.description !== "string") {
            return res.status(400).json({
                success: false,
                error: "you must provide a JSON payload with a description string in order to check out"
            })
        }

        const description = req.body.description

        if (!req.user.checkedIn) {
            return res.status(200).json({
                success: false,
                error: "You are not checked in"
            })
        }

        // get the last work data for this user
        let lastWorkSessions = await WorkDataFunctions.getWorkDataBy({
            email: req.user.email,
            end_date: null,
        })


        if (lastWorkSessions.length === 1) {
            const newDate = new Date().toISOString()
            await WorkDataFunctions.updateWorkDataBy({
                start_date: lastWorkSessions[0].start_date,
                email: req.user.email
            }, {
                end_date: newDate,
                description
            })

            await UsersFunctions.updateUsersBy({ email: req.user.email }, { checkedIn: false })

            lastWorkSessions = await WorkDataFunctions.getWorkDataBy({
                email: req.user.email,
                end_date: newDate,
            })


            const completedSession = lastWorkSessions[0]

            delete completedSession.email

            return res.status(200).json({
                success: true,
                ...completedSession
            })

        } else {
            // discard all unclosed work sessions
            await WorkDataFunctions.removeWorkDataBy({
                email: req.user.email,
                end_date: null
            })

            await UsersFunctions.updateUsersBy({ email: req.user.email }, { checkedIn: false })

            return res.status(200).json({
                success: false, error: "something went wrong, the last session was discarded, you may check in again!"
            })
        }

    
    })



router.get("/history",
    [
     authMiddleware,
    ],
    async (req, res) => {
        const { q } = req.query

        if (!req.user.isEmployer && q) {
            return res.status(403).json({
                error: "Employees cannot use the q query param!"
            })
        } 

        if (req.user.isEmployer && !q) {
            const foundData = await WorkDataFunctions.getAllWorkData()
            return res.status(200).json({
                history: foundData
            })

        }

        if (!req.user.isEmployer && !q) {
            const foundData = await WorkDataFunctions.getWorkDataBy({
                email: req.user.email
            })
            return res.status(200).json({
                history: foundData
            })
        }
      
        const targetEmployees = await UsersFunctions.getUsersBy({
            email: q,
            isEmployer: false
        })

        if (targetEmployees.length === 1) {
            const targetEmployee = targetEmployees[0]
            const foundData = await WorkDataFunctions.getWorkDataBy({
                email: targetEmployee.email
            })
            return res.status(200).json({
                history: foundData
            })
        }

        return res.status(404).json({
            error: "Employee not found!"
        })

    })

router.post("/logout", (req, res) => {
    try {
        const authorization = req.headers.authorization.split(" ")[1]

        jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET)
 
        authTokens.set(authorization, false)

        return res.status(200).json({
            status: "success"
        })
    }
    catch (err) {
        return res.status(400).json({
            error: "valid authorization header is required"
        })
    }

})


export default router