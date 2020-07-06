function searchRepositories(num = 1, val = 'repositories' ) {
    let lastRequest = `https://api.github.com/search/repositories?q=${val}'&sort=stars&order=desc&per_page=10&page=${num}`;
    result.innerHTML = "";

    let totalRepositories = 0;

    fetch(lastRequest)
        .then(response => response.json())
        .then(json => {
            totalRepositories = json.total_count;
            totalPages = totalRepositories / 10;
            if (pagBoolen && totalPages > 1) {
                createPaginatin();
                pagBoolen = false;
            }
            if (totalRepositories != 0) {
                json.items.map(function (item) {
                    const html = `
          <tr class="list__item">
            <td class="list__name"><span data-href="${item.url}" class="list__link"  target="_blank">${item.name}</span></td>
            <td class="list__starts">${item.stargazers_count}</td>
            <td class="list__date">${catDate(item.updated_at)}</td>
            <td><a href="${item.html_url}" class="list__link"  target="_blank">Репозиторий</a></td>
          </tr>`

                    result.insertAdjacentHTML('beforeend', html);
                });
            } else {
                searchRepositories();
                pagination.classList.remove("active");
            }

        });
}