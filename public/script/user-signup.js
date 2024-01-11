// public/script/user-signup.js
import { showLoading, hideLoading } from './loading.js';

document.getElementById('signup-button').addEventListener('click', function () {
  const email = document.getElementById('email').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  axios
    .post('/user', {
      email,
      username,
      password,
    })
    .then(function (response) {
      alert(response.data.message);
      window.location.href = '/user-login.html';
    })
    .catch(function (error) {
      // console.error(error);
      alert(error.response.data.message);
    });
});

document
  .getElementById('send-verification-button')
  .addEventListener('click', function () {
    showLoading();
    const email = document.getElementById('email').value;
    axios
      .post('/auth/send-verification', { email })
      .then(function (response) {
        alert(response.data.message);
        hideLoading();
      })
      .catch(function (error) {
        alert(error.response.data.message);
        // console.error('인증번호 전송 실패', error);
        hideLoading();
      });
  });

document
  .getElementById('verify-verification-button')
  .addEventListener('click', function () {
    const email = document.getElementById('email').value;
    const code = document.getElementById('verification-code').value;
    axios
      .post('/auth/verify-email', { email, code })
      .then(function (response) {
        alert(response.data.message);
      })
      .catch(function (error) {
        alert(error.response.data.message);
      });
  });
