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
    let p = $('#container').detach()
    let id = window.location.href.split('?')[1].split('=')[1]
    try {
        const response = await axios.get(`https://spit.elliott-project.com/product/${id}`)
        const reviewsResponse = await axios.get(`https://spit.elliott-project.com/product/${id}/review`)
        let allReviews = reviewsResponse.data
        allReviews = allReviews.sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at)
        })
        let product = response.data
        let averageRating = 0
        for (let review of allReviews) averageRating += review.rating
        if (allReviews.length > 0) {
            averageRating = averageRating / allReviews.length
        }
        $('#spinner').detach()
        p.appendTo('body')
        let elt1 = htmlToElement(
            `
            <div class="flex flex-col space-y-6 items-center w-[40%]">
            <h1 class="text-2xl font-[600]"><span class="text-red-600">Category: </span><u>${product.categoryname}</u></h1>
            <img class="w-full" src=${product.img_name ? `https://spit.elliott-project.com/${product.img_name}` : product.img_src} alt=${product.name} >
        </div>

        
            `
        )
        let elt2 = htmlToElement(`<div class="flex justify-center flex-col w-[60%] space-y-6">
        <h1 class="font-[600] text-3xl">${product.name}</h1> 
        <h1 class="font-[600] text-2xl">Brand: ${product.brand}</h1> 
        <h2 class="font-[600] text-2xl text-red-600">S$${product.price}</h2>
        <h4 class="font-[600]">Average rating: ${averageRating}/5</h4>
        <div class="space-y-6">
            <h2 class="font-[600] text-2xl">Product Description:</h2>
            <p>${product.description}</p>
        </div>

    </div> `)
        document.querySelector('#product').appendChild(elt1)
        document.querySelector('#product').appendChild(elt2)

        document.querySelectorAll('img').forEach(img => {
            console.log('error loading src:', img.src)
            img.onerror = () => img.src = 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg'
        })
        allReviews.forEach(review => {
            let stars = ''
            let yes = moment(review.created_at)
            for (let i = 0; i < review.rating; i++) {
                stars += '<i class="fi select-none text-yellow-500 fi-sr-star"></i>'
            }
            for (let i = 0; i < 5 - review.rating; i++) {
                stars += '<i class="fi select-none text-black fi-sr-star"></i>'
            }
            elt1 = htmlToElement(`
            <div class="review border-2 rounded-md">
          <div
            class="author rounded-tr-md px-4 rounded-tl-md bg-slate-400 flex items-center"
          >
            <h3 class="mr-4 text-xl py-1 font-[600]">${review.username}</h3>
            <span>~ ${moment.duration(yes.diff(Date.now())).humanize()} ago</span>
          </div>

          <div class="p-4 rounded-br-md rounded-bl-md bg-white">
            <div class="stars">
            ${stars}
            </div>
            ${review.review}
          </div>
        </div>
            `)
            document.querySelector('#review-div').appendChild(elt1)
        })


        let formData = { rating: 0 }
        document.querySelectorAll('.rs').forEach(star => {
            star.onclick = (e) => {
                let index = parseInt(e.target.id[4])
                if (index == 1 && formData.rating == 1) {
                    formData.rating = 0
                    document.querySelectorAll('.rs').forEach(star => {
                        star.classList.remove('text-yellow-500')
                        star.classList.add('text-black')
                    })
                    return
                }
                formData.rating = index
                document.querySelectorAll('.rs').forEach(star => {
                    star.classList.remove('text-yellow-500')
                    star.classList.add('text-black')
                })
                for (let i = 1; i <= index; i++) {
                    let yes = document.querySelector(`#star${i}`).classList
                    yes.add('text-yellow-500')
                    yes.remove('text-black')
                }
            }
            document.querySelector('button').onclick = async () => {
                let review = document.querySelector('input')
                formData[review.name] = review.value
                const config = {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                const body = JSON.stringify(formData)
                try {
                    await axios.post(`https://spit.elliott-project.com/product/${id}/review`, body, config)
                    window.location.reload()
                } catch (error) {
                    console.log(error)
                    if (error.response.status === 401) {
                        for (let alert of document.querySelector('#alert-div').children) {
                            if (alert.innerText == 'Please log in first!') {
                                return
                            }
                        }
                        elt = htmlToElement(`
                        <div id="alert" class="py-4 px-8 font-[600] bg-red-600 text-xl rounded-lg text-white">
                            Please log in first!
                        </div>
                        `)
                        document.querySelector('#alert-div').appendChild(elt)
                        setTimeout(() => {
                            document.querySelector('#alert-div').removeChild(elt)
                        }, 3000)
                        return
                    }
                    error.response.data.errors.forEach(async error => {
                        for (let alert of document.querySelector('#alert-div').children) {
                            if (alert.innerText == error.msg) {
                                return
                            }
                        }
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
    } catch (error) {
        console.log(error)
    }
})