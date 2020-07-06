const debounceFn = (fn, timeout) => {
    let timeOutID;
    return function (...args) {
        if (timeOutID) {
            clearTimeout(timeOutID);
        }
        timeOutID = setTimeout(() => {
            fn(...args);
        }, timeout);
    }
};

const catDate = function (date) {
    return new Date(date).toISOString().slice(0, 16).replace('T', ' ');
};

let searchVal = 'repositories';

async function searchRepositories(currentPage = 1, val = 'repositories', isPagination = false) {
    let lastRequest = `https://api.github.com/search/repositories?q=${val}&sort=stars&order=desc&per_page=10&page=${currentPage}`,
        totalPages,
        result = document.getElementById('tbody');
    let a = await fetch(lastRequest)
        .then(response => response.json())
        .then(json => {
            if (isPagination) {
                totalPages = json.total_count;
                if (totalPages >= 10) {
                    createPaginatin(11);
                } else if (totalPages > 1) {
                    createPaginatin(totalPages);
                } else {
                    createPaginatin('delete');
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
            getRepositories(hrefRepos);
        }
    });
}

function getRepositories(val) {
    let modal = document.getElementById('modal');

    modal.innerHTML = "";
    modal.classList.add('active');

    fetch(val)
        .then(response => response.json())
        .then(json => {
            let description = json.description;
            if (description === null) {
                description = 'нет описании';
            }
            modal.innerHTML = "";
            const card = `
        
          <div class="repos-info">
            <div class="repos-info__img-box">
              <div class="repos-info__img"><img src="${json.owner.avatar_url}" alt=""></div>
              <div class="repos-info__head">
                <span class="repos-info__name">${json.owner.login}</span>
                <span>${catDate(json.updated_at)}</span>
                <span>${json.name}</span>
                <span>${json.stargazers_count}</span>
              </div>
            </div>
            
            <div class="repos-info__des">${description}</div>

            <div class="repos-info__lists">
              <ul class="repos-info__lang-list">
              </ul>
              <ol class="repos-info__cont">
              </ol>
            </div>
            <div class="x" data-close="close">X</div>
          </div>
          `

            modal.insertAdjacentHTML('beforeend', card);
            let langPlace = document.querySelector('.repos-info__lang-list');
            let contPlace = document.querySelector('.repos-info__cont');
            getRepositoriesLang(json.languages_url, langPlace);
            getRepositoriesCont(json.contributors_url, contPlace);
        });
    modal.addEventListener("click", function (e) {
        let modal = document.getElementById('modal');

        let a = e.target.attributes['data-close'].value;
        if (a === 'close') {
            modal.classList.remove('active');
        }
    });
}

function getRepositoriesLang(val, place) {
    fetch(val)
        .then(response => response.json())
        .then(json => {
            console.dir(json);
            Object.keys(json).forEach(function (item) {

                const card = `<li>${item}</li>`

                place.insertAdjacentHTML('beforeend', card);

            })

        });
}


function getRepositoriesCont(val, place) {
    fetch(val)
        .then(response => response.json())
        .then(json => {
            for (let i = 0; i < 10; i++) {

                const cont = `<li>${json[i].login} ${json[i].contributions}</li>`

                place.insertAdjacentHTML('beforeend', cont);
            }

        });
}



function createPaginatin(pages) {
    let pagination = document.getElementById('pagination'),
        currentPage = 1;

    pagination.innerHTML = "";
    if (pages === 'delete') {
        return;
    }
    pagination.insertAdjacentHTML('beforeend', '<button class="pagination__prev" id="prev">prev</button>');
    pagination.insertAdjacentHTML('beforeend', '<ul class="pagination__list" id="pagination__list"></ul>');
    pagination.insertAdjacentHTML('beforeend', '<button class="pagination__next" id="next">next</button>');


    let paginationList = document.getElementById('pagination__list'),
        prev = document.getElementById('prev'),
        next = document.getElementById('next');

    for (let i = 1; i < pages; i++) {
        paginationList.insertAdjacentHTML('beforeend', `<li class="pagination__item" data-num='${i}'>${i}</li>`);
    }
    let paginationItem = document.querySelectorAll('.pagination__item');

    paginationList.addEventListener("click", function (e) {
        let nodeName = e.target.nodeName;
        if (nodeName == 'LI') {
            currentPage = e.target.attributes['data-num'].value;
            // paginationItem.forEach(element => {
            //     element.classList.remove('active');
            // });
            // e.target.classList.add('active');
            chooseActivePage();
            searchRepositories(+currentPage, searchVal);
        }
    });

    function chooseActivePage() {

        paginationItem.forEach(element => {
            element.classList.remove('active');
        });
        document.querySelector(`.pagination__item[data-num="${currentPage}"]`).classList.add('active');
    }

    chooseActivePage();

    function changePrevPage() {
        if (currentPage > 1) {
            currentPage = --currentPage;
            searchRepositories(currentPage, searchVal);
            chooseActivePage();
        }
    }

    function changeNextPage() {
        if (currentPage < pages) {
            currentPage = ++currentPage;
            searchRepositories(currentPage, searchVal);
            chooseActivePage();
        }
    }

    prev.addEventListener("click",
        debounceFn(e => changePrevPage(), 500)
    );

    next.addEventListener("click",
        debounceFn(e => changeNextPage(), 500)
    );
}



function checkInputVal() {
    let searchInput = document.getElementById('search-input');

    searchVal = document.getElementById('search-input').value;

    if (searchVal != '') {
        searchRepositories(1, searchVal, true);
    } else {
        searchRepositories();
    }
    searchInput.addEventListener("input",
        debounceFn(e => checkInputVal(), 1000)
    );
}

checkInputVal();