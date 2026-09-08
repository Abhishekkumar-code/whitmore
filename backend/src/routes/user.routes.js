
import { Router } from "express"
import { registerValidator, loginValidator } from "../validator/auth.validator.js";
import { authcontrollerlogin, authcontrollerregister, getme } from "../controller/user.controller.js"
import { googleCallback } from "../controller/user.controller.js";
import { authicateuser } from "../middleware/auth.middleware.js";
import passport from "passport"

const authrouter = Router()

authrouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))
authrouter.get("/google/callback",passport.authenticate("google", { session: false,failureRedirect: "/login", }),googleCallback);
authrouter.post("/register", registerValidator, authcontrollerregister)
authrouter.post("/login", loginValidator, authcontrollerlogin)
authrouter.get('/getme',authicateuser,getme)

export default authrouter;