// public/script/header-footer.js
window.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  loadFooter();
});

function loadHeader() {
  const headerElement = document.getElementById('header');
  fetch('/header.html')
    .then((response) => response.text())
    .then((data) => {
      headerElement.innerHTML = data;
    });
}

function loadFooter() {
  const footerElement = document.getElementById('footer');
  fetch('/footer.html')
    .then((response) => response.text())
    .then((data) => {
      footerElement.innerHTML = data;
    });
}
