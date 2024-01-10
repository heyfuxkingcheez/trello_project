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
        alert('신규 보드 생성 완료');
        window.location.reload();
        console.log(response);
      })
      .catch((error) => {
        alert(error.response.data.message);
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
    console.log(board);
    const boardElement = document.createElement('div');
    boardElement.className = 'boardGet';
    boardElement.innerHTML = `
      <div class="board-tile m-2 w-64 h-auto" style="border: 1px solid ${board.backgroundColor}">
        <div class="move-board-detail">
          <span class="mb-3">${board.name}</span>
          <span class="mb-3">${board.description}</span>
        </div>
        <div class="board-button mb-3">
          <button class="invite-button bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow">초대</button>
          <button class="edit-button bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow">수정</button>
          <button class="delete-button bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow">삭제</button>
        </div>
      </div>
    `;
    boardsContainer.appendChild(boardElement);

    const inviteButton = boardElement.querySelector('.invite-button');
    inviteButton.addEventListener('click', () => openinviteModal(board));

    const editButton = boardElement.querySelector('.edit-button');
    editButton.addEventListener('click', () => openEditModal(board));

    const deleteButton = boardElement.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => deleteBoard(board.id));

    const boardTile = boardElement.querySelector('.move-board-detail');
    boardTile.addEventListener('click', () => fetchBoardDetails(board.id));
  });
}

