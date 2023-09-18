exports.isPremiumUser = (req, res, next) => {
  if (req.user.isPremium) next();
  else
    return res
      .status(401)
      .json({ status: "Failed", message: "Not a premium user" });
};
