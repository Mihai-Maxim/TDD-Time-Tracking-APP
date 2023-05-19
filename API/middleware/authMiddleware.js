import authTokens from "../tokens.js"
import jwt from "jsonwebtoken"
import { dbConn } from "../mockedWorkDataDB.js"

const { UsersFunctions } = dbConn

const authMiddleware = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization.split(" ")[1]

        jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {

            if (err) {
                return res.status(403).json({
                    error: "authentication required"
                })
            }

            // if (!authTokens.get(authorization)) {
            //     return res.status(403).json({
            //         error: "authentication required"
            //     })
            // }

            const myUsers = await UsersFunctions.getUsersBy({
                email: user.email,
                password: user.password
            })

            
            if (myUsers.length !== 1) {
                return res.status(403).json({
                    error: "authentication required"
                })
            }

            // console.logk(myUsers)

            req.user = myUsers[0]
    
            next()
        })

    } catch (err) {
        return res.status(403).json({
            error: "authentication required"
        })
    }
}


export default authMiddleware