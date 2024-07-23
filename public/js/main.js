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

// public/js/main.js