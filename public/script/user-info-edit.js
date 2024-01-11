// public/script/user-info-edit.js
import { showLoading, hideLoading } from './loading.js';

// 페이지가 로드될 때 실행되는 함수
window.onload = function () {
  fetchUserProfile();
};

// 사용자 프로필 정보를 불러오는 함수
function fetchUserProfile() {
  const accessToken = localStorage.getItem('access_token');
  axios
    .get('/user/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then(function (response) {
      const data = response.data;
      displayUserProfile(data);
    })
    .catch(function (error) {
      alert('로그인이 필요한 서비스 입니다.');
      window.location.href = '/user-login.html';
      console.error('프로필 정보 불러오기 실패:', error);
    });
}

// 사용자 프로필 정보를 페이지에 표시하는 함수
function displayUserProfile(data) {
  // 이미지 미리보기 설정
  if (data.imageUrl) {
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.style.backgroundImage = `url(${data.imageUrl})`;
    imagePreview.style.backgroundSize = 'cover';
    imagePreview.style.backgroundPosition = 'center';
  }

  // 사용자 이름과 코멘트 입력란에 값 설정
  document.getElementById('username').value = data.username || '';
  document.getElementById('comment').value = data.comment || '';
}

// 이미지 미리보기 함수
window.previewImage = function (event) {
  // console.log('previewImage', event);
  const reader = new FileReader();
  reader.onload = function () {
    const output = document.getElementById('imagePreview');
    output.style.backgroundImage = `url(${reader.result})`;
    output.style.backgroundSize = 'cover';
    output.style.backgroundPosition = 'center';
  };
  reader.readAsDataURL(event.target.files[0]);
};

// 페이지가 로드될 때 실행되는 함수
window.onload = function () {
  fetchUserProfile();
  document
    .getElementById('updateProfileForm')
    .addEventListener('submit', updateProfile);
};

// 회원 정보 수정 요청 함수
function updateProfile(event) {
  showLoading();
  event.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const username = document.getElementById('username').value;
  const comment = document.getElementById('comment').value;
  const imageUpload = document.getElementById('imageUpload').files[0];

  const formData = new FormData();
  formData.append('currentPassword', currentPassword);
  if (newPassword) formData.append('newPassword', newPassword);
  formData.append('username', username);
  formData.append('comment', comment);
  if (imageUpload) formData.append('image', imageUpload);

  const accessToken = localStorage.getItem('access_token');
  axios
    .patch('/user', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      alert(response.data.message);
      hideLoading();
      window.location.reload();
    })
    .catch((error) => {
      alert(error.response.data.message);
      hideLoading();
      console.error('회원 정보 업데이트 중 오류 발생', error);
    });
}

// 회원 탈퇴 이벤트 리스너 추가
document
  .getElementById('delete-profile-button')
  .addEventListener('click', deleteUserProfile);

// 회원 탈퇴 요청 함수
function deleteUserProfile() {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    alert('로그인이 필요한 기능입니다.');
    window.location.href = '/user-login.html';
    return;
  }

  if (!confirm('정말로 계정을 삭제하시겠습니까?')) {
    return; // 사용자가 취소를 눌렀을 때
  }

  showLoading(); // 로딩 표시기 시작

  axios
    .delete('/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      alert(response.data.message);
      hideLoading(); // 로딩 표시기 종료
      localStorage.removeItem('access_token'); // 토큰 삭제
      window.location.href = '/user-login.html';
    })
    .catch((error) => {
      alert('회원 탈퇴에 실패했습니다.');
      hideLoading(); // 로딩 표시기 종료
      console.error('회원 탈퇴 중 오류 발생', error);
    });
}
