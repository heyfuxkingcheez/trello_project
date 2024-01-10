// public/script/user-info-edit.js

import { showLoading, hideLoading } from './loading.js';

document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get('boardId');
  const name = urlParams.get('name');
  const color = urlParams.get('color');
  const description = urlParams.get('description');
  document.title = name;
  document.getElementById('boardTitle').innerHTML = `${name} - ${description}`;
  document.getElementById('boardTitle').style.color = color;
  fetchColums(boardId);
});

function fetchColums(boardId) {
  showLoading();
  axios
    .get(`/board/${boardId}/column`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
    .then((response) => {
      const columns = response.data;
      const columnsList = document.getElementById('columnList');
      columnsList.innerHTML = '';
      columns.data.forEach((column) => {
        let columnHtml = `
        <div class="column" >
        <div class="column-header">
          <div class="left-content">${column.name}</div>
          <div class="right-content">
            <button
              type="button"
              class="editColumnButton bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow"
              id="editColunmId${column.id}">
              수정
            </button>
            <button
              type="button"
              class="deleteColumnButton bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow"
              id="deleteColumnId${column.id}">
              삭제
            </button>
          </div>
        </div>
        <div class="cardList" id="cardListId${column.id}">
        </div>
        <div class="flex-container">
        <div class="centered-content">
          <div class="plus-sign" id="addCardBtnId${column.id}">+ Add Card</div>
        </div>
        <div class="button-container">
          <button
            type="button"
            class="leftColumnButton bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow"
            id="leftColumnId${column.id}">
            <
          </button>
          <button
            type="button"
            class="rightColumnButton bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow"
            id="rightColunmId${column.id}">
            >
          </button>
        </div>
      </div>
      </div>
            `;

        columnsList.innerHTML += columnHtml;

        axios
          .get(`/board/${boardId}/column/${column.id}/cards`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          })
          .then((cardResponse) => {
            const cardList = document.getElementById(`cardListId${column.id}`);
            cardList.innerHTML = '';

            cardResponse.data.cards.forEach((card) => {
              let cardHtml = `
                <div class="card" draggable="true"  style="border: 4px solid ${card.color}">
                  <strong> ${card.name}</strong><br />
                  <span class="due-date">마감일: ${card.dueDate}</span><br />
              
                  <button
                    class="card-detail-btn bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow"
                    type="button"
                    data-card-detail-column-id="${column.id}"
                    data-card-detail-color="${card.color}"
                    id="cardDetailId${card.id}">
                    상세보기
                  </button>
                  <button
                    class="delete-btn bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow"
                    type="button"
                    data-delete-card-column-id="${column.id}"
                    id="deleteCardId${card.id}">
                   삭제
                  </button>
                </div>
              `;

              cardList.innerHTML += cardHtml;
            });
          })
          .catch((error) => {
            alert(error.response.data.message);
          });
      });
      addEventListenerColumnList();

      hideLoading();
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
}
// columnList에 클릭 이벤트 할당
function addEventListenerColumnList() {
  const columnsList = document.getElementById('columnList');

  columnsList.addEventListener('click', function (event) {
    const targetId = event.target.id;
    if (targetId.indexOf('deleteColumnId') != -1) {
      const columnId = targetId.replace('deleteColumnId', '');
      deleteColumn(columnId);
    } else if (targetId.indexOf('editColunmId') != -1) {
      const columnId = targetId.replace('editColunmId', '');
      document.getElementById('editColumnModal').style.display = 'flex';
      editColumn(columnId);
    } else if (targetId.indexOf('addCardBtnId') != -1) {
      const columnId = targetId.replace('addCardBtnId', '');
      document.getElementById('addCardModal').style.display = 'flex';
      addCard(columnId);
    } else if (targetId.indexOf('deleteCardId') != -1) {
      const cardId = targetId.replace('deleteCardId', '');
      const columnId = event.target.dataset.deleteCardColumnId;
      deleteCard(cardId, columnId);
    } else if (targetId.indexOf('cardDetailId') != -1) {
      const cardId = targetId.replace('cardDetailId', '');
      const columnId = event.target.dataset.cardDetailColumnId;
      const cardColor = event.target.dataset.cardDetailColor;
      console.log(cardId, columnId, cardColor);
    } else if (targetId.indexOf('leftColumnId') != -1) {
      const columnId = targetId.replace('leftColumnId', '');
      leftColumn(columnId);
    } else if (targetId.indexOf('rightColunmId') != -1) {
      const columnId = targetId.replace('rightColunmId', '');
      rightColumn(columnId);
    }
  });
}
// 컬럼 이동
function leftColumn(columnId) {
  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get('boardId');
  const accessToken = localStorage.getItem('access_token');
  axios
    .patch(
      `/board/${boardId}/column/moveBtn/${columnId}`,
      { moveBtn: 'left' },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )
    .then(() => {
      alert('컬럼 왼쪽으로 이동 완료');
      window.location.reload();
    })
    .catch((error) => {
      alert(error.response.data.message);
      console.error('Error:', error);
    });
}
function rightColumn(columnId) {
  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get('boardId');
  const accessToken = localStorage.getItem('access_token');
  axios
    .patch(
      `/board/${boardId}/column/moveBtn/${columnId}`,
      { moveBtn: 'right' },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )
    .then(() => {
      alert('컬럼 오른쪽으로 이동 완료');
      window.location.reload();
    })
    .catch((error) => {
      alert(error.response.data.message);
      console.error('Error:', error);
    });
}

// 카드 삭제
function deleteCard(cardId, columnId) {
  console.log(cardId, columnId);
  if (!confirm('이 카드을 삭제하시겠습니까?')) {
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get('boardId');
  const accessToken = localStorage.getItem('access_token');
  axios
    .delete(`/board/${boardId}/column/${columnId}/card/${cardId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then(() => {
      alert('컬럼 삭제 완료');
      window.location.reload();
    })
    .catch((error) => {
      alert(error.response.data.message);
      console.error('Error:', error);
    });
}
// 카드 add 모달창
function addCard(columnId) {
  const addCardName = document.getElementById('addCardName');
  const addCardDescription = document.getElementById('addCardDescription');
  const addCardColor = document.getElementById('addCardColor');
  const addCardDate = document.getElementById('addCardDate');
  const addCardBtn = document.getElementById('addCardBtn');
  const addCardModalCloseBtn = document.getElementById('addCardModalCloseBtn');
  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get('boardId');
  addCardBtn.addEventListener('click', function (event) {
    event.preventDefault();
    const accessToken = localStorage.getItem('access_token');
    axios
      .post(
        `/board/${boardId}/column/${columnId}/card`,
        {
          name: addCardName.value,
          description: addCardDescription.value,
          color: addCardColor.value,
          dueDate: addCardDate.value,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
      .then((response) => {
        alert(response.data.message);
        window.location.reload();
      })
      .catch((error) => {
        alert(error.response.data.message);
        console.error('Error:', error);
      });
  });
  addCardModalCloseBtn.addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById('addCardModal').style.display = 'none';
    addCardName.value = '';
    addCardDescription.value = '';
    addCardColor.value = '';
  });
}
// 컬럼 edit 모달창
function editColumn(columnId) {
  const inputField = document.getElementById('editColumnName');
  const editBtn = document.getElementById('editColumnBtn');
  const closeBtn = document.getElementById('editColumnModalCloseBtn');
  editBtn.addEventListener('click', function (event) {
    event.preventDefault();
    const accessToken = localStorage.getItem('access_token');
    axios
      .patch(
        `/column/${columnId}`,
        { name: inputField.value },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
      .then((response) => {
        alert(response.data.message);
        window.location.reload();
      })
      .catch((error) => {
        alert(error.response.data.message);
        console.error('Error:', error);
      });
  });
  closeBtn.addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById('editColumnModal').style.display = 'none';
    document.getElementById('editColumnName').value = '';
  });
}

// 컬럼 삭제
function deleteColumn(columnId) {
  if (!confirm('이 컬럼을 삭제하시겠습니까?')) {
    return;
  }

  const accessToken = localStorage.getItem('access_token');
  axios
    .delete(`/column/${columnId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then(() => {
      alert('컬럼 삭제 완료');
      window.location.reload();
    })
    .catch((error) => {
      alert(error.response.data.message);
      console.error('Error:', error);
    });
}
// 컬럼 add 모달창열기
document
  .getElementById('addColumn')
  .addEventListener('click', function (event) {
    event.preventDefault();
    addColumnModal.style.display = 'flex';
  });

// 컬럼 add 모달창 닫기
document
  .getElementById('addColumnModalCloseBtn')
  .addEventListener('click', function (event) {
    event.preventDefault();
    addColumnModal.style.display = 'none';
    document.getElementById('addColumnName').value = '';
  });

// 컬럼 생성
document
  .getElementById('addColumnForm')
  .addEventListener('submit', function (event) {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const boardId = urlParams.get('boardId');
    const columnName = document.getElementById('addColumnName').value;
    axios
      .post(
        `/board/${boardId}/column`,
        { name: columnName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        },
      )
      .then((response) => {
        console.log(response.data);
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        alert(error.response.data.message);
      })
      .finally(() => {
        addColumnModal.style.display = 'none';
        document.getElementById('addColumnName').value = '';
      });
  });
