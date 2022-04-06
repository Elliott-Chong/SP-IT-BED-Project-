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
        if (user.type === 'Customer') {
            document.querySelector('#idk').appendChild(htmlToElement(
                `<li><a id="preference" href="preference.html">Update preference</a></li>`
            ))
            document.querySelector('#idk').appendChild(htmlToElement(
                `<li><a id="suggested_listings" href="suggested.html">Suggested listings</a></li>`
            ))
        }
        if (user.type === 'Admin') {
            document.querySelector('#idk').appendChild(htmlToElement(
                `<li><a id="new_product" href="new_product.html">Add new product</a></li>`
            ))
            document.querySelector('#idk').appendChild(htmlToElement(
                `<li><a id="new_category" href="new_category.html">Add new category</a></li>`
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
    let p = $('#products').detach()
    let response = await axios.get('https://spit.elliott-project.com/product')
    $('#spinner').detach()
    p.appendTo('body')

    let products = response.data
    products.forEach((product) => {
        let item = htmlToElement(`
        <div id="item" class="flex mx-2 flex-col h-fit border-2 justify-center text-center space-y-4 w-72 items-center p-4">
            <img src=${product.img_name ? `https://spit.elliott-project.com/${product.img_name}` : product.img_src} alt=${product.name} >
            <a href="details.html?id=${product.id}">${product.name}</a>
        </div>
        `)
        document.querySelector('#products').appendChild(item)
    })
    document.querySelectorAll('img').forEach(img => {
        console.log('error loading src:', img.src)
        img.onerror = () => img.src = 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg'
    })
})
