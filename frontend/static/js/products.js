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
        const response = await axios.get("https://spai.elliott-project.com/users");
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
            console.log(elt)
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
    let p = $('#products').detach()
    let response = await axios.get('https://spai.elliott-project.com/product')
    $('#spinner').detach()
    p.appendTo('body')

    let products = response.data
    products.forEach((product) => {
        let item = htmlToElement(`
        <div id="item" class="flex mx-2 flex-col h-fit border-2 justify-center text-center space-y-4 w-72 items-center p-4">
            <img src="data:image/jpeg;base64,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" alt="">
            <a href="details.html?id=${product.id}">${product.name}</a>
        </div>
        `)
        document.querySelector('#products').appendChild(item)
    })
})
