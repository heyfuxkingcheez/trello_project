// public/script/user-info-edit.js
import { showLoading, hideLoading } from './loading.js';

let draggedCard = null;
let originColumn = null;

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
        <div class="column" data-column-id="${column.id}" >
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
              const formattedDueDate = card.dueDate.slice(0, 19);
              let cardHtml = `
                <div class="card" draggable="true" data-card-id="${card.id}"  style="border: 4px solid ${card.color}">
                  <strong> ${card.name}</strong><br />
                  <span class="due-date">마감일: ${formattedDueDate}</span><br />
              
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
          .then(() => {
            // 카드가 모두 추가된 후에 드래그 앤 드롭 설정
            setupDragAndDrop();
          })
          .catch((error) => {
            alert(error.response.data.message);
            hideLoading();
            window.location.href = '/user-login.html';
          });
      });
      addEventListenerColumnList();
      hideLoading();
    })
    .catch((error) => {
      alert(error.response.data.message);
      hideLoading();
      window.location.href = '/user-login.html';
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
      document.getElementById('detailCardModal').style.display = 'flex';
      detailCard(cardId);
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

// 카드 상세 보기
function detailCard(cardId) {
  showLoading();
  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get('boardId');
  const accessToken = localStorage.getItem('access_token');

  axios
    .get(`/board/${boardId}/card/${cardId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((response) => {
      const data = response.data;
      console.log(data.card);
      const cardDetail = document.getElementById(`detailCardModal`);
      const formattedDueDate = data.card.dueDate.slice(0, 19);
      console.log(formattedDueDate);

      cardDetail.innerHTML = '';

      let cardDetailHtml = `
      <div class="modal-content" id="detailCard" style="border: 4px solid ${data.card.color}">
        <form id="detailCardForm">
      <div id="card-color${data.card.id}" class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">카드 색상</label>
      <input type="color" id="detailCardColor${data.card.id}" value="${data.card.color}" class="shadow border rounded py-2 px-3 w-full" />
    </div>

    <div id="card-name${data.card.id}" class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">카드 제목</label>
      <input id="detailCardName${data.card.id}" value="${data.card.name}" class="shadow border rounded py-2 px-3 w-full">
    </div>
    <div id="card-content${data.card.id}" class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">카드 내용</label>
      <input id="detailCardDescription${data.card.id}" value="${data.card.description}" class="shadow border rounded py-2 px-3 w-full"></input>
    </div>
    <div id="card-worker${data.card.id}" class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2">작업자</label>
    <select id="worker-select${data.card.id}" onchange="selectWorkerFunc(this, ${cardId}, ${boardId})" class="border border-gray-300 rounded-md" name="worker-list">
    <option>선택해주세요</option>
    </select>
    <div id="worker${data.card.id}">
    </div>
    </.div>
    <div id="card-deadline${data.card.id}" class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">마감 기한 </label><span>${data.card.status}</span>
      <input id="detailCardDeadLine${data.card.id}" value="${formattedDueDate}" type="datetime-local" class="shadow border rounded py-2 px-3 w-full" />
    </div>

    <div id="card-comment${data.card.id}" class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">Comments</label>
      <input id="detailCardComment${data.card.id}" type="text" class="shadow border rounded py-2 px-4 w-200" />
      <button id="cardDetailCommentBtn${data.card.id}" type="button"
      class="ml-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      등록
    </button>
    <div id="comment${data.card.id}" class="mb-4">
    </div>
    </div>
    
    <button type="button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      id="cardDetailEditBtn${data.card.id}">
      수정
    </button>
    <button id="cardDetailModalCloseBtn${data.card.id}" type="button"
      class="ml-1 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
      닫기
    </button>
    </form>
      </div>
              `;
      hideLoading();
      cardDetail.innerHTML += cardDetailHtml;

      // 작업자 get
      axios
        .get(`board/${boardId}/card/${cardId}/worker`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          const workers = response.data.worker;
          console.log(workers);
          const cardDetailWorker = document.getElementById(`worker${cardId}`);
          cardDetailWorker.innerHTML = '';

          workers.forEach((worker) => {
            let cardDetailHtml = `
            <span id="detailCardWorker${worker.id}" class="shadow border rounded py-2 px-3 w-full">${worker.username}</span>
            <button id="WorkerDeleteBtn${worker.id}" data-card-worker-id="${cardId}">x</button>
            `;

            cardDetailWorker.innerHTML += cardDetailHtml;
          });
        })
        .catch((error) => {
          alert(error.response.data.message);
          console.error('Error:', error);
        });

      // 보드 사용자 list get
      axios
        .get(`/board/${boardId}/worker`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          const worker = response.data.existedWokerAtBoard;
          const cardDetailWorkerSelect = document.getElementById(
            `worker-select${cardId}`,
          );
          // cardDetailWorkerSelect.innerHTML = '';
          worker.forEach((worker) => {
            let selectWorkerHTML = `
            <option id="option${cardId}" value="${worker.id}">${worker.username}</option>
            `;
            cardDetailWorkerSelect.innerHTML += selectWorkerHTML;
          });
        })
        .catch((error) => {
          alert(error.response.data.message);
          console.error('Error:', error);
        });

      // 댓글 get
      axios
        .get(`/board/${boardId}/card/${cardId}/comment`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          const data = response.data.getComments;
          const cardDetailComment = document.getElementById(`comment${cardId}`);
          cardDetailComment.innerHTML = '';
          data.forEach((comment) => {
            console.log(comment);

            let commentHtml = `
            <span>${
              comment.user.username
            }</span>  <span>${comment.createdAt.slice(
              0,
              10,
            )}</span> <button class="deleteColumnButton bg-whi te hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow" data-comment-card-id="${cardId}" id="comment${
              comment.id
            }">삭제</button>
            <p>${comment.text}</p>
            `;
            cardDetailComment.innerHTML += commentHtml;
          });
        })
        .catch((error) => {
          alert(error.response.data.message);
          console.error('Error:', error);
        });
    })
    .catch((error) => {
      alert(error.response.data.message);
      console.error('Error:', error);
    });
  addEventListenerCardDetailBtn();
  // 위에 html 삽입 되고 나서 동작하게 비동기 처리...
  setTimeout(() => {
    // 모달 닫기
    const cardDetailModalCloseBtn = document.getElementById(
      `cardDetailModalCloseBtn${cardId}`,
    );
    cardDetailModalCloseBtn.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById(`detailCardModal`).style.display = 'none';
    });

    // 모달 수정
    const cardDetailModalEditBtn = document.getElementById(
      `cardDetailEditBtn${cardId}`,
    );
    cardDetailModalEditBtn.addEventListener('click', (event) => {
      event.preventDefault();
      console.log(`수정 클릭 ==> ${cardId}`);
      const color = document.getElementById(`detailCardColor${cardId}`).value;
      const description = document.getElementById(
        `detailCardDescription${cardId}`,
      ).value;
      const dueDate = document.getElementById(
        `detailCardDeadLine${cardId}`,
      ).value;
      const title = document.getElementById(`detailCardName${cardId}`).value;

      editCard(boardId, cardId, title, color, description, dueDate);
    });

    // 댓글 등록
    const cardDetailCommentBtn = document.getElementById(
      `cardDetailCommentBtn${cardId}`,
    );
    cardDetailCommentBtn.addEventListener('click', (event) => {
      event.preventDefault();
      console.log('댓글 등록 버튼!', cardId);
      const text = document.getElementById(`detailCardComment${cardId}`).value;
      commentCard(boardId, cardId, text);
    });
  }, 100);
}

