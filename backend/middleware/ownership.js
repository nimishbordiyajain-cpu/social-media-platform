// ---------- middleware/ownership.js : ownership-based authorization ----------
// Authentication = "who are you?"   Authorization = "are you allowed to do this?"
// checkOwnership(Model) is a middleware FACTORY: give it Post or Comment and it
// returns a middleware that allows the request only if the logged-in user
// is the author of that document.
const checkOwnership = (Model, name) => async (req, res, next) => {
  try {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: `${name} not found` });
    }
    // compare the author's id with the logged-in user's id
    if (doc.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: `You can only modify your own ${name.toLowerCase()}s` });
    }
    req.doc = doc; // pass the found document to the controller (saves a second DB query)
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkOwnership;
