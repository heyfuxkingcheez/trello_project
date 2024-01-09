// public/script/user-info-edit.js
import { showLoading, hideLoading } from './loading.js';

document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const boardId = urlParams.get('boardId');
  const name = urlParams.get('name');
  const color = urlParams.get('color');
  const description = urlParams.get('description');
  document.title = name;
  document.body.style.backgroundColor = color;
  document.getElementById('boardTitle').innerHTML = `${name} - ${description}`;
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
        <div class="cardList">
          <div class="card" draggable="true">
            <strong>asd</strong><br /><span class="due-date">2024-01-02</span
            ><br /><span class="priority">high</span><br /><span
              class="content"
              >asd</span
            ><br /><button
              class="edit-btn bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow"
              type="button" >
              수정</button
            ><button
              class="delete-btn bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow"
              type="button" >
              삭제
            </button>
          </div>
        </div>
        <div class="centered-content">
          <div class="plus-sign">+ Add Card</div>
        </div>
      </div>
            `;

        columnsList.innerHTML += columnHtml;
      });

      hideLoading();
      deleteAddEventListeners();
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
}
// columnList에 클릭 이벤트 할당
function deleteAddEventListeners() {
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
    }
  });
}
// edit 모달창
function editColumn(columnId) {
  const inputField = document.getElementById('editColumnName');
  const editBtn = document.getElementById('editColumnBtn');
  const closeBtn = document.getElementById('editColumnModalCloseBtn');
  editBtn.addEventListener('click', function (event) {
    event.preventDefault();
    console.log(typeof inputField.value);
    console.log(columnId);
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
// add 모달창열기
document
  .getElementById('addColumn')
  .addEventListener('click', function (event) {
    event.preventDefault();
    addColumnModal.style.display = 'flex';
  });

// add 모달창 닫기
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