// 카드 상세 클릭 이벤트
function addEventListenerCardDetailBtn() {
  const cardDetailList = document.getElementById('detailCardModal');

  cardDetailList.addEventListener('click', (event) => {
    event.preventDefault();
    const targetId = event.target.id;
    if (targetId.indexOf('WorkerDeleteBtn') !== -1) {
      const workerId = targetId.replace('WorkerDeleteBtn', '');
      const cardId = event.target.dataset.cardWorkerId;
      console.log(workerId, cardId);
      deleteWorker(+workerId, +cardId);
    } else if (targetId.indexOf('comment') !== -1) {
      const commentId = targetId.replace('comment', '');
      const cardId = event.target.dataset.commentCardId;
      console.log(commentId, cardId);
      comentDelete(+commentId, +cardId);
    }
  });
}

// 작업자 삭제
function deleteWorker(workerId, cardId) {
  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get('boardId');
  const accessToken = localStorage.getItem('access_token');
  console.log(accessToken);
  axios
    .delete(`/board/${boardId}/card/${cardId}/worker/${workerId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((response) => {
      alert(response.data.message);
      window.location.reload();
    })
    .catch((error) => {
      alert(error.response.data.message);
      console.error('Error:', error);
    });
}

// 카드 수정
function editCard(boardId, cardId, title, color, description, dueDate) {
  showLoading();
  console.log('잘 들어옴', color);
  const accessToken = localStorage.getItem('access_token');
  axios
    .patch(
      `/board/${boardId}/card/${cardId}`,
      {
        name: title,
        description: description,
        color: color,
        dueDate: dueDate,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )
    .then((response) => {
      hideLoading();
      alert(response.data.message);
      window.location.reload();
    })
    .catch((error) => {
      hideLoading();
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

// 카드 댓글 등록
function commentCard(boardId, cardId, text) {
  const accessToken = localStorage.getItem('access_token');
  showLoading();
  axios
    .post(
      `/board/${boardId}/card/${cardId}/comment`,
      {
        text: text,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )
    .then((response) => {
      hideLoading();
      alert(response.data.message);
      window.location.reload();
    })
    .catch((error) => {
      hideLoading();
      alert(error.response.data.message);
      console.error('Error:', error);
    });
}

// 댓글 삭제
function comentDelete(commentId, cardId) {
  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get('boardId');
  const accessToken = localStorage.getItem('access_token');
  showLoading();
  axios
    .delete(`/board/${boardId}/card/${cardId}/comment/${commentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((response) => {
      hideLoading();
      alert(response.data.message);
      window.location.reload();
    })
    .catch((error) => {
      hideLoading();
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

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
  const cards = document.querySelectorAll('.card');
  const columns = document.querySelectorAll('.column');

  // 카드에 대한 이벤트 리스너 설정
  cards.forEach((card) => {
    card.setAttribute('draggable', true);
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
  });

  // 컬럼에 대한 이벤트 리스너 설정
  columns.forEach((column) => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('drop', handleDrop);
  });
  console.log('너 동작은 하니?');
}

// 드래그 시작 시 호출
function handleDragStart(event) {
  draggedCard = event.target;
  originColumn = draggedCard.closest('.column');
  console.log('Drag Start:', draggedCard);
}

// 드래그 종료 시 호출
function handleDragEnd() {
  console.log('Drag End');
  draggedCard = null;
  originColumn = null;
}

// 드래그 오버 시 호출
function handleDragOver(event) {
  event.preventDefault();
  console.log('Drag Over');
}
// 드롭 시 호출
function handleDrop(event) {
  event.preventDefault();
  const targetColumn = event.target.closest('.column');
  const targetCardList = targetColumn.querySelector('.cardList');

  if (targetCardList && draggedCard) {
    const cards = Array.from(targetCardList.children);
    const droppedIndex = cards.indexOf(event.target.closest('.card'));

    targetCardList.insertBefore(draggedCard, cards[droppedIndex]);

    updateCardPosition(draggedCard, originColumn, targetColumn, droppedIndex);
    console.log('Drop:', draggedCard);
  }
}

function updateCardPosition(card, originColumn, newColumn, newIndex) {
  const cardId = card.getAttribute('data-card-id');
  const originColumnId = originColumn.getAttribute('data-column-id');
  const newColumnId = newColumn.getAttribute('data-column-id');

  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get('boardId');
  const accessToken = localStorage.getItem('access_token');

  if (newColumnId !== originColumnId) {
    // 다른 컬럼으로 이동
    axios
      .patch(
        `/board/${boardId}/column/${originColumnId}/cardMove/${cardId}`,
        { destinationColumnId: newColumnId },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
      .then(() => console.log('Card moved successfully'))
      .catch((error) => console.error('Error moving card', error));
  } else {
    // 같은 컬럼 내에서 위치 변경
    const newOrder = newIndex; // 서버에 보낼 새 순서는 드롭된 인덱스 + 1

    console.log(
      boardId,
      'boardId',
      newColumnId,
      'columnId',
      cardId,
      'cardId',
      newOrder,
      'newOrder',
    );
    axios
      .patch(
        `/board/${boardId}/column/${newColumnId}/cardOrder`,
        { cardId: cardId, newOrder: newOrder },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
      .then(() => console.log('Card order updated successfully'))
      .catch((error) => console.error('Error updating card order', error));
  }
}
