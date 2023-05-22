import Joi from "joi";

const CheckOutDescriptionSchema = Joi.object({
    description: Joi.string()
        .min(10)
        .max(200)
        .required()
})



const LoginCredentialsSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
  
    password: Joi.string()
      .required()
})

const combineErrorStrings = (error) => {
    return error.details.map(err => err.message)
}



export {
    CheckOutDescriptionSchema,
    LoginCredentialsSchema,
    combineErrorStrings
}