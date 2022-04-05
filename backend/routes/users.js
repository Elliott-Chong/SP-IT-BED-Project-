const router = require('express').Router()
const bcrypt = require('bcryptjs')
const connection = require('../db.js')
const util = require('util')
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const adminAuth = require('../adminAuth')
const auth = require('../authMiddleware.js')
const query = util.promisify(connection.query).bind(connection)



router.post('/',
    body('username', 'Please provide a valid username.').not().isEmpty(),
    body('email', 'Please provide a valid email address.').isEmail(),
    body('contact', 'Please provide a valid contact number.').not().isEmpty().isNumeric().isLength({ max: 8, min: 8 }),
    body('password', 'Password must be at least 6 digits long.').isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { username, email, contact, password, profile_pic_url, password1 } = req.body
        if (password !== password1) {
            return res.status(400).json({ errors: [{ msg: "Passwords not not match!" }] })
        }

        try {
            const response = await query('SELECT * FROM Users where email=? or username=? or contact=?', [email, username, contact]);
            if (response.length > 0) {
                return res.status(400).json({ errors: [{ msg: "Email or username or contact has already been taken." }] })
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const results = await query("INSERT INTO Users (username, email, contact, password, type, profile_pic_url) VALUES (?,?,?,?,?,?)", [username, email, contact, hashedPassword, 'Customer', profile_pic_url])
            return res.status(201).json({ userid: results.insertId })
        } catch (error) {
            console.log(error)
            return res.status(500).send('Internal Server Error')
        }
    })


router.post('/login', async (req, res) => {
    const { username, password } = req.body
    try {
        const response = await query("SELECT * FROM Users WHERE username=?", [username])
        if (response.length == 0) {
            return res.status(400).json({ errors: [{ msg: "Invalid username or password!" }] })
        }
        if (await bcrypt.compare(password, response[0].password)) {
            const payload = {
                user: {
                    id: response[0].id,
                },
            };
            jwt.sign(
                payload,
                'hello',
                { expiresIn: 360000000 },
                (err, token) => {
                    if (err) throw err;
                    return res.json({ token });
                }
            );
        }
        else {
            return res.status(400).json({ errors: [{ msg: "Invalid username or password!" }] })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error')
    }
})

router.get('/', auth,
    async (req, res) => {
        try {
            const response = await query('SELECT id as userid, username, email, contact, type,profile_pic_url, created_at from Users where id=?;', [req.user.id])
            return res.status(200).json(response[0])
        } catch (error) {
            return res.status(500).send('Internal Server Error')
        }
    })



router.get('/:id',
    async (req, res) => {
        try {
            const response = await query('SELECT id as userid, username, email, contact, type,profile_pic_url, created_at from Users where id=?;', [req.params.id])
            return res.status(200).json(response[0])
        } catch (error) {
            return res.status(500).send('Internal Server Error')
        }
    })

router.put('/:id', async (req, res) => {
    const { username, email, contact, password, type, profile_pic_url } = req.body
    const id = req.params.id
    try {
        let response = await query("SELECT id from Users where email=?", [email])
        if (response.length > 0 && response[0].id != id) {
            return res.status(422).send('Unprocessable Entity')
        }
        response = await query("SELECT id from Users where username=?", [username])
        if (response.length > 0 && response[0].id != id) {
            return res.status(422).send('Unprocessable Entity')
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const results = await query("UPDATE Users SET username=?, email=?, contact=?, password=?, type=?, profile_pic_url=? WHERE id=?", [username, email, contact, hashedPassword, type, profile_pic_url, req.params.id])
        return res.status(204).send('No Content')
    } catch (error) {
        // console.log(error)
        return res.status(500).send('Internal Server Error')
    }
})


module.exports = router