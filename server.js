const express = require("express")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

module.exports = app

app.use("/css", express.static(path.join(__dirname, "/public/css")))
app.use("/scripts", express.static(path.join(__dirname, "/public/scripts")))
app.use("/favicon", express.static(path.join(__dirname, "/static/favicon")))
app.use("/fonts", express.static(path.join(__dirname, "/static/fonts/STAR4-wf")))
app.use("/icons", express.static(path.join(__dirname, "/static/icons")))
app.use("/html", express.static(path.join(__dirname, "/html")))

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "/html/desktop.html")))

app.listen(PORT, () => console.log(`App up at PORT ${PORT}`))