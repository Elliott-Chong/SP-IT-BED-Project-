const express = require('express')
const cors = require('cors')
const connection = require('./db.js')
const util = require('util')
const { body, validationResult } = require('express-validator')
const query = util.promisify(connection.query).bind(connection)
const app = express();
const PORT = 5002;
const auth = require('./authMiddleware')
app.use(
    cors()
);

app.use(express.json({ extended: false }));


app.get("/", (req, res) => res.send("SPIT API running"));


app.use("/users", require("./routes/users"));
app.use("/category", require("./routes/categories"));
app.use("/product", require('./routes/products'))
app.post("/interest/:userid", body("categoryids", 'Please enter valid categoryids').not().isEmpty(), async (req, res) => {
    const userid = req.params.userid
    const { categoryids } = req.body
    try {
        await query("DELETE FROM Interests WHERE userid=?", userid)
        if (categoryids == '') return res.status(200).send('no categories')
        for (let categoryid of categoryids.split(',')) {
            await query("INSERT INTO Interests (userid, categoryid) VALUES (?, ?)", [userid, categoryid])
        }
        return res.status(201).send("Created")
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error')
    }
})
app.get("/interest/:userid", auth, async (req, res) => {
    const userid = req.params.userid
    try {
        let response = await query("SELECT userid, categoryid, Categories.name FROM Interests join Categories on Categories.id=Interests.categoryid where userid=?;", userid)
        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error')
    }
})

app.get("/suggested", auth, async (req, res) => {
    try {
        let finalRes = []
        let prefCats = await query("SELECT * FROM Interests where userid=?", req.user.id)
        for (let category of prefCats) {
            finalRes.push(...await query("SELECT * FROM Products where categoryid=?", [category.categoryid]))
        }
        return res.status(200).json(finalRes)
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error')
    }
})

app.listen(process.env.PORT || PORT, () =>
    console.log("Server Running on http://localhost:5002")
);
