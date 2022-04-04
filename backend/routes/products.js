const router = require('express').Router()
const connection = require('../db.js')
const util = require('util')
const { body, validationResult } = require('express-validator')
const query = util.promisify(connection.query).bind(connection)
const auth = require('../authMiddleware')


router.post('/',
    body('name', "Please provide a valid name.").not().isEmpty(),
    body('description', 'Please provide a valid description').not().isEmpty(),
    body('categoryid', 'Please provide a valid categoryid').isInt(),
    body("brand", 'Please provide a valid brand').not().isEmpty(),
    body('price', 'Please provide a valid price').isNumeric().not().isEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, description, categoryid, brand, price } = req.body
        try {
            const results = await query("INSERT INTO Products (name, description, categoryid, brand, price) VALUES (?,?,?,?,?)", [name, description, categoryid, brand, price])
            return res.status(201).json({ productid: results.insertId })
        } catch (error) {
            return res.status(500).send('Internal Server Error')
        }
    }
)

router.post('/search', async (req, res) => {
    let { brand, keyword } = req.body
    try {
        let response;
        if (brand === '' && keyword === '') {
            return res.status(200).json([])
        }
        brand = '%' + brand.replace('%20', ' ') + '%'
        keyword = '%' + keyword.replace('%20', ' ') + '%'
        if (brand && keyword) {
            response = await query("SELECT * FROM Products WHERE brand like ? and name like ?", [brand, keyword])
        }
        else if (brand) {
            response = await query("SELECT * FROM Products WHERE brand like ?", [brand])
        }
        else if (keyword) {
            response = await query("SELECT * FROM Products WHERE name like ?", [keyword])
        }
        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error')
    }
})

router.get('/:id', async (req, res) => {
    const id = req.params.id
    try {
        const result = await query("SELECT Products.name as name, Products.description as description, categoryid, Categories.name as categoryname, brand, price from Products inner join Categories on Products.categoryid=Categories.id where Products.id=?;", [id])
        return res.status(200).json(result[0])
    } catch (error) {
        return res.status(500).send('Internal Server Error')
    }
})

router.get('/', async (req, res) => {
    try {
        const result = await query("SELECT * FROM Products")
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).send('Internal Server Error')
    }
})

router.delete('/:id', async (req, res) => {
    const id = req.params.id
    try {
        await query("DELETE FROM Products WHERE id=?", [id])
        return res.status(204).send("No Content")
    } catch (error) {
        return res.status(500).send('Internal Server Error')
    }
})

router.post('/:id/review', auth,
    body('rating', 'Please provide a valid rating').isInt({ min: 0, max: 5 }),
    body("review", 'Please provide a valid review').not().isEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { rating, review } = req.body
        try {
            const results = await query("INSERT INTO Reviews (userid, productid, rating, review) VALUES (?,?,?,?)", [req.user.id, req.params.id, rating, review])
            return res.status(201).json({ reviewid: results.insertId })
        } catch (error) {
            console.log(error)
            return res.status(500).send('Internal Server Error')
        }
    }
)

router.get('/:id/review',
    async (req, res) => {
        try {
            const results = await query("SELECT Products.id as productid, Users.id as userid, Users.username as username, Reviews.rating as rating, Reviews.review as review, Reviews.created_at as created_at from Products inner join Reviews on Products.id=Reviews.productid join Users on Users.id=Reviews.userid WHERE Products.id=?", [req.params.id])
            return res.status(200).json(results)
        } catch (error) {
            console.log(error)
            return res.status(500).send('Internal Server Error')
        }
    }
)





module.exports = router