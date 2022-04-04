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
        const response = await axios.get("http://localhost:5000/users");
        $('#login').detach()
        document.querySelector('#idk').appendChild(htmlToElement(
            `<span id='logout' class='cursor-pointer'>Log out</span>`
        ))
        document.querySelector('#logout').onclick = () => {
            localStorage.removeItem('token')
            window.location.reload()
        }
    } catch (error) {
        console.log(error)
    }
}


loadUser()

$('#search-form').submit(async e => {
    e.preventDefault()
    let formData = {};
    document.querySelectorAll('input').forEach(input => {
        formData[input.name] = input.value
    })
    let brand = formData.brand
    let keyword = formData.keyword
    window.location.href = `search.html?brand=${brand ? brand : ''}&keyword=${keyword ? keyword : ''}`
})



const response = await axios.get('http://localhost:5000')
console.log(response.data)