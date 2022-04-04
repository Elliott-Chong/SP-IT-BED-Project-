const router = require('express').Router()
const connection = require('../db.js')
const util = require('util')
const { body, validationResult } = require('express-validator')
const query = util.promisify(connection.query).bind(connection)


router.post('/',
    body('category', 'Please enter a valid category.').not().isEmpty(),
    body('description', 'Please enter a valid description.').not().isEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, email, contact, password, type, profile_pic_url } = req.body
        const { category, description } = req.body
        try {
            let response = await query('SELECT * FROM Categories WHERE name=?', [category])
            if (response.length > 0) {
                return res.status(422).send('Unprocessable Entity')
            }
            await query("INSERT INTO Categories (name, description) VALUES (?, ?)", [category, description])
            return res.status(204).send('No Content')
        } catch (error) {
            return res.status(500).send('Internal Server Error')
        }
    }
)


router.get('/',
    async (req, res) => {
        try {
            let response = await query("SELECT id as categoryid, name as category, description FROM Categories;")
            return res.status(200).json(response)
        } catch (error) {
            return res.status(500).send('Internal Server Error')
        }
    }
)


module.exports = router