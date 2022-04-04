const express = require('express')
const cors = require('cors')
const connection = require('./db.js')
const util = require('util')
const { body, validationResult } = require('express-validator')
const query = util.promisify(connection.query).bind(connection)
const app = express();
const PORT = 5002;
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
        for (let categoryid of categoryids.split(',')) {
            await query("INSERT INTO Interests (userid, categoryid) VALUES (?, ?)", [userid, categoryid])
        }
        return res.status(201).send("Created")
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error')
    }
})
app.get("/interest/", async (req, res) => {
    try {
        let response = await query("SELECT * FROM Interests;")
        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return res.status(500).send('Internal Server Error')
    }
})

app.listen(process.env.PORT || PORT, () =>
    console.log("Server Running on http://localhost:5002")
);
