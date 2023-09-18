const Brevo = require("sib-api-v3-sdk");
const ForgotPasswordRequest = require("../model/ForgotPasswordRequests");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const sequelize = require("../utils/database");

// @desc    Sending password reset mail to User
// @route   POST /user/password/forgotpassword
// @access  Public
exports.resetForgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user)
      return res
        .status(400)
        .json({ status: "Failed", message: "email does not Exists!" });

    const id = uuidv4();
    const FPR = await ForgotPasswordRequest.create({
      id,
      isActive: true,
      userId: user.id,
    });

    const defaultClient = await Brevo.ApiClient.instance;

    // Configure API key authorization: api-key
    const apiKey = defaultClient.authentications["api-key"];
    const transEmailApi = new Brevo.TransactionalEmailsApi();

    await Promise.all([apiKey, transEmailApi]);

    apiKey.apiKey = process.env.BREVO_API_KEY;

    const path = `http://localhost/password/resetpassword/${id}`;

    const sender = {
      email: "shubhamv387@gmail.com",
      name: "Shubhamv K",
    };
    const receivers = [req.body];

    await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "reset password mail",
      textContent: "Click here to reset your password",
      htmlContent: `<a href="${path}">Click Here</a> to reset your password!`,
    });

    res
      .status(200)
      .json({ status: "Success", message: "email sent successfully!" });
  } catch (error) {
    console.error(error);
  }
};

// @desc    Reset Forgot Password
// @route   GET /user/password/resetpassword/:id
// @access  Private
exports.createNewPassword = async (req, res, next) => {
  try {
    const FPR = await ForgotPasswordRequest.findOne({
      where: { id: req.params.id },
    });
    if (!FPR)
      return res
        .status(400)
        .json({ status: "failed", message: "invalid link" });

    return res.status(200).send(`<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Create New Password</title>
      
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
            rel="stylesheet"
          />
        </head>
        <body>
          <h1
            id="pageTitle"
            class="text-center fs-2 mb-4 p-2 bg-dark text-white pb-3"
          >
            Create New Password
          </h1>
          <div
            id="forgotPassDiv"
            class="container d-flex p-4 pb-0"
            style="max-width: 650px"
          >
            <!-- LOGIN FORM -->
            <div
              id="loginDiv"
              class="form-control p-3 px-4"
              style="background: #f2f2f2"
            >
              <form id="resetPasswordNow">
                <label class="form-label mt-2 mb-1" for="password">Password:</label>
                <input
                  required
                  class="form-control"
                  type="password"
                  name="password"
                  id="password"
                />
      
                <label class="form-label mt-2 mb-1" for="confirmPassword"
                  >Confirm Password:</label
                >
                <input
                  required
                  class="form-control"
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                />
      
                <input type="submit" value="SEND" class="btn btn-success mt-3" />
              </form>
            </div>
            <!-- FORGOT PASSWORD FORM -->
          </div>
      
          <div class="container d-flex flex-column p-4 pb-0" style="max-width: 650px">
            <p id="msg" class="p-1 px-2" style="display: none">p</p>
            <p id="loginNow" style="display: none">
              You can
              <a
                style="font-weight: bold"
                href="http://localhost/login/login.html"
                >Login Now</a
              >
              with the new password.
            </p>
          </div>
      
          <script>
            document
              .getElementById("resetPasswordNow")
              .addEventListener("submit", async (e) => {
                e.preventDefault();
                const pass = document.getElementById("password");
                const confirmPass = document.getElementById("confirmPassword");
                if (pass.value !== confirmPass.value) {
                  alert("MisMatched Passwords!");
                  pass.value = "";
                  confirmPass.value = "";
                } else {
                  try {
                    const response = await axios.post(
                      "http://localhost:3000/password/resetpassword/${req.params.id}",
                      { pass: pass.value, confirmPass: confirmPass.value }
                    );
      
                    alert(response.data.message);
                    pass.value = "";
                    confirmPass.value = "";
                    document.getElementById("loginNow").style.display = "block";
                  } catch (error) {
                    alert(error.response.data.message);
                    pass.value = "";
                    confirmPass.value = "";
                    console.log(error.response.data.message);
                  }
                }
              });
          </script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js"></script>
        </body>
      </html>`);
  } catch (error) {
    console.error(error);
  }
};

// @desc    Reset Forgot Password
// @route   POST /user/password/resetpassword/:id
// @access  Private
exports.PostCreateNewPassword = async (req, res, next) => {
  const { id } = req.params;
  const { pass, confirmPass } = req.body;

  if (pass !== confirmPass)
    return res
      .status(400)
      .send({ status: "Failed", message: "MisMatched Passwords!" });

  const t = await sequelize.transaction();
  try {
    const FPR = await ForgotPasswordRequest.findOne(
      { where: { id: id } },
      { transaction: t }
    );

    if (!FPR.isActive) {
      await t.commit();
      return res.status(400).send({
        status: "Failed",
        message: "Link Expired! Go back and generate a New Link",
      });
    }

    const hashedPassword = bcrypt.hashSync(pass, 10);

    const updatedFPR = ForgotPasswordRequest.update(
      { isActive: false },
      { where: { id: id } },
      { transaction: t }
    );
    const updatedUser = User.update(
      { password: hashedPassword },
      { where: { id: FPR.userId } },
      { transaction: t }
    );

    await Promise.all([updatedFPR, updatedUser]);
    await t.commit();
    res
      .status(200)
      .send({ status: "Success", message: "Password Updated Successfully" });
  } catch (error) {
    t.rollback();
    console.log(error);
  }
};
