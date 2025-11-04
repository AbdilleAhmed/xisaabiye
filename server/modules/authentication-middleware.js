const rejectUnauthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    // We've verified the request came from an authenticated user, so
    // we call `next()` to advance to the next middleware function or
    // the route's callback function.
    next();
  } else {
    // The request came from an unauthenticated user, so we reply with
    // HTTP status code 403:
    res.sendStatus(403);
  }
};




// middleware to check if user is an admin 
const rejectIfNotAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    console.log(`Access granted: ${req.user.username} is admin`);
    next();
  } else {
    console.log("Access denied: Admins only or user not authenticated");
    res.sendStatus(403);
  }
};



module.exports = { 
  rejectUnauthenticated,
  rejectIfNotAdmin

  // rejectIfNotAdmin
};
