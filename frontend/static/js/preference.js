let user
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

const loadUser = async () => {
    try {
        const token = localStorage.getItem("token");
        if (token) {
            axios.defaults.headers.common["x-auth-token"] = token;
        } else {
            delete axios.defaults.headers.common["x-auth-token"];
            return
        }
        const response = await axios.get("https://spit.elliott-project.com/users");
        user = response.data
        $('#login').detach()
        document.querySelector('#idk').appendChild(htmlToElement(
            `<span id='logout' class='cursor-pointer'>Log out</span>`
        ))
        document.querySelector('#logout').onclick = () => {
            localStorage.removeItem('token')
            elt = htmlToElement(`
                <div id="alert" class="py-4 px-8 font-[600] bg-green-600 text-xl rounded-lg text-white">
                    Logged out!
                </div>
                `)
            document.querySelector('#alert-div').appendChild(elt)
            setTimeout(() => {
                document.querySelector('#alert-div').removeChild(elt)
                window.location.reload()
            }, 1000)
        }
    } catch (error) {
        console.log(error)
    }
}

$('document').ready(async () => {
    await loadUser()
    if (!user) {
        window.location.href = 'login.html'
    }
    preferredCats = {}
    const response = await axios.get('https://spit.elliott-project.com/category')
    const preferred = await axios.get('https://spit.elliott-project.com/interest/' + user.userid)
    for (let category of response.data) {
        let option = document.createElement('div')
        option.className = 'p-2 rounded-md'
        option.innerText = category.category
        option.setAttribute('id', 'category' + category.categoryid)
        document.querySelector('#wrapper').appendChild(option)
    }
    for (let interest of preferred.data) {
        let tile = document.querySelector(`#category${interest.categoryid}`)
        tile.classList.add('bg-blue-700')
        preferredCats[interest.categoryid] = true
    }
    document.querySelectorAll('#wrapper>div').forEach(tile => { tile.classList.add('cursor-pointer'); tile.classList.add('text-center'); tile.classList.add('select-none') })
    document.querySelectorAll('#wrapper>div').forEach(tile => {
        if (!tile.classList.contains('bg-blue-700')) {
            preferredCats[parseInt(tile.id.slice(8))] = false
            tile.classList.add('bg-slate-500')
        }
    })
    document.querySelectorAll('#wrapper>div').forEach(tile => {
        tile.onclick = () => {
            let index = parseInt(tile.id.slice(8))
            preferredCats[index] = !preferredCats[index]
            if (preferredCats[index]) {
                tile.classList.remove('bg-slate-500')
                tile.classList.add('bg-blue-700')
            }
            else {
                tile.classList.add('bg-slate-500')
                tile.classList.remove('bg-blue-700')
            }
        }
    })
    document.querySelector('form').onsubmit = async e => {
        e.preventDefault()
        let legit = []
        for (property in preferredCats) {
            if (preferredCats[property]) legit.push(property)
        }
        legit = legit.join(',')
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const body = JSON.stringify({ categoryids: legit })
            await axios.post('https://spit.elliott-project.com/interest/' + user.userid, body, config)
            elt = htmlToElement(`
                <div id="alert" class="py-4 px-8 font-[600] bg-green-600 text-xl rounded-lg text-white">
                    Preference updated!
                </div>
                `)
            document.querySelector('#alert-div').appendChild(elt)
            setTimeout(() => {
                document.querySelector('#alert-div').removeChild(elt)
                window.location.href = 'products.html'
            }, 1000)
        } catch (error) {
            console.log(error)
            error.response.data.errors.forEach(async error => {
                elt = htmlToElement(`
                <div id="alert" class="py-4 px-8 font-[600] bg-red-600 text-xl rounded-lg text-white">
                    ${error.msg}
                </div>
                `)
                document.querySelector('#alert-div').appendChild(elt)
                setTimeout(() => {
                    document.querySelector('#alert-div').removeChild(elt)
                }, 3000)
            })
        }
    }


})