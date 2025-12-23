const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById("colorPicker");
const clearButton = document.getElementById("clearButton");

const lineWidthInput = document.getElementById("lineWidth");
const widthValue = document.getElementById("widthValue");

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