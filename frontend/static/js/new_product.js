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
        if (user.type === 'Admin') {
            document.querySelector('#idk').appendChild(htmlToElement(
                `<li><a id="new_product" href="new_product.html">Add new product</a></li>`
            ))
        }
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
    try {
        const response = await axios.get('https://spit.elliott-project.com/category')
        for (let category of response.data) {
            let option = document.createElement('option')
            option.innerText = category.category
            option.setAttribute('value', category.categoryid)
            document.querySelector('select').appendChild(option)
        }

        document.querySelector('form').onsubmit = async (e) => {
            e.preventDefault()
            let formData = {}
            document.querySelectorAll('input').forEach(input => {
                formData[input.name] = input.value
            })
            document.querySelectorAll('select').forEach(input => {
                formData[input.name] = input.value
            })
            document.querySelectorAll('textarea').forEach(input => {
                formData[input.name] = input.value
            })
            formData.price = new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: 'SGD'
            }).format(formData.price).slice(4)
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const body = JSON.stringify(formData)
            const response = await axios.post('https://spit.elliott-project.com/product', body, config)
            console.log(response.data)
        }

    } catch (error) {
        console.log(error.response)
        console.log(error.message)
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
})
