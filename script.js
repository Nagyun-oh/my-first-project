const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');

const colorPicker = document.getElementById("colorPicker");
const clearButton = document.getElementById("clearButton");

const lineWidthInput = document.getElementById("lineWidth");
const widthValue = document.getElementById("widthValue");

// --- undo / redo  변수 --- 
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");

const undoStack =[];  // 과거 저장 
const redoStack = []; // 되돌리면서 밀려난 현재 상태 저장
const MAX_HISTORY = 50; // 너무 커지지 않게 제한

// ------------------------

let isDrawing = false; 
let lastX = 0;
let lastY = 0;

// --------초기 설정-------------

//배경을 흰색으로 채우는 함수
function fillCanvasWhite(){
    
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,canvas.width,canvas.height);
}
fillCanvasWhite();
saveState(); // 처음 상태 저장

ctx.lineCap = "round";
ctx.lineJoin = "round"; // 선이 꺾일 때 부드럽게 처리

// --------------------------------------


// ----------그림 그리기 관련 이벤트---------

function draw(event){
    if(!isDrawing) return;

    // 그릴 때마다 설정값을 가져오면 색상/두께 변경이 반영됩니다.
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = lineWidthInput.value;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(event.offsetX,event.offsetY);
    ctx.stroke();
    [lastX,lastY] = [event.offsetX,event.offsetY];
}

function startDrawing(event){
    saveState(); // 그리기 전에 현재 상태 저장
    isDrawing = true;
    [lastX,lastY] = [event.offsetX,event.offsetY];
}

function stopDrawing(){
    isDrawing = false;
    ctx.beginPath(); // 이전 경로와 연결되지 않도록 초기화
}

canvas.addEventListener("mousedown",startDrawing);
canvas.addEventListener("mousemove" , draw );
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout",stopDrawing);

// --------------------------------------

// ---------------clear 버튼 ---------------
clearButton.addEventListener("click",() =>{
    saveState(); // clear 전 상태 저장 
    ctx.clearRect(0,0,canvas.width,canvas.height) // 캔버스 전체 초기화
    fillCanvasWhite(); // 다시 흰색으로 채우기
})

lineWidthInput.addEventListener("input", () => {
    widthValue.textContent = lineWidthInput.value;
});
// -------------------------------------------


// ---------------지우기 버튼 이벤트 처리--------------------
const eraserButton = document.getElementById("eraserButton");
let isEraser = false; // 현재 지우개 모드인지 확인하는 변수

// 지우개 버튼 클릭 이벤트
eraserButton.addEventListener("click",()=>{
    isEraser = !isEraser; // 모드 전환

    if(isEraser){
        ctx.globalCompositeOperation = "destination-out";
        eraserButton.textContent ="그리기 모드";
        eraserButton.style.backgroundColor = "#ffccc"; // 시각적 피드백

        canvas.classList.add("eraser-cursor");

    } else{
        //다시 기본 그리기 모드로 복구
        ctx.globalCompositeOperation = "source-over";
        eraserButton.textContent = "지우개";
        eraserButton.style.backgroundColor = "";
        canvas.classList.remove("eraser-cursor");
    }
});

// -------------------------------------------


// ----------저장 버튼 이벤트 처리--------------

// 저장하기
const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click",() =>{
    // 1. 캔서의 내용을 이미지 데이터로 추출
    const image = canvas.toDataURL("image/png");
    // 2. 가상의 링크 태그 생성
    const link = document.createElement("a");
    link.href = image;
    link.download = "my-drawing.png"; //저장될 파일 이름
    // 3. 링크 클릭
    link.click();
});

// 다른이름으로 저장하기 버튼
const saveAsButton = document.getElementById("saveAsButton");

