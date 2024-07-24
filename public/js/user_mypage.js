// document.addEventListener("DOMContentLoaded", function () {
//   function addDogInfo(event) {
//     event.preventDefault();

//     // 기존 대표 강아지 정보 필드셋을 복사
//     const originalDogInfo = document.getElementById("dogInfo");
//     const newDogInfo = originalDogInfo.cloneNode(true);

//     // 새로운 필드셋의 아이디를 제거해서 중복되지 않도록 함
//     newDogInfo.id = "";

//     // 복사된 필드셋 내부의 input 요소들의 값을 초기화
//     const inputs = newDogInfo.querySelectorAll("input");
//     inputs.forEach((input) => {
//       if (input.type !== "radio") {
//         input.value = "";
//       }
//       input.checked = false;
//     });

//     const textareas = newDogInfo.querySelectorAll("textarea");
//     textareas.forEach((textarea) => (textarea.value = ""));

//     // '내 강아지 추가' 버튼을 제거
//     const addButton = newDogInfo.querySelector("#add");
//     addButton.remove();

//     // 복사된 필드셋을 기존 대표 강아지 정보 필드셋의 다음에 삽입
//     const coverD = document.getElementById("coverD");
//     coverD.appendChild(newDogInfo);
//   }

//   // 이벤트 리스너 추가
//   document.getElementById("addBtn").addEventListener("click", addDogInfo);
// });
