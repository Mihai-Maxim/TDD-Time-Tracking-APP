
const onlyEmployeesMiddleware = function(error) {
    const onlyEmployees = function (req, res, next) {
        if (req.user.isEmployer) {
            return res.status(error.returnStatus).json(error.returnJSON)
        }
       return next()
    }
    return onlyEmployees
}

export default onlyEmployeesMiddleware