// 보드 상세 정보 가져오기 및 상세 페이지로 이동
function fetchBoardDetails(boardId) {
  const accessToken = localStorage.getItem('access_token');
  axios
    .get(`/board/${boardId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((response) => {
      const boardDetails = response.data;
      window.location.href = `board.html?boardId=${boardId}&name=${encodeURIComponent(
        boardDetails.name,
      )}&color=${encodeURIComponent(
        boardDetails.backgroundColor,
      )}&description=${encodeURIComponent(boardDetails.description)}`;
    })
    .catch((error) => console.error('Error fetching board details:', error));
}

// 수정 모달 열기 함수
function openEditModal(board) {
  document.getElementById('edit-board-name').value = board.name;
  document.getElementById('edit-board-color').value = board.backgroundColor;
  document.getElementById('edit-board-description').value = board.description;

  const editForm = document.getElementById('edit-board-form');
  editForm.onsubmit = (e) => submitEditForm(e, board.id);

  document.getElementById('edit-board-modal').classList.remove('hidden');
}

// 수정 폼 제출 함수
function submitEditForm(event, boardId) {
  event.preventDefault();

  const name = document.getElementById('edit-board-name').value;
  const backgroundColor = document.getElementById('edit-board-color').value;
  const description = document.getElementById('edit-board-description').value;

  const accessToken = localStorage.getItem('access_token');
  axios
    .patch(
      `/board/${boardId}`,
      { name, backgroundColor, description },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )
    .then(() => {
      alert('보드 수정 완료');
      window.location.reload();
    })
    .catch((error) => {
      alert(error.response.data.message);
      console.error('Error:', error);
    });
}

// 보드 삭제 함수
function deleteBoard(boardId) {
  if (!confirm('이 보드를 삭제하시겠습니까?')) {
    return;
  }

  const accessToken = localStorage.getItem('access_token');
  axios
    .delete(`/board/${boardId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then(() => {
      alert('보드 삭제 완료');
      window.location.reload();
    })
    .catch((error) => {
      alert(error.response.data.message);
      console.error('Error:', error);
    });
}

//각 보드에 초대하기 초대하면 초대하는 유저 입력할 수 있는 모달창이 뜬다.
function openinviteModal(board) {
  const invitedForm = document.getElementById('create-invite-board-form');
  invitedForm.onsubmit = (e) => submitInvitedForm(e, board.id);
  document
    .getElementById('create-invite-board-modal')
    .classList.remove('hidden');
}

// 모달 닫기
document
  .getElementById('invite-board-close-modal')
  .addEventListener('click', function () {
    document
      .getElementById('create-invite-board-modal')
      .classList.add('hidden');
  });

function submitInvitedForm(event, board_id) {
  event.preventDefault();

  const email = document.getElementById('create-invite-board-email').value;

  const accessToken = localStorage.getItem('access_token');
  axios
    .post(
      `/board-invitations`,
      { email, board_id },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )
    .then(() => {
      alert('초대 완료');
      window.location.reload();
    })
    .catch((error) => {
      alert(error.response.data.message);
      console.error('Error:', error);
    });
}

// 내 초대확인 모달 열기
document
  .getElementById('open-view-invited-modal')
  .addEventListener('click', function () {
    document.getElementById('view-invited-modal').classList.remove('hidden');
    //displayInvitedBoard 실행
    const accessToken = localStorage.getItem('access_token');
    axios
      .get('/board-invitations', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        const invitations = response.data;
        displayInvitedBoard(invitations);
        hideLoading();
      })
      .catch((error) => {
        alert(`실패하였습니다..  ${error}`);
        window.location.href = '/user-my-page.html';
        console.error('초대 확인을 하는 도중 오류가 발생하였습니다:', error);
        hideLoading();
        // 오류 처리
      });
  });

// 모달 닫기
document
  .getElementById('invited-close-modal')
  .addEventListener('click', function () {
    document.getElementById('view-invited-modal').classList.add('hidden');
  });

function displayInvitedBoard(invite) {
  console.log(invite);
  const invitedContainer = document.getElementById('view-invited-board');
  invitedContainer.innerHTML = ''; // 기존 보드 데이터 제거

  if (invite.length === 0) {
    const invitedElement = document.createElement('div');
    invitedElement.innerHTML = `
    <div class="board-tile m-2 w-64 h-auto mx-auto" style="border: 1px solid">
      <span class="mb-3">현재 초대받은 보드가 없습니다.</span>
    </div>
    `;
    invitedContainer.appendChild(invitedElement);
  }
  invite.forEach((invite) => {
    console.log(invite);
    const invitedElement = document.createElement('div');
    invitedElement.className = 'invitedGet';
    invitedElement.innerHTML = `
      <div class="board-tile m-2 w-64 h-auto mx-auto" style="border: 1px solid">
        <span class="mb-3">${invite.board_name}</span>
        <span class="mb-3">${invite.board_owner}</span>
        <span class="mb-3">${invite.board_description}</span>
        <div class="invited-button mb-3">
          <button class="accept-button bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow">수락</button>
          <button class="decline-button bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow">거절</button>
        </div>
      </div>
    `;
    invitedContainer.appendChild(invitedElement);

    const acceptButton = invitedElement.querySelector('.accept-button');
    acceptButton.addEventListener('click', () => {
      accepteInvite(invite.id);
      document.getElementById('view-invited-modal').classList.add('hidden');
    });

    const declineButton = invitedElement.querySelector('.decline-button');
    declineButton.addEventListener('click', () => {
      declineInvite(invite.id);
      document.getElementById('view-invited-modal').classList.add('hidden');
    });
  });
}

//승낙버튼 눌렀을때
function accepteInvite(invitedId) {
  //
  const accessToken = localStorage.getItem('access_token');
  axios
    .patch(
      `/board-invitations/${invitedId}`,
      { status: 'accepted' },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )
    .then((response) => {
      alert(`초대에 승낙하였습니다.`);
      window.location.href = '/user-my-page.html';
      hideLoading();
    })
    .catch((error) => {
      alert(`실패하였습니다..  ${error}`);
      window.location.href = '/user-my-page.html';
      console.error('초대 확인을 하는 도중 오류가 발생하였습니다:', error);
      hideLoading();
      // 오류 처리
    });
}
//거절버튼 눌렀을때
function declineInvite(invitedId) {
  const accessToken = localStorage.getItem('access_token');
  axios
    .patch(
      `/board-invitations/${invitedId}`,
      { status: 'declined' },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )
    .then((response) => {
      alert(`초대를 거절하였습니다.`);
      window.location.href = '/user-my-page.html';
      hideLoading();
    })
    .catch((error) => {
      alert(`실패하였습니다..  ${error}`);
      window.location.href = '/user-my-page.html';
      console.error('초대 확인을 하는 도중 오류가 발생하였습니다:', error);
      hideLoading();
      // 오류 처리
    });
}
