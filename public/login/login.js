const form = document.getElementById("form-submit");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = document.getElementById("msg");

  const email = document.getElementById("email");
  const password = document.getElementById("password");

  const userObj = {
    email: email.value,
    password: password.value,
  };

  axios
    .post("http://localhost:3000/users/login", userObj)
    .then((user) => {
      msg.innerHTML = user.data.message;

      // console.log(user.data.token);
      if (user.data.userDetails) {
        msg.className = "bg-success text-white p-1 px-2";

        localStorage.setItem("token", user.data.token);

        email.value = "";
        password.value = "";
        setTimeout(() => {
          window.location.replace("../expense/expense.html");
        }, 1000);
      } else msg.className = "bg-danger text-white p-1 px-2";

      msg.style.display = "block";
      // Remove msg after 3 seconds
      setTimeout(() => {
        msg.style.display = "none";
        msg.innerHTML = "";
      }, 3000);
    })
    .catch((err) => console.log(err.message));
});

const loginDiv = document.getElementById("loginDiv");
const pageTitle = document.getElementById("pageTitle");

const resetPasswordDiv = document.getElementById("resetPasswordDiv");
const mainDiv = document.getElementById("mainDiv");
const forgotPassBtn = document.getElementById("forgotPassBtn");

forgotPassBtn.addEventListener("click", () => {
  loginDiv.remove();
  pageTitle.innerText = "Password reset request";
  const resetPasswordDiv = document.createElement("div");
  resetPasswordDiv.className = "form-control p-3 px-4";
  resetPasswordDiv.style.background = "#f2f2f2";
  resetPasswordDiv.innerHTML = `<form id="resetPasswordForm">
    <label class="form-label mt-2 mb-1" for="emailForResetPass"
      >Email Address:</label>
    <input
      required
      class="form-control"
      type="email"
      name="emailForResetPass"
      id="emailForResetPass"
      placeholder="Registered email address..." />

    <input type="submit" value="Request" class="btn btn-success mt-3" />
  </form>
  <p class="mt-2 mb-0"><a id="" class="text-primary fw-bold" href="../login/login.html">Return to login</a></p>`;
  mainDiv.appendChild(resetPasswordDiv);
  const resetPasswordForm = document.getElementById("resetPasswordForm");
  resetPasswordForm.addEventListener("submit", getResetPasswordEmail);
});

async function getResetPasswordEmail(e) {
  e.preventDefault();

  const emailForResetPass = document.getElementById("emailForResetPass");

  const msg = document.getElementById("msg");

  try {
    const response = await axios.post(
      "http://localhost:3000/password/forgotpassword",
      {
        email: emailForResetPass.value,
      }
    );
    // alert("An email has been sent to your mailbox.");
    emailForResetPass.value = "";

    msg.className = "bg-success text-white p-1 px-2";
    msg.innerHTML = "An email has been sent to your mailbox.";
    msg.style.display = "block";

    // Remove msg after 5 seconds and redirect
    setTimeout(() => {
      msg.style.display = "none";
      msg.innerHTML = "";
      window.location.replace("../login/login.html");
    }, 5000);
  } catch (error) {
    msg.className = "bg-danger text-white p-1 px-2";
    msg.innerHTML = "Email does not exist!";
    msg.style.display = "block";
    // Remove msg after 2 seconds
    setTimeout(() => {
      msg.style.display = "none";
      msg.innerHTML = "";
    }, 2000);
    emailForResetPass.value = "";
    console.log(error.response.data.message);
  }
}
