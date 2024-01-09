// public/script/header-footer.js
// DOM이 로드되면 실행되는 함수들
window.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  loadFooter();
  startTokenCountdown();
  addTokenCountdownClickListener();
  fetchUserProfileImage();
});

// 헤더 로드 함수
function loadHeader() {
  const headerElement = document.getElementById('header');
  fetch('/header.html')
    .then((response) => response.text())
    .then((data) => {
      headerElement.innerHTML = data;
      addHeaderEventListeners();
      startTokenCountdown();
      addTokenCountdownClickListener();
    });
}

// 푸터 로드 함수
function loadFooter() {
  const footerElement = document.getElementById('footer');
  fetch('/footer.html')
    .then((response) => response.text())
    .then((data) => {
      footerElement.innerHTML = data;
    });
}

// 헤더 이벤트 리스너 추가 함수
function addHeaderEventListeners() {
  const profileImage = document.querySelector('.profile-img');
  if (profileImage) {
    profileImage.addEventListener('click', function () {
      const profileMenu = document.querySelector('.profile-menu');
      profileMenu.innerHTML = '';
      createProfileMenu(profileMenu);
      profileMenu.classList.toggle('hidden');
    });
  }
}

// 프로필 메뉴 생성 함수
function createProfileMenu(profileMenu) {
  const isLoggedIn = checkLoginStatus();
  if (isLoggedIn) {
    profileMenu.appendChild(createMenuItem('/user-my-page.html', '마이페이지'));
    const logoutItem = createMenuItem('#', '로그아웃');
    logoutItem.addEventListener('click', logoutUser);
    profileMenu.appendChild(logoutItem);
  } else {
    profileMenu.appendChild(createMenuItem('/user-signup.html', '회원가입'));
    profileMenu.appendChild(createMenuItem('/user-login.html', '로그인'));
  }
}

// 메뉴 아이템 생성 함수
function createMenuItem(href, text) {
  const menuItem = document.createElement('a');
  menuItem.href = href;
  menuItem.textContent = text;
  menuItem.className =
    'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100';
  return menuItem;
}

// 로그인 상태 확인 함수
function checkLoginStatus() {
  const accessToken = localStorage.getItem('access_token');
  return accessToken !== null;
}

// 로그아웃 함수
function logoutUser() {
  const accessToken = localStorage.getItem('access_token');
  axios
    .post(
      '/auth/logout',
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    .then((response) => {
      alert(response.data.message);
      localStorage.removeItem('access_token');
      window.location.reload();
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
}

// JWT 토큰 파싱 함수
function parseJwt(token) {
  let base64Payload = token.split('.')[1];
  let payload = atob(base64Payload);
  return JSON.parse(payload);
}

// 토큰 유효시간 확인 및 카운트다운 시작 함수
function startTokenCountdown() {
  const token = localStorage.getItem('access_token');
  if (token) {
    const decodedToken = parseJwt(token);
    const expTime = new Date(decodedToken.exp * 1000);
    const countdownElement = document.getElementById('token-countdown');
    if (!countdownElement) return;

    updateCountdown(countdownElement, expTime);
    const countdownInterval = setInterval(() => {
      if (!updateCountdown(countdownElement, expTime)) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }
}

// 카운트다운 업데이트 함수
function updateCountdown(element, endTime) {
  const now = new Date();
  const distance = endTime - now;

  if (distance < 0) {
    element.textContent = '토큰 만료';
    logoutUser();
    return false;
  }

  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  element.textContent = `로그인 연장 ${minutes}:${
    seconds < 10 ? '0' + seconds : seconds
  }`;
  return true;
}

// 토큰 카운트다운 요소 클릭 이벤트 리스너 추가 함수
function addTokenCountdownClickListener() {
  const countdownElement = document.getElementById('token-countdown');
  if (countdownElement) {
    countdownElement.addEventListener('click', refreshAccessToken);
  }
}

// 액세스 토큰 갱신 함수
function refreshAccessToken() {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    console.log('액세스 토큰이 존재하지 않습니다.');
    return;
  }

  axios
    .post(
      '/auth/refresh',
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    .then((response) => {
      const newAccessToken = response.data.access_token;
      localStorage.setItem('access_token', newAccessToken);
      alert('로그인 시간이 연장되었습니다.');
      startTokenCountdown();
      window.location.reload();
    })
    .catch((error) => {
      console.error(error.response.data.message);
    });
}

function fetchUserProfileImage() {
  axios
    .get('/user/profile', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
    .then((response) => {
      const userProfile = response.data;
      if (userProfile.imageUrl) {
        const profileImg = document.querySelector('.profile-img');
        if (userProfile.imageUrl) {
          profileImg.src = userProfile.imageUrl;
          profileImg.style.borderRadius = '50%';
          profileImg.style.width = '44px';
          profileImg.style.height = '44px';
          profileImg.style.objectFit = 'cover';
        }
      }
    })
    .catch((error) => {
      console.error('프로필 이미지를 불러오는데 실패했습니다:', error);
      // 오류 처리 및 기본 이미지 설정
      // document.querySelector('.profile-img').src = './image/Profil.png';
    });
}
