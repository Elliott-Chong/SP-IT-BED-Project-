let user;


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
    if (user.type !== 'Admin') {
        window.location.href = 'products.html'
        return
    }
    try {




        document.querySelector('form').onsubmit = async (e) => {
            e.preventDefault()
            let formData = {}
            document.querySelectorAll('input').forEach(input => {
                formData[input.name] = input.value
            })

            document.querySelectorAll('textarea').forEach(input => {
                formData[input.name] = input.value
            })
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            try {
                await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${formData.category}`)
            } catch (error) {
                for (let alert of document.querySelector('#alert-div').children) {
                    if (alert.innerText == 'Invalid word') {
                        return
                    }
                }
                elt = htmlToElement(`
                <div id="alert" class="py-4 px-8 font-[600] bg-red-600 text-xl rounded-lg text-white">
                    Invalid word
                </div>
                `)
                document.querySelector('#alert-div').appendChild(elt)
                setTimeout(() => {
                    document.querySelector('#alert-div').removeChild(elt)
                }, 3000)
                return
            }
            const body = JSON.stringify(formData)
            console.log(body)
            try {

                await axios.post('https://spit.elliott-project.com/category', body, config)
                elt = htmlToElement(`
                <div id="alert" class="py-4 px-8 font-[600] bg-green-600 text-xl rounded-lg text-white">
                Success!
                </div>
                `)
                document.querySelector('#alert-div').appendChild(elt)

                setTimeout(() => {
                    document.querySelector('#alert-div').removeChild(elt)
                    window.location.href = 'products.html'
                }, 1000)
            } catch (error) {

                if (error.response.status === 401) {
                    for (let alert of document.querySelector('#alert-div').children) {
                        if (alert.innerText == 'Unauthorized Access') {
                            return
                        }
                    }
                    elt = htmlToElement(`
                    <div id="alert" class="py-4 px-8 font-[600] bg-red-600 text-xl rounded-lg text-white">
                        Unauthorized Access
                    </div>
                    `)
                    document.querySelector('#alert-div').appendChild(elt)
                    setTimeout(() => {
                        document.querySelector('#alert-div').removeChild(elt)
                    }, 3000)
                    return
                }
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

    } catch (error) {
        console.log(error)
    }
})
