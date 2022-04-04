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
        averageRating = averageRating / allReviews.length
        $('#spinner').detach()
        p.appendTo('body')
        let elt1 = htmlToElement(
            `
            <div class="flex flex-col space-y-6 items-center w-[40%]">
            <h1 class="text-2xl font-[600]"><span class="text-red-600">Category: </span><u>${product.categoryname}</u></h1>
            <img class="w-full" src="data:image/jpeg;base64,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" alt="image">
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