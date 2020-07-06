export default function searchRepositories(num = 1, val = 'repositories', pag = false, fn = 'getRepositories', fun = 'createPaginatin') {
    const catDate = function (date) {
        return new Date(date).toISOString().slice(0, 16).replace('T', ' ');
    };
    let lastRequest = `https://api.github.com/search/repositories?q=${val}&sort=stars&order=desc&per_page=10&page=${num}`,
        totalPages,
        result = document.getElementById('tbody');
    fetch(lastRequest)
        .then(response => response.json())
        .then(json => {
            if (pag) {
                totalPages = json.total_count;
                if (totalPages >= 10) {
                    fun(11);
                } else if (totalPages > 1) {
                    fun(totalPages);
                }
            }
            if (json.total_count > 0) {
                result.innerHTML = "";
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
            }

        });
    result.addEventListener("click", function (e) {
        let hrefRepos = e.target.attributes['data-href'].value;
        if (hrefRepos) {
            fn(hrefRepos);
        }
    });
}