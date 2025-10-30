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

// Example of custom middleware: feel free to modify
// const rejectIfNotAdmin = (req, res, next) => {
//   if (req.isAuthenticated() && req.user?.admin) {
//     // Check to see if the user is authenticated AND an admin
//     // (based on the existance of an `admin` column in the database)
//     next();
//   } else {
//     res.sendStatus(403);
//   }
// };


module.exports = { 
  rejectUnauthenticated,
  // rejectIfNotAdmin
};
