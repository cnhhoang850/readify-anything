
const urlMatcher = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig

function cleanURL(url) {
    for(let i = 0; i < url.length; i++) {
        console.log(url[i])
        if (url[i] == '?') {
            url = url.slice(0, i)
            break
        }
    }
    return url
}

//check for search query in URL everytime page load 

const fetchAWS = async (url) => {
    const headers = {
    'url': url,
    'access-control-allow-origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Content-type': 'application/json',
    headers: {
        'url': url
    }
    }
    
    let result 
    await fetch('https://ojr5mvb7c5.execute-api.us-east-1.amazonaws.com/prod/-getarticle', headers)
        .then(res => res.json())
        .then(data => {
            result = JSON.parse(data)
            console.log(result)
        })
    return result
}

async function handleLoad() {
    let query = window.location.search
    query = query.slice(1, query.length)
    query = cleanURL(query)

    if (query == "") {
        let root = document.querySelector('#root')
        root.innerHTML = `<div class="main">
        <h1 id="welcome-h1">
            Readify
        </h1>
        <div>
            <input 
            type="search" 
            id="searchBar" 
            name="url"
            placeholder="Input url..."
        >
        <button onclick="route()">Extract</button>
        </div>
        <span id="welcome">
            Input an URL to extract text for easy reading from any page.
        </span>
    </div>`
    return
    }
   
    if (query.match(urlMatcher)) {
        let root = document.querySelector('#root')
        root.innerHTML = `<div class="main"><h1>Loading<span id="one">.</span><span id="two">.</span><span id="three">.</span></h1></div>`
        let result = await fetchAWS(query)
        root.innerHTML = `<h1>${result.title}</h1>` + article(result.text)
    }
    return
}

handleLoad()
window.onpopstate  = handleLoad

const route = async (event) => {
    event = event || window.event
    event.preventDefault() 

    let searchInput = document.querySelector('#searchBar')

    let url = searchInput.value
    url = cleanURL(url)
    if (url == "") {
        window.alert('Please input a url')
        return
    } else if (!url.match(urlMatcher)) {
        window.alert('The url you input is malformed')
        return
    }

    let root = document.querySelector('#root')
    root.innerHTML = `<div class="main"><h1>Loading<span id="one">.</span><span id="two">.</span><span id="three">.</span></h1></div>`
    let result = await fetchAWS(url)
    root.innerHTML = `<h1>${result.title}</h1>` + article(result.text)

    window.history.pushState(
        {}, 
        "",
        '?' + url
    ) 
}

const article = (paragraphs) => {
    let cache = []
    let filter = []
    for (let i = 0; i < paragraphs.length; i++) {
        if(!cache.includes(paragraphs[i])) {
            cache.push(paragraphs[i])
            continue
        } else if (cache.includes(paragraphs[i])) {
            filter.push(paragraphs[i])
        }
    }

    paragraphs = paragraphs.filter(p => {
        return !filter.includes(p)
    })

    console.log(paragraphs)

    const list = paragraphs.map(
        p => {
            return `<p>${p}</p>`
        }
    )

    return list.join('')
}

window.route = route

function changeTheme() {
    let body = document.querySelector('body')
    if (body.classList[0] == "dark") {
        body.className = 'light'
    } else {
        body.className = 'dark'
    }
}

window.changeTheme = changeTheme