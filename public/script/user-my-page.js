// public/script/user-my-page.js
import { showLoading, hideLoading } from './loading.js';

// DOM이 완전히 로드되고 파싱됐을 때 실행
document.addEventListener('DOMContentLoaded', function () {
  fetchUserProfile();
  fetchBoards();
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

// 새 보드 생성 모달 열기
document
  .getElementById('open-create-board-modal')
  .addEventListener('click', function () {
    document.getElementById('create-board-modal').classList.remove('hidden');
  });

// 모달 닫기
document.getElementById('close-modal').addEventListener('click', function () {
  document.getElementById('create-board-modal').classList.add('hidden');
});

// 모달 폼 제출
document
  .getElementById('create-board-form')
  .addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('board-name').value;
    const backgroundColor = document.getElementById('board-color').value;
    const description = document.getElementById('board-description').value;

    const accessToken = localStorage.getItem('access_token');
    // Axios를 사용하여 서버에 데이터 전송
    axios
      .post(
        '/board',
        { name, backgroundColor, description },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // 모달 닫기
    document.getElementById('create-board-modal').classList.add('hidden');
  });

function fetchBoards() {
  // 서버에서 보드 데이터 가져오기
  const accessToken = localStorage.getItem('access_token');
  axios
    .get('/boards', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      displayBoards(response.data);
    })
    .catch((error) => console.error('Error fetching boards:', error));
}

// 보드 데이터를 화면에 표시하는 함수
function displayBoards(boards) {
  console.log(boards);
  const boardsContainer = document.querySelector('.flex.flex-wrap.-mx-2');
  boardsContainer.innerHTML = ''; // 기존 보드 데이터 제거

  boards.forEach((board) => {
    const boardElement = document.createElement('div');
    boardElement.className = 'boardGet';
    boardElement.innerHTML = `
      <div class="board-tile m-2 w-64 h-32">
        <span class="mb-3">${board.name}</span>
        <div class="board-button">
          <button class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow">초대</button>
          <button class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow">수정</button>
          <button class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow">삭제</button>
        </div>
      </div>
    `;
    boardsContainer.appendChild(boardElement);
  });
}
