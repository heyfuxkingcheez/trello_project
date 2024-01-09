// public/script/user-my-page.js
import { showLoading, hideLoading } from './loading.js';

// DOM이 완전히 로드되고 파싱됐을 때 실행
document.addEventListener('DOMContentLoaded', function () {
  fetchUserProfile();
});

// // 페이지의 모든 요소(이미지, 스타일시트 등)가 로드된 후 실행
// window.onload = function () {
//   // 여기에 로드 완료 후 실행할 코드를 작성
//   fetchUserProfile();
// };

// 개인 정보 수정 페이지로 이동
document
  .getElementById('edit-profile-button')
  .addEventListener('click', function () {
    window.location.href = 'user-info-edit.html';
  });

function fetchUserProfile() {
  showLoading();
  axios
    .get('/user/profile', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
    .then((response) => {
      const user = response.data;

      document.getElementById('user-image').src =
        user.imageUrl || 'https://unsplash.it/200/200';
      document.getElementById('user-name').textContent = user.username;
      document.getElementById('user-email').textContent = user.email;
      document.getElementById('user-comment').textContent =
        user.comment || '코멘트가 없습니다.';
      hideLoading();
    })
    .catch((error) => {
      alert('로그인이 필요한 서비스 입니다.');
      window.location.href = '/user-login.html';
      console.error('프로필 정보를 불러오는데 실패했습니다:', error);
      hideLoading();
      // 오류 처리
    });
}
