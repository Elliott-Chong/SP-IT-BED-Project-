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
    loadUser()
    let registerForm = document.querySelector('form')
    registerForm.onsubmit = async e => {
        let formData = {}

        document.querySelectorAll('input').forEach(input => {
            formData[input.name] = input.value.trim()
        })

        e.preventDefault()
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const body = JSON.stringify(formData)
        let elt
        try {
            const response = await axios.post('https://spit.elliott-project.com/users', body, config)
            elt = htmlToElement(`
                <div id="alert" class="py-4 px-8 font-[600] bg-green-600 text-xl rounded-lg text-white">
                    Account created!
                </div>
                `)
            document.querySelector('#alert-div').appendChild(elt)
            setTimeout(() => {
                document.querySelector('#alert-div').removeChild(elt)
                window.location.href = 'login.html'
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
