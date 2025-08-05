const express = require("express")
const router = express.Router()
const { auth, isInstructor } = require("../middlewares/auth")
const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard,
} = require("../controllers/Profile")

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************


                                // Why use auth middleware here?
                                // Because we want to protect this route so that:

                                // ❌ Unauthenticated users (not logged in) cannot delete accounts

                                // ✅ Only logged-in users (with a valid token/session) can access it

                              // --> BASIC SYNTAX TO DEFINE ROUTE --> [   router.METHOD("PATH", middleware(s), handlerFunction);   ]

// Delet User Account
router.delete("/deleteProfile", auth, deleteAccount)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)

// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

module.exports = router