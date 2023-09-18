const form = document.getElementById("form-submit");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = document.getElementById("msg");
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const phone = document.getElementById("phone");

  const userObj = {
    name: name.value,
    email: email.value,
    password: password.value,
    phone: phone.value,
  };

  axios
    .post("http://localhost:3000/users/signup", userObj)
    .then((user) => {
      msg.innerHTML = user.data.message;
      if (user.data.userDetails) {
        msg.className = "bg-success text-white p-1 px-2";

        name.value = "";
        email.value = "";
        password.value = "";
        phone.value = "";

        console.log(user.data.userDetails);
        setTimeout(() => {
          window.location.replace("../login/login.html");
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
