const fs = require("fs")
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/

const verifierRegex = /contract Verifier/

const path = require("path")
const fileNames = ["HelloWorldVerifier", "Multiplier3Verifier", "Multiplier3Verifier_plonk"]

for (const fn of fileNames) {
    let content = fs.readFileSync(path.resolve(__dirname, `../contracts/${fn}.sol`), { encoding: "utf-8" })
    let bumped = content.replace(solidityRegex, "pragma solidity ^0.8.0")
    bumped = bumped.replace(verifierRegex, `contract ${fn}`)
    fs.writeFileSync(path.resolve(__dirname, `../contracts/${fn}.sol`), bumped)
}