saveAsButton.addEventListener("click",()=>{
    // 1. 사용자에게 파일 이름 입력받기
    const fileName = prompt("저장할 파일 이름을 입력하세요: ","my-drawing");
    // 취소 버튼을 눌렀을 경우 함수 종료
    if(fileName==null)return;
    // 2. 캔버스 데이터 추출
    const image = canvas.toDataURL("image/png");
    // 3. 가상의 링크 생성
    const link = document.createElement("a");
    link.href = image;
    // 4. 입력받은 이름으로 파일명 설정
    link.download = `${fileName}.png`;
    // 5. 다운로드 실행
    link.click();
});

// -------------------------------------------

// ---------------- undo / redo ---------

//------- 현재 그림판 상태 저장------
function saveState(){
    //현재 캔버스 상태를 저장
    const data = ctx.getImageData(0,0,canvas.width,canvas.height);
    undoStack.push(data);

    // 새로 그리기 시작하면 redo는 의미 없으므로 비우기
    redoStack.length = 0;

    // 히스토리 제한
    if(undoStack.length > MAX_HISTORY)undoStack.shift();

    updateHistoryButtons();
}

// 복원 : 이전에 저장해둔 픽셀을 캔버스에 덮어쓰기 
function restoreState(imageData){
    ctx.putImageData(imageData,0,0);
}

function updateHistoryButtons(){
    if(undoButton) undoButton.disabled = (undoStack.length == 0);
    if(redoButton) redoButton.disabled = (redoStack.length == 0);
}

// 되돌리기 버튼 클릭시 이벤트 처리
if(undoButton){
    undoButton.addEventListener("click", ()=>{
        if(undoStack.length==0)return;

        // 현재 상태를 redo로 보내고, undo에서 하나 꺼내서 복원
        const current = ctx.getImageData(0,0,canvas.width,canvas.height);
        redoStack.push(current);

        //이전 캔버스를 덮어쓰기, 즉 되돌리기 수행
        const prev = undoStack.pop();
        restoreState(prev);

        updateHistoryButtons();
    });
}

// 다시하기 버튼 클릭시 이벤트 처리
if(redoButton){
    redoButton.addEventListener("click", ()=>{
        if(redoStack.length==0)return;

        // 현재 상태를 undo로 보내고, redo에서 하나 꺼내서 복원
        const current = ctx.getImageData(0,0,canvas.width,canvas.height);
        undoStack.push(current);

        const next = redoStack.pop();
        restoreState(next);

        updateHistoryButtons();
    });
}

// ---------------------------------------------

// ----------- undo/redo 단축키 추가 -----------
document.addEventListener("keydown",(event)=>{
    const isCtrl = event.ctrlKey || event.metaKey; // widows: ctrl , mac : cmd

    if(!isCtrl)return;

    // Ctrl + z ( Undo )
    if(event.key =="z" || event.key == "Z"){
        event.preventDefault(); // 브라우저 기본 undo 방지

        if(event.shiftKey){
            // Cmd + Shift  +z ( Mac redo)
            if(redoButton && !redoButton.disabled){
                redoButton.click();
            }
        }
        else{
            // Ctrl + Z (undo)
            if(undoButton && !undoButton.disabled){
                undoButton.click();
            }
        }
    }

    // Ctrl + Y (Redo - windows)
    if(event.key =="y" || event.key =="Y"){
        event.preventDefault();

        if(redoButton && !redoButton.disabled){
            redoButton.click();
        }
    }
});

// --------------------------------------------------------------

//------------- 새로고침/닫기 시 확인창 띄우기-----------------------
let isDirty = false; // 변경사항 있는지 (그림이 바뀌었는지)

function markDirty(){
    isDirty = true;
}

// 그림 그리기 시작할 때 변경 표시
canvas.addEventListener("mousedown",markDirty);

// clear 할때도 변경 표시
clearButton.addEventListener("click",markDirty);

window.addEventListener("beforeunload",(e)=>{
    if(!isDirty) return; // 바뀐게 없으면 확인창 x
    e.preventDefault();
    e.returnValue = "";
});


// --------------------------------------------------------------