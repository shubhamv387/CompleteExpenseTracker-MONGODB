const form = document.getElementById('form-submit');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const msg = document.getElementById('msg');
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const phone = document.getElementById('phone');

  if (password.value.length < 6) {
    msg.innerHTML = 'password must be a min of 6 characters';
    msg.className = 'bg-danger text-white p-1 px-2';

    msg.style.display = 'block';
    // Remove msg after 3 seconds
    return setTimeout(() => {
      msg.style.display = 'none';
      msg.innerHTML = '';
    }, 3000);
  }

  const userObj = {
    name: name.value,
    email: email.value,
    password: password.value,
    phone: phone.value,
  };

  axios
    .post('https://skv-expense-app.onrender.com/users/signup', userObj)
    .then((user) => {
      msg.innerHTML = user.data.message;
      if (user.data.userDetails) {
        msg.className = 'bg-success text-white p-1 px-2';

        name.value = '';
        email.value = '';
        password.value = '';
        phone.value = '';

        setTimeout(() => {
          window.location.replace('../login/login.html');
        }, 1000);
      } else msg.className = 'bg-danger text-white p-1 px-2';

      msg.style.display = 'block';
      // Remove msg after 3 seconds
      setTimeout(() => {
        msg.style.display = 'none';
        msg.innerHTML = '';
      }, 3000);
    })
    .catch((err) => console.log(err.message));
});
