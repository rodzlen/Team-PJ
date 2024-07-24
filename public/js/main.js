function handleSearch(event) {
    const searchInput = event.target.value;

    fetch(`/search?keyword=${encodeURIComponent(searchInput)}`) 
        .then(response => response.json())
        .then(data => {
            console.log(data); 
        })
        .catch(error => {
            console.error('검색 요청에 실패했습니다:', error);
        });
}

<<<<<<< HEAD
// public/js/main.js
=======
// public/js/main.js
>>>>>>> fe90f50597d7b1072b4b1b995403af6ba73c57ab